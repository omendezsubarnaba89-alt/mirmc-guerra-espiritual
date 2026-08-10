(() => {
  const cloud=window.MIRMCCloud;
  const roleBox=document.querySelector('#certAdminRole');
  const denied=document.querySelector('#certAdminDenied');
  const app=document.querySelector('#certAdminApp');
  const summary=document.querySelector('#certAdminSummary');
  const search=document.querySelector('#certAdminSearch');
  const refresh=document.querySelector('#certAdminRefresh');
  const message=document.querySelector('#certAdminMessage');
  const list=document.querySelector('#certAdminList');
  let session=null,role='student',certificates=[];

  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const fmt=v=>{if(!v)return '—';try{return new Intl.DateTimeFormat('es',{dateStyle:'medium'}).format(new Date(v));}catch{return '—';}};
  const setMessage=(text,type='')=>{message.className=`cert-admin-message ${type}`.trim();message.textContent=text||'';};

  async function call(action,payload={}){
    const cfg=cloud.config();
    const response=await fetch(`${cfg.supabaseUrl}/functions/v1/certificate-management`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`,apikey:cfg.supabasePublishableKey},body:JSON.stringify({action,...payload})});
    const body=await response.json().catch(()=>({}));
    if(!response.ok){
      const map={forbidden:'No tienes permisos para administrar certificados.',super_admin_required:'Solo Super Admin puede cambiar el estado de un certificado.',certificate_not_found:'El certificado ya no existe.'};
      throw new Error(map[body?.error]||'No se pudo completar la operación.');
    }
    return body;
  }

  function renderSummary(){
    const active=certificates.filter(x=>x.status==='active').length;
    const revoked=certificates.filter(x=>x.status==='revoked').length;
    const avg=certificates.length?Math.round(certificates.reduce((sum,x)=>sum+Number(x.average||0),0)/certificates.length):0;
    summary.innerHTML=`<div><small>EMITIDOS</small><strong>${certificates.length}</strong></div><div><small>ACTIVOS</small><strong>${active}</strong></div><div><small>REVOCADOS</small><strong>${revoked}</strong></div><div><small>PROMEDIO</small><strong>${avg}%</strong></div>`;
  }

  function card(cert){
    const revoked=cert.status==='revoked';
    const canEdit=role==='super_admin';
    return `<article class="cert-admin-card" data-cert-id="${esc(cert.id)}"><div class="cert-admin-head"><div><h2>${esc(cert.participant_name)}</h2><div class="cert-admin-code">${esc(cert.certificate_code)}</div></div><span class="cert-admin-status ${revoked?'revoked':''}">${revoked?'REVOCADO':'ACTIVO'}</span></div><div class="cert-admin-metrics"><div><small>PROMEDIO</small><strong>${Number(cert.average||0)}%</strong></div><div><small>FINALIZACIÓN</small><strong>${fmt(cert.completion_date)}</strong></div><div><small>EMISIÓN</small><strong>${fmt(cert.issued_at)}</strong></div><div><small>RUTA</small><strong>${Number(cert.lessons_completed||0)}/15 · ${Number(cert.exams_passed||0)}/3</strong></div></div>${revoked&&cert.revocation_reason?`<div class="cert-admin-reason"><strong>Motivo:</strong> ${esc(cert.revocation_reason)}</div>`:''}<div class="cert-admin-actions"><a class="button button-ghost" target="_blank" rel="noopener" href="verify-certificate.html?code=${encodeURIComponent(cert.certificate_code)}">Abrir verificador ↗</a>${canEdit?`<button type="button" class="${revoked?'reinstate':''}" data-action="${revoked?'reinstate':'revoke'}">${revoked?'Reactivar registro':'Revocar certificado'}</button>`:''}</div></article>`;
  }

  function render(){
    const q=(search.value||'').trim().toLowerCase();
    const filtered=!q?certificates:certificates.filter(x=>`${x.participant_name||''} ${x.certificate_code||''}`.toLowerCase().includes(q));
    list.innerHTML=filtered.length?filtered.map(card).join(''):'<div class="cert-admin-empty">No hay certificados que coincidan con la búsqueda.</div>';
  }

  async function load(){
    refresh.disabled=true;setMessage('Actualizando certificados…');
    try{const result=await call('admin_list');certificates=Array.isArray(result.certificates)?result.certificates:[];renderSummary();render();setMessage(`${certificates.length} certificado${certificates.length===1?'':'s'} en el registro.`,'success');}
    catch(error){setMessage(error.message,'error');}
    finally{refresh.disabled=false;}
  }

  list.addEventListener('click',async event=>{
    const button=event.target.closest('[data-action]');if(!button)return;
    const cardEl=button.closest('[data-cert-id]');const id=cardEl?.dataset?.certId;const action=button.dataset.action;if(!id||!action)return;
    let reason='';
    if(action==='revoke'){
      reason=prompt('Motivo de revocación (quedará visible en el verificador público):','Revocado por Administración MIRMC')||'';
      if(!reason.trim())return;
      if(!confirm('¿Revocar este certificado? El código seguirá existiendo, pero aparecerá como REVOCADO.'))return;
    } else if(!confirm('¿Reactivar este certificado? El verificador volverá a mostrarlo como ACTIVO.')) return;
    button.disabled=true;setMessage(action==='revoke'?'Revocando certificado…':'Reactivando certificado…');
    try{await call(action,{certificate_id:id,reason});await load();setMessage(action==='revoke'?'Certificado revocado y auditado.':'Certificado reactivado y auditado.','success');}
    catch(error){setMessage(error.message,'error');button.disabled=false;}
  });

  search.addEventListener('input',render);refresh.addEventListener('click',load);

  async function boot(){
    if(!cloud?.configured()){denied.hidden=false;roleBox.innerHTML='<span>ESTADO</span><strong>Nube no disponible</strong>';return;}
    const client=await cloud.getClient();const {data}=await client.auth.getSession();session=data?.session||null;
    if(!session){denied.hidden=false;roleBox.innerHTML='<span>ESTADO</span><strong>Inicia sesión</strong>';return;}
    const {data:roleData}=await client.from('user_roles').select('role,active').eq('user_id',session.user.id).maybeSingle();
    if(!roleData?.active||!['admin','super_admin'].includes(roleData.role)){denied.hidden=false;roleBox.innerHTML='<span>ROL</span><strong>Sin acceso</strong>';return;}
    role=roleData.role;roleBox.innerHTML=`<span>ROL AUTORIZADO</span><strong>${role==='super_admin'?'Super Admin':'Admin'}</strong>`;app.hidden=false;await load();
  }
  boot().catch(error=>{denied.hidden=false;roleBox.innerHTML='<span>ERROR</span><strong>No se pudo cargar</strong>';console.error(error);});
})();