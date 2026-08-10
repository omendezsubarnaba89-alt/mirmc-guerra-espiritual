(() => {
  const cloud=window.MIRMCCloud;
  const params=new URLSearchParams(location.search);
  const type=params.get('type');
  const key=params.get('key');
  const loading=document.querySelector('#previewLoading');
  const denied=document.querySelector('#previewDenied');
  const article=document.querySelector('#previewArticle');
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  function staticPayload(){
    if(type==='lesson') return window.MIRMC_COURSE_DATA?.lessons?.[key]||null;
    if(type==='resource') return window.MIRMC_LIBRARY?.resources?.find(x=>x.id===key)||null;
    return null;
  }

  async function getDraft(session){
    const cfg=cloud.config();
    const response=await fetch(`${cfg.supabaseUrl}/functions/v1/content-management`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`,apikey:cfg.supabasePublishableKey},body:JSON.stringify({action:'get_item',content_type:type,content_key:key})});
    const body=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(body?.error||'preview_failed');
    return body.item?.draft_payload||body.item?.published_payload||staticPayload();
  }

  function block(label,title,body){return `<section class="preview-block"><small>${esc(label)}</small>${title?`<h2>${esc(title)}</h2>`:''}<p>${esc(body||'')}</p></section>`;}

  function renderLesson(p){
    const sections=(p.sections||[]).map((s,i)=>block(`${String(i+1).padStart(2,'0')} / ${String((p.sections||[]).length).padStart(2,'0')}`,s.title,s.body)).join('');
    const points=(p.keyPoints||[]).map(x=>`<li>${esc(x)}</li>`).join('');
    const quiz=(p.quiz||[]).map((q,i)=>`<li><strong>${i+1}. ${esc(q.q)}</strong> · ${esc((q.options||[])[q.answer]||'')}</li>`).join('');
    return `<p class="preview-eyebrow">LECCIÓN ${esc(key)} · NIVEL ${esc(p.level)}</p><h1>${esc(p.title)}</h1><p class="preview-subtitle">${esc(p.subtitle)}</p><div class="preview-meta"><span>${esc(p.duration)}</span><span>BORRADOR PRIVADO</span></div><div class="preview-scriptures">${(p.scriptures||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div>${block('OBJETIVO','',p.objective)}<section class="preview-block"><small>IDEA CENTRAL</small><blockquote>${esc(p.core)}</blockquote></section>${sections}<section class="preview-block"><small>PUNTOS CLAVE</small><ol class="preview-list">${points}</ol></section>${block('EJERCICIO','',p.practice)}${block('REFLEXIÓN','',p.reflection)}<section class="preview-block"><small>QUIZ · RESPUESTAS CORRECTAS VISIBLES SOLO EN PREVIEW</small><ol class="preview-list">${quiz}</ol></section>`;
  }

  function renderResource(p){
    const sections=(p.sections||[]).map((s,i)=>block(`${String(i+1).padStart(2,'0')} / ${String((p.sections||[]).length).padStart(2,'0')}`,s?.[0],s?.[1])).join('');
    return `<p class="preview-eyebrow">${esc(String(p.category||'RECURSO').toUpperCase())} · NIVEL ${esc(p.level)}</p><h1>${esc(p.title)}</h1><p class="preview-subtitle">${esc(p.subtitle)}</p><div class="preview-meta"><span>${esc(p.format)}</span><span>${esc(p.duration)}</span><span>BORRADOR PRIVADO</span></div><div class="preview-scriptures">${(p.scriptures||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div>${block('RESUMEN','',p.summary)}${sections}<section class="preview-block"><small>PARA RETENER</small><blockquote>${esc(p.takeaway)}</blockquote></section>`;
  }

  async function boot(){
    if(!['lesson','resource'].includes(type)||!key||!cloud?.configured()){loading.hidden=true;denied.hidden=false;return;}
    const client=await cloud.getClient();const {data}=await client.auth.getSession();const session=data?.session;
    if(!session){loading.hidden=true;denied.hidden=false;return;}
    const {data:role}=await client.from('user_roles').select('role,active').eq('user_id',session.user.id).maybeSingle();
    if(!role?.active||!['admin','super_admin'].includes(role.role)){loading.hidden=true;denied.hidden=false;return;}
    const payload=await getDraft(session);
    if(!payload){loading.textContent='No existe un borrador ni contenido base para este elemento.';return;}
    document.title=`Preview · ${payload.title||key} | MIRMC`;
    article.innerHTML=type==='lesson'?renderLesson(payload):renderResource(payload);
    loading.hidden=true;article.hidden=false;
  }
  boot().catch(err=>{loading.textContent=`No se pudo cargar la vista previa: ${err.message}`;});
})();
