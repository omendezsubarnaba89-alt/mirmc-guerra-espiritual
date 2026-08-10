(() => {
  const cloud=window.MIRMCCloud;
  const params=new URLSearchParams(location.search);
  const type=params.get('type');
  const key=params.get('key');
  const roleBox=document.querySelector('#versionsRole');
  const denied=document.querySelector('#versionsDenied');
  const app=document.querySelector('#versionsApp');
  const currentBox=document.querySelector('#versionsCurrent');
  const list=document.querySelector('#versionsList');
  const message=document.querySelector('#versionsMessage');
  let session=null, role='student', currentVersion=0;

  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const fmt=v=>{try{return new Intl.DateTimeFormat('es',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));}catch{return '—';}};
  const setMessage=(text,typeName='')=>{message.className=`versions-message ${typeName}`.trim();message.textContent=text||'';};

  async function call(action,payload={}){
    const cfg=cloud.config();
    const response=await fetch(`${cfg.supabaseUrl}/functions/v1/content-management`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`,apikey:cfg.supabasePublishableKey},body:JSON.stringify({action,...payload})});
    const body=await response.json().catch(()=>({}));
    if(!response.ok){
      const map={super_admin_required:'Solo el Super Admin puede restaurar versiones.',version_not_found:'La versión seleccionada ya no existe.',invalid_version:'La versión seleccionada no es válida.',forbidden:'No tienes permisos para consultar este historial.'};
      throw new Error(map[body?.error]||'No se pudo completar la operación.');
    }
    return body;
  }

  function versionTitle(v){return v?.payload?.title||`${type==='lesson'?'Lección':'Recurso'} ${key}`;}
  function versionSubtitle(v){return v?.payload?.subtitle||v?.payload?.summary||'Sin subtítulo o resumen.';}

  function render(versions){
    currentBox.innerHTML=`<small>ELEMENTO ACTUAL</small><strong>${esc(type==='lesson'?`Lección ${key}`:`Recurso · ${key}`)} · versión ${currentVersion||'sin publicar'}</strong>`;
    if(!versions.length){list.innerHTML='<div class="versions-empty">Todavía no existen versiones publicadas. La primera aparecerá cuando publiques este contenido desde el gestor.</div>';return;}
    list.innerHTML=versions.map(v=>{
      const isCurrent=Number(v.version)===Number(currentVersion);
      const canRollback=role==='super_admin'&&!isCurrent;
      return `<article class="version-card" data-version="${Number(v.version)}"><div class="version-head"><div class="version-number"><b>V${Number(v.version)}</b>${isCurrent?'<span>ACTUAL</span>':''}</div><time>${fmt(v.published_at)}</time></div><h2>${esc(versionTitle(v))}</h2><p>${esc(versionSubtitle(v))}</p><div class="version-meta"><span>NIVEL ${esc(v.payload?.level||'—')}</span><span>${esc(v.payload?.duration||'SIN DURACIÓN')}</span><span>PUBLICÓ ${esc(String(v.published_by||'sistema').slice(0,12))}${v.published_by?'…':''}</span></div><div class="version-actions"><button type="button" data-rollback ${canRollback?'':'disabled'}>${isCurrent?'Versión actual':role==='super_admin'?'Restaurar esta versión':'Solo Super Admin puede restaurar'}</button></div></article>`;
    }).join('');
  }

  async function load(){
    setMessage('Cargando versiones…');
    const [itemResult,versionsResult]=await Promise.all([
      call('get_item',{content_type:type,content_key:key}),
      call('list_versions',{content_type:type,content_key:key})
    ]);
    currentVersion=Number(itemResult?.item?.current_version||0);
    const versions=Array.isArray(versionsResult?.versions)?versionsResult.versions:[];
    render(versions);
    setMessage(`${versions.length} versión${versions.length===1?'':'es'} registrada${versions.length===1?'':'s'}.`,'success');
  }

  list.addEventListener('click',async event=>{
    const button=event.target.closest('[data-rollback]');
    if(!button||button.disabled)return;
    const card=button.closest('[data-version]');
    const version=Number(card?.dataset?.version||0);
    if(!version||!confirm(`¿Restaurar la versión V${version}? Se publicará como una versión NUEVA y la historia anterior permanecerá intacta.`))return;
    button.disabled=true;setMessage(`Restaurando V${version}…`);
    try{const result=await call('rollback',{content_type:type,content_key:key,version});await load();setMessage(`V${version} fue restaurada y publicada como V${result.version}.`,'success');}
    catch(err){setMessage(err.message,'error');button.disabled=false;}
  });

  async function boot(){
    if(!['lesson','resource'].includes(type)||!key||!cloud?.configured()){denied.hidden=false;roleBox.innerHTML='<span>ESTADO</span><strong>Solicitud no válida</strong>';return;}
    const client=await cloud.getClient();const {data}=await client.auth.getSession();session=data?.session||null;
    if(!session){denied.hidden=false;roleBox.innerHTML='<span>ESTADO</span><strong>Inicia sesión</strong>';return;}
    const {data:roleData}=await client.from('user_roles').select('role,active').eq('user_id',session.user.id).maybeSingle();
    if(!roleData?.active||!['admin','super_admin'].includes(roleData.role)){denied.hidden=false;roleBox.innerHTML='<span>ROL</span><strong>Sin acceso</strong>';return;}
    role=roleData.role;roleBox.innerHTML=`<span>ROL AUTORIZADO</span><strong>${role==='super_admin'?'Super Admin':'Admin'}</strong>`;app.hidden=false;await load();
  }
  boot().catch(err=>{denied.hidden=false;roleBox.innerHTML='<span>ERROR</span><strong>No se pudo cargar</strong>';console.error(err);});
})();
