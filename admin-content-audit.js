(() => {
  const cloud=window.MIRMCCloud;
  const roleBox=document.querySelector('#contentAuditRole');
  const loading=document.querySelector('#contentAuditLoading');
  const denied=document.querySelector('#contentAuditDenied');
  const app=document.querySelector('#contentAuditApp');
  const list=document.querySelector('#contentAuditList');
  const message=document.querySelector('#contentAuditMessage');
  const refresh=document.querySelector('#refreshContentAudit');
  let session=null;

  const labels={save_draft:'Borrador guardado',publish:'Contenido publicado',unpublish:'Publicación retirada',archive:'Override archivado',restore:'Override restaurado'};
  const fmt=v=>{try{return new Intl.DateTimeFormat('es',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));}catch{return '—';}};
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  async function callAudit(){
    const cfg=cloud.config();
    const response=await fetch(`${cfg.supabaseUrl}/functions/v1/content-management`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`,apikey:cfg.supabasePublishableKey},body:JSON.stringify({action:'audit'})});
    const body=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(body?.error==='super_admin_required'?'Solo Super Admin puede ver este historial.':'No se pudo cargar el historial editorial.');
    return body.events||[];
  }

  function render(events){
    if(!events.length){list.innerHTML='<div class="admin-loading">Todavía no existen eventos editoriales. El primer borrador o publicación aparecerá aquí.</div>';return;}
    list.innerHTML=events.map(e=>`<article class="audit-event"><div class="audit-event-head"><strong>${esc(labels[e.action]||e.action)} · ${esc(e.content_type)} ${esc(e.content_key)}</strong><time>${fmt(e.created_at)}</time></div><p>Actor: ${esc(String(e.actor_user_id||'sistema').slice(0,18))}${e.actor_user_id?'…':''}</p>${e.details&&Object.keys(e.details).length?`<div class="audit-change"><div><small>DETALLES</small><code>${esc(JSON.stringify(e.details,null,2))}</code></div></div>`:''}</article>`).join('');
  }

  async function load(){refresh.disabled=true;message.textContent='Actualizando…';try{const events=await callAudit();render(events);message.className='admin-message success';message.textContent=`${events.length} evento${events.length===1?'':'s'} editorial${events.length===1?'':'es'}.`;}catch(err){message.className='admin-message error';message.textContent=err.message;}finally{refresh.disabled=false;}}
  refresh.addEventListener('click',load);

  async function boot(){
    if(!cloud?.configured()){loading.hidden=true;denied.hidden=false;roleBox.innerHTML='<span>ESTADO</span><strong>Nube no disponible</strong>';return;}
    const client=await cloud.getClient();const {data}=await client.auth.getSession();session=data?.session||null;
    if(!session){loading.hidden=true;denied.hidden=false;roleBox.innerHTML='<span>ESTADO</span><strong>Inicia sesión</strong>';return;}
    const {data:role}=await client.from('user_roles').select('role,active').eq('user_id',session.user.id).maybeSingle();
    if(!role?.active||role.role!=='super_admin'){loading.hidden=true;denied.hidden=false;roleBox.innerHTML='<span>ROL</span><strong>Sin acceso</strong>';return;}
    roleBox.className='admin-role staff';roleBox.innerHTML='<span>ROL AUTORIZADO</span><strong>Super Admin</strong>';loading.hidden=true;app.hidden=false;await load();
  }
  boot().catch(()=>{loading.hidden=true;denied.hidden=false;});
})();
