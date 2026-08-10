(() => {
  const config=window.MIRMC_CLOUD_CONFIG||{};
  const form=document.querySelector('#verifyForm');
  const input=document.querySelector('#verifyCode');
  const button=document.querySelector('#verifyButton');
  const message=document.querySelector('#verifyMessage');
  const result=document.querySelector('#verifyResult');
  const CODE_RE=/^MIRMC-GE-[A-F0-9]{16}$/;

  const esc=value=>String(value??'').replace(/[&<>\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const normalize=value=>String(value||'').trim().toUpperCase().replace(/\s+/g,'');
  const fmtDate=value=>{
    if(!value)return '—';
    try{return new Intl.DateTimeFormat('es',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value)).toUpperCase();}
    catch{return '—';}
  };

  function renderNotFound(code){
    result.innerHTML=`<article class="verify-not-found"><h2>Registro no encontrado.</h2><p>No existe un certificado MIRMC visible con el código <strong>${esc(code)}</strong>. Revisa cada carácter e inténtalo nuevamente.</p></article>`;
  }

  function renderCertificate(cert){
    const active=cert.status==='active';
    result.innerHTML=`<article class="verify-card ${active?'active':'revoked'}">
      <span class="verify-status">${active?'CERTIFICADO VÁLIDO':'CERTIFICADO REVOCADO'}</span>
      <h2>${esc(cert.participant_name)}</h2>
      <div class="verify-code">${esc(cert.certificate_code)}</div>
      <div class="verify-metrics">
        <div><small>LECCIONES</small><strong>${Number(cert.lessons_completed||0)} / 15</strong></div>
        <div><small>EXÁMENES</small><strong>${Number(cert.exams_passed||0)} / 3</strong></div>
        <div><small>PROMEDIO</small><strong>${Number(cert.average||0)}%</strong></div>
        <div><small>FINALIZACIÓN</small><strong>${fmtDate(cert.completion_date)}</strong></div>
        <div><small>EMISIÓN</small><strong>${fmtDate(cert.issued_at)}</strong></div>
        <div><small>ESTADO</small><strong>${active?'ACTIVO':'REVOCADO'}</strong></div>
      </div>
      <p class="verify-note">Este registro fue localizado usando el código exacto. El verificador público no permite enumerar la base de certificados.</p>
      ${active?'':`<div class="verify-revoked"><strong>Revocado${cert.revoked_at?` · ${fmtDate(cert.revoked_at)}`:''}</strong>${cert.revocation_reason?`<br>${esc(cert.revocation_reason)}`:''}</div>`}
    </article>`;
  }

  async function verify(code){
    if(!config.enabled||!config.supabaseUrl||!config.supabasePublishableKey)throw new Error('El servicio de verificación no está disponible en este momento.');
    const response=await fetch(`${config.supabaseUrl}/rest/v1/rpc/verify_certificate`,{
      method:'POST',
      headers:{apikey:config.supabasePublishableKey,'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify({p_code:code}),
      cache:'no-store'
    });
    if(!response.ok)throw new Error('No se pudo consultar el registro. Inténtalo nuevamente.');
    const rows=await response.json();
    return Array.isArray(rows)&&rows.length?rows[0]:null;
  }

  async function run(code){
    const normalized=normalize(code);
    input.value=normalized;
    result.innerHTML='';
    if(!CODE_RE.test(normalized)){
      message.textContent='El código debe tener el formato MIRMC-GE- seguido de 16 caracteres hexadecimales.';
      renderNotFound(normalized||'—');
      return;
    }
    button.disabled=true;message.textContent='Consultando el registro oficial…';
    try{
      const cert=await verify(normalized);
      if(!cert){renderNotFound(normalized);message.textContent='Consulta completada: no se encontró ese código.';return;}
      renderCertificate(cert);message.textContent=cert.status==='active'?'Consulta completada: certificado válido.':'Consulta completada: el registro existe, pero está revocado.';
    }catch(error){message.textContent=error.message;result.innerHTML='<article class="verify-not-found"><h2>No se pudo verificar ahora.</h2><p>El código no se considera válido hasta que el servidor pueda confirmar su registro.</p></article>';}
    finally{button.disabled=false;}
  }

  form.addEventListener('submit',event=>{event.preventDefault();run(input.value);});
  input.addEventListener('input',()=>{input.value=input.value.toUpperCase();});
  const initial=new URLSearchParams(location.search).get('code');
  if(initial){input.value=normalize(initial);run(initial);}
})();
