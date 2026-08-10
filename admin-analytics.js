(() => {
  const cloud=window.MIRMCCloud;
  const roleBox=document.querySelector('#analyticsRole');
  const denied=document.querySelector('#analyticsDenied');
  const app=document.querySelector('#analyticsApp');
  const refresh=document.querySelector('#analyticsRefresh');
  const message=document.querySelector('#analyticsMessage');
  const summary=document.querySelector('#analyticsSummary');
  const funnel=document.querySelector('#analyticsFunnel');
  const exams=document.querySelector('#analyticsExams');
  const activity=document.querySelector('#analyticsActivity');
  const operations=document.querySelector('#analyticsOperations');
  let session=null;

  const setMessage=(text,type='')=>{message.className=`analytics-message ${type}`.trim();message.textContent=text||'';};
  const pct=(value,total)=>total?Math.round(Number(value||0)/Number(total||1)*100):0;

  async function callAnalytics(){
    const cfg=cloud.config();
    const response=await fetch(`${cfg.supabaseUrl}/functions/v1/academic-analytics`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`,apikey:cfg.supabasePublishableKey},body:'{}'});
    const body=await response.json().catch(()=>({}));
    if(!response.ok){const map={forbidden:'Tu cuenta no tiene acceso a la analítica académica.',invalid_session:'La sesión expiró.'};throw new Error(map[body?.error]||'No se pudo cargar la analítica.');}
    return body;
  }

  function render(data){
    const u=data.users||{};const c=data.certificates||{};const a=data.activity||{};
    summary.innerHTML=`<div><small>USUARIOS</small><strong>${Number(u.total||0)}</strong></div><div><small>CONFIRMADOS</small><strong>${Number(u.confirmed||0)}</strong></div><div><small>ACTIVIDAD OFICIAL</small><strong>${Number(u.with_official_activity||0)}</strong></div><div><small>RUTA COMPLETA</small><strong>${Number(u.completed_route||0)}</strong></div><div><small>CERT. ACTIVOS</small><strong>${Number(c.active||0)}</strong></div><div><small>SYNC 7 DÍAS</small><strong>${Number(a.synced_users_7d||0)}</strong></div>`;

    const base=Math.max(1,Number(u.with_official_activity||u.total||1));
    funnel.innerHTML=(data.lesson_funnel||[]).map(row=>{const p=Math.min(100,pct(row.passed_users,base));return `<div class="funnel-row"><span>${row.lesson_key}</span><div class="funnel-track" title="${Number(row.passed_users||0)} usuarios"><i style="width:${p}%"></i></div><b>${Number(row.passed_users||0)} · ${p}%</b></div>`;}).join('');

    exams.innerHTML=(data.exams||[]).map(row=>`<article><span>NIVEL ${Number(row.level||0)}</span><strong>${Number(row.passed_users||0)} aprobados</strong><p>Intentos 14d: ${Number(row.attempts_14d||0)} · intentos aprobados: ${Number(row.passed_attempts_14d||0)} · mejor promedio: ${Number(row.average_best_pct||0)}%</p></article>`).join('');

    const days=data.activity?.days||[];const max=Math.max(1,...days.flatMap(day=>[Number(day.lesson_passes||0),Number(day.exam_attempts||0),Number(day.certificates_issued||0)]));
    activity.innerHTML=days.map(day=>{const l=Math.max(2,Math.round(Number(day.lesson_passes||0)/max*100));const e=Math.max(2,Math.round(Number(day.exam_attempts||0)/max*100));const cert=Math.max(2,Math.round(Number(day.certificates_issued||0)/max*100));return `<div class="activity-day"><div class="activity-stack" title="${day.date} · lecciones ${day.lesson_passes} · exámenes ${day.exam_attempts} · certificados ${day.certificates_issued}"><i style="height:${l}%"></i><i style="height:${e}%"></i><i style="height:${cert}%"></i></div><small>${String(day.date||'').slice(5)}</small></div>`;}).join('');

    operations.innerHTML=`<article><span>SINCRONIZACIÓN</span><strong>${Number(a.synced_users_7d||0)} usuarios · 7 días</strong><p>${Number(a.synced_users_30d||0)} usuarios tuvieron una copia de aprendizaje actualizada en los últimos 30 días.</p></article><article><span>CERTIFICADOS</span><strong>${Number(c.active||0)} activos · ${Number(c.revoked||0)} revocados</strong><p>Promedio de los certificados activos: ${Number(c.average||0)}%.</p></article><article><span>PERSONAL</span><strong>${Number(u.staff||0)} cuentas administrativas</strong><p>${Number(u.active||0)} cuentas activas en total.</p></article>`;
  }

  async function load(){
    refresh.disabled=true;setMessage('Calculando indicadores agregados…');
    try{const data=await callAnalytics();render(data);setMessage(`Analítica actualizada · ${new Date(data.generated_at).toLocaleString('es')}.`,'success');}
    catch(error){setMessage(error.message,'error');}
    finally{refresh.disabled=false;}
  }

  refresh.addEventListener('click',load);

  async function boot(){
    if(!cloud?.configured()){denied.hidden=false;roleBox.innerHTML='<span>ESTADO</span><strong>Nube no disponible</strong>';return;}
    const client=await cloud.getClient();const {data}=await client.auth.getSession();session=data?.session||null;
    if(!session){denied.hidden=false;roleBox.innerHTML='<span>ESTADO</span><strong>Inicia sesión</strong>';return;}
    const {data:role}=await client.from('user_roles').select('role,active').eq('user_id',session.user.id).maybeSingle();
    if(!role?.active||!['admin','super_admin'].includes(role.role)){denied.hidden=false;roleBox.innerHTML='<span>ROL</span><strong>Sin acceso</strong>';return;}
    roleBox.innerHTML=`<span>ROL AUTORIZADO</span><strong>${role.role==='super_admin'?'Super Admin':'Admin'}</strong>`;app.hidden=false;await load();
  }

  boot().catch(error=>{denied.hidden=false;roleBox.innerHTML='<span>ERROR</span><strong>No se pudo cargar</strong>';console.error(error);});
})();