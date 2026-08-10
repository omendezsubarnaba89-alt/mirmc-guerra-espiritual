(() => {
  const button=document.querySelector('#restoreContent');
  const archive=document.querySelector('#archiveContent');
  const state=document.querySelector('#editorState');
  const message=document.querySelector('#contentMessage');
  if(!button||!archive||!state||!window.MIRMCCloud)return;

  function refresh(){
    const archived=/ARCHIVADO/i.test(state.textContent||'');
    button.hidden=!archived;
    archive.hidden=archived;
  }

  async function restore(){
    const type=document.querySelector('#contentType')?.value;
    const key=document.querySelector('#contentKey')?.value;
    if(!type||!key||!confirm('¿Restaurar este override archivado? Seguirá sin publicarse hasta que pulses Publicar.'))return;
    button.disabled=true;
    message.className='content-message';message.textContent='Restaurando override…';
    try{
      const client=await window.MIRMCCloud.getClient();
      const {data}=await client.auth.getSession();
      const session=data?.session;
      if(!session)throw new Error('La sesión expiró. Vuelve a iniciar sesión.');
      const cfg=window.MIRMCCloud.config();
      const response=await fetch(`${cfg.supabaseUrl}/functions/v1/content-management`,{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`,apikey:cfg.supabasePublishableKey},body:JSON.stringify({action:'restore',content_type:type,content_key:key})
      });
      const body=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(body?.error==='super_admin_required'?'Solo el Super Admin puede restaurar overrides.':'No se pudo restaurar el override.');
      message.className='content-message success';message.textContent='Override restaurado. Recargando el editor…';
      setTimeout(()=>location.reload(),500);
    }catch(error){message.className='content-message error';message.textContent=error.message;button.disabled=false;}
  }

  new MutationObserver(refresh).observe(state,{childList:true,subtree:true,characterData:true});
  button.addEventListener('click',restore);
  refresh();
})();
