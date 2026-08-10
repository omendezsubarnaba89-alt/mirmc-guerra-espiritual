(() => {
  const $ = s => document.querySelector(s);
  const cloud = window.MIRMCCloud;
  const course = window.MIRMC_COURSE_DATA;
  const library = window.MIRMC_LIBRARY;
  const app = $('#contentApp');
  const denied = $('#contentDenied');
  const roleLabel = $('#contentRole');
  const itemsWrap = $('#contentItems');
  const form = $('#contentForm');
  const empty = $('#editorEmpty');
  const messageBox = $('#contentMessage');
  let client, session, role = 'student', activeType = 'lesson', remote = [], selected = null;

  const staticLessons = Object.entries(course?.lessons || {}).map(([key,payload],index) => ({ content_type:'lesson', content_key:key, payload, position:index+1, source:'static' }));
  const staticResources = (library?.resources || []).map((payload,index) => ({ content_type:'resource', content_key:payload.id, payload, position:index+1, source:'static' }));

  function msg(text,type='') { messageBox.className=`content-message ${type}`.trim(); messageBox.textContent=text||''; }
  function escapeHtml(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  function lines(v){return String(v||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);}
  function statusOf(item){
    if(item.archived) return 'ARCHIVADO';
    if(item.published_payload && item.draft_payload && JSON.stringify(item.published_payload)!==JSON.stringify(item.draft_payload)) return 'PUBLICADO · BORRADOR NUEVO';
    if(item.published_payload) return 'PUBLICADO';
    if(item.draft_payload) return 'BORRADOR';
    return 'GITHUB';
  }

  async function call(action,payload={}){
    const cfg=cloud.config();
    const response=await fetch(`${cfg.supabaseUrl}/functions/v1/content-management`,{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`,apikey:cfg.supabasePublishableKey},body:JSON.stringify({action,...payload})
    });
    const body=await response.json().catch(()=>({}));
    if(!response.ok){
      const map={forbidden:'No tienes permisos para administrar contenido.',super_admin_required:'Solo el Super Admin puede publicar o archivar.',invalid_content:'El contenido no pasó la validación.',content_too_large:'El contenido es demasiado grande.',draft_required:'Guarda primero un borrador.',item_not_found:'Ese override ya no existe.'};
      throw new Error(map[body?.error]||'No se pudo completar la operación.');
    }
    return body;
  }

  function combined(type){
    const base=(type==='lesson'?staticLessons:staticResources).map(x=>({...x}));
    const map=new Map(base.map(x=>[x.content_key,x]));
    remote.filter(x=>x.content_type===type).forEach(r=>{
      const prev=map.get(r.content_key)||{content_type:type,content_key:r.content_key,payload:r.draft_payload||r.published_payload||{},position:r.position,source:'cloud'};
      map.set(r.content_key,{...prev,...r,payload:r.draft_payload||r.published_payload||prev.payload,source:prev.source==='static'?'static+cloud':'cloud'});
    });
    return [...map.values()].sort((a,b)=>(a.position||999)-(b.position||999)||a.content_key.localeCompare(b.content_key));
  }

  function renderList(){
    const list=combined(activeType);
    itemsWrap.innerHTML=list.map(item=>{
      const p=item.draft_payload||item.published_payload||item.payload||{};
      const current=selected && selected.content_type===item.content_type && selected.content_key===item.content_key;
      return `<button class="content-item ${current?'active':''}" type="button" data-key="${escapeHtml(item.content_key)}"><small>${activeType==='lesson'?`LECCIÓN ${escapeHtml(item.content_key)}`:`${escapeHtml(p.category||'recurso').toUpperCase()} · NIVEL ${escapeHtml(p.level||'—')}`}</small><strong>${escapeHtml(p.title||item.content_key)}</strong><span class="${item.published_payload?'content-status':''}">${statusOf(item)}</span></button>`;
    }).join('');
  }

  function setSections(sections,type){
    $('#sectionRows').innerHTML='';
    const normalized=Array.isArray(sections)?sections:[];
    normalized.forEach(section=>addSection(type==='lesson'?section?.title:section?.[0],type==='lesson'?section?.body:section?.[1]));
    if(!normalized.length) addSection('','');
  }
  function addSection(title='',body=''){
    const row=document.createElement('div'); row.className='section-row';
    row.innerHTML=`<div><input data-section-title type="text" maxlength="180" placeholder="Título de sección" value="${escapeHtml(title)}" /><textarea data-section-body placeholder="Desarrollo">${escapeHtml(body)}</textarea></div><button type="button" data-remove-section>×</button>`;
    $('#sectionRows').appendChild(row);
  }

  function selectItem(type,key){
    const item=combined(type).find(x=>x.content_key===key); if(!item)return;
    selected=item; activeType=type; renderList(); empty.hidden=true; form.hidden=false;
    const payload=structuredClone(item.draft_payload||item.published_payload||item.payload||{});
    $('#contentType').value=type; $('#contentKey').value=key; $('#fieldTitle').value=payload.title||''; $('#fieldSubtitle').value=payload.subtitle||'';
    $('#fieldLevel').value=String(payload.level||1); $('#fieldDuration').value=payload.duration||''; $('#fieldScriptures').value=(payload.scriptures||[]).join('\n');
    const isResource=type==='resource';
    $('#resourceFields').hidden=!isResource; $('#featuredLabel').hidden=!isResource; $('#resourceOnly').hidden=!isResource; $('#resourceTail').hidden=!isResource;
    $('#lessonOnly').hidden=isResource; $('#lessonTail').hidden=isResource;
    if(isResource){$('#fieldCategory').value=payload.category||'formacion';$('#fieldFormat').value=payload.format||'Lectura';$('#fieldFeatured').value=String(Boolean(payload.featured));$('#fieldSummary').value=payload.summary||'';$('#fieldTakeaway').value=payload.takeaway||'';}
    else{$('#fieldObjective').value=payload.objective||'';$('#fieldCore').value=payload.core||'';$('#fieldKeyPoints').value=(payload.keyPoints||[]).join('\n');$('#fieldPractice').value=payload.practice||'';$('#fieldReflection').value=payload.reflection||'';$('#fieldQuiz').value=JSON.stringify(payload.quiz||[],null,2);}
    setSections(payload.sections,type);
    $('#editorType').textContent=type==='lesson'?`LECCIÓN ${key}`:'RECURSO'; $('#editorHeading').textContent=payload.title||key; $('#editorState').textContent=statusOf(item);
    const superAdmin=role==='super_admin'; $('#publishContent').disabled=!superAdmin; $('#unpublishContent').disabled=!superAdmin||!item.published_payload; $('#archiveContent').disabled=!superAdmin||(!item.draft_payload&&!item.published_payload);
    msg('');
  }

  function buildPayload(){
    const type=$('#contentType').value;
    const sectionRows=[...document.querySelectorAll('.section-row')].map(row=>({title:row.querySelector('[data-section-title]').value.trim(),body:row.querySelector('[data-section-body]').value.trim()})).filter(x=>x.title||x.body);
    const common={title:$('#fieldTitle').value.trim(),subtitle:$('#fieldSubtitle').value.trim(),level:Number($('#fieldLevel').value),duration:$('#fieldDuration').value.trim(),scriptures:lines($('#fieldScriptures').value)};
    if(!common.title) throw new Error('El título es obligatorio.');
    if(type==='resource') return {...common,id:$('#contentKey').value,category:$('#fieldCategory').value,format:$('#fieldFormat').value.trim()||'Lectura',featured:$('#fieldFeatured').value==='true',summary:$('#fieldSummary').value.trim(),sections:sectionRows.map(x=>[x.title,x.body]),takeaway:$('#fieldTakeaway').value.trim()};
    let quiz=[]; try{quiz=JSON.parse($('#fieldQuiz').value||'[]');}catch{throw new Error('El quiz avanzado no contiene JSON válido.');}
    if(!Array.isArray(quiz)) throw new Error('El quiz debe ser una lista JSON.');
    return {...common,objective:$('#fieldObjective').value.trim(),core:$('#fieldCore').value.trim(),sections:sectionRows,keyPoints:lines($('#fieldKeyPoints').value),practice:$('#fieldPractice').value.trim(),reflection:$('#fieldReflection').value.trim(),quiz};
  }

  async function saveDraft(silent=false){
    if(!selected) return false;
    const payload=buildPayload();
    await call('save_draft',{content_type:selected.content_type,content_key:selected.content_key,payload,position:selected.position||0});
    if(!silent) msg('Borrador guardado en Supabase. La versión pública todavía no cambia.','success');
    await loadRemote(false); selectItem(selected.content_type,selected.content_key); return true;
  }

  async function loadRemote(render=true){const result=await call('list_items');remote=Array.isArray(result.items)?result.items:[];if(render)renderList();}

  form.addEventListener('submit',async e=>{e.preventDefault();try{msg('Guardando borrador…');await saveDraft();}catch(err){msg(err.message,'error');}});
  $('#addSection').addEventListener('click',()=>addSection());
  $('#sectionRows').addEventListener('click',e=>{const b=e.target.closest('[data-remove-section]');if(b&&document.querySelectorAll('.section-row').length>1)b.closest('.section-row').remove();});
  itemsWrap.addEventListener('click',e=>{const b=e.target.closest('[data-key]');if(b)selectItem(activeType,b.dataset.key);});
  document.querySelector('.content-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-type]');if(!b)return;activeType=b.dataset.type;selected=null;document.querySelectorAll('[data-type]').forEach(x=>x.classList.toggle('active',x===b));$('#newResource').hidden=activeType!=='resource';form.hidden=true;empty.hidden=false;renderList();});
  $('#newResource').addEventListener('click',()=>{let key=prompt('Identificador del recurso (solo minúsculas, números y guiones):','nuevo-recurso');if(!key)return;key=key.trim().toLowerCase();if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)){alert('Usa un identificador como: guia-de-oracion');return;}selected={content_type:'resource',content_key:key,payload:{id:key,category:'formacion',level:1,format:'Lectura',featured:false,title:'Nuevo recurso',subtitle:'',duration:'10–15 min',scriptures:[],summary:'',sections:[['','']],takeaway:''},position:combined('resource').length+1,source:'new'};renderList();empty.hidden=true;form.hidden=false;const temp=selected;remote.push({...temp,draft_payload:temp.payload});selectItem('resource',key);remote=remote.filter(x=>!(x.source==='new'&&x.content_key===key));});

  $('#publishContent').addEventListener('click',async()=>{if(!selected||!confirm('¿Publicar esta versión? Los alumnos verán el cambio inmediatamente.'))return;try{msg('Guardando y publicando…');await saveDraft(true);await call('publish',{content_type:selected.content_type,content_key:selected.content_key});await loadRemote(false);selectItem(selected.content_type,selected.content_key);msg('Contenido publicado. La nube ya es la versión activa.','success');}catch(err){msg(err.message,'error');}});
  $('#unpublishContent').addEventListener('click',async()=>{if(!selected||!confirm('¿Retirar la versión publicada y volver al respaldo de GitHub?'))return;try{await call('unpublish',{content_type:selected.content_type,content_key:selected.content_key});await loadRemote(false);selectItem(selected.content_type,selected.content_key);msg('Publicación retirada. El frontend vuelve al respaldo estático.','success');}catch(err){msg(err.message,'error');}});
  $('#archiveContent').addEventListener('click',async()=>{if(!selected||!confirm('¿Archivar este override? El contenido base de GitHub no se elimina.'))return;try{await call('archive',{content_type:selected.content_type,content_key:selected.content_key});await loadRemote(false);renderList();form.hidden=true;empty.hidden=false;selected=null;msg('Override archivado.','success');}catch(err){msg(err.message,'error');}});

  async function boot(){
    if(!cloud?.configured()){denied.hidden=false;roleLabel.textContent='NUBE NO DISPONIBLE';return;}
    client=await cloud.getClient(); const {data}=await client.auth.getSession(); session=data?.session||null;
    if(!session){denied.hidden=false;roleLabel.textContent='INICIA SESIÓN';return;}
    const {data:roleData}=await client.from('user_roles').select('role,active').eq('user_id',session.user.id).maybeSingle();
    if(!roleData?.active||!['admin','super_admin'].includes(roleData.role)){denied.hidden=false;roleLabel.textContent='SIN PERMISOS';return;}
    role=roleData.role; roleLabel.textContent=role==='super_admin'?'SUPER ADMIN · PUBLICACIÓN HABILITADA':'ADMIN · SOLO BORRADORES'; app.hidden=false; await loadRemote();
    const first=combined('lesson')[0]; if(first)selectItem('lesson',first.content_key);
  }
  boot().catch(err=>{denied.hidden=false;roleLabel.textContent='ERROR DE CONEXIÓN';console.error(err);});
})();