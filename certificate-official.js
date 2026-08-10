(() => {
  const cloud=window.MIRMCCloud;
  const experience=document.querySelector('#certificateExperience');
  if(!experience)return;

  const panel=document.createElement('section');
  panel.className='certificate-official no-print';
  panel.innerHTML=`<div class="certificate-official-head"><div><span>CERTIFICADO VERIFICABLE MIRMC</span><h2>Registro emitido por servidor.</h2></div><b class="certificate-official-badge" id="officialCertBadge">COMPROBANDO</b></div><p class="certificate-official-copy" id="officialCertCopy">Comprobando la evidencia académica oficial…</p><div class="certificate-official-progress" id="officialCertProgress"></div><div class="certificate-official-code" id="officialCertCode" hidden></div><div class="certificate-official-actions" id="officialCertActions"></div><div class="certificate-official-message" id="officialCertMessage" aria-live="polite"></div><div class="certificate-official-note">El código verificable se emite únicamente a partir de las validaciones guardadas por el servidor. El progreso local y el archivo de respaldo no pueden emitir por sí solos un registro oficial.</div>`;
  experience.prepend(panel);

  const badge=panel.querySelector('#officialCertBadge');
  const copy=panel.querySelector('#officialCertCopy');
  const progress=panel.querySelector('#officialCertProgress');
  const codeBox=panel.querySelector('#officialCertCode');
  const actions=panel.querySelector('#officialCertActions');
  const message=panel.querySelector('#officialCertMessage');
  let session=null;

  function setMessage(text,type=''){message.className=`certificate-official-message ${type}`.trim();message.textContent=text||'';}
  function formatDate(value){if(!value)return '—';try{return new Intl.DateTimeFormat('es',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value)).toUpperCase();}catch{return '—';}}

  async function call(action,payload={}){
    if(!session)throw new Error('Inicia sesión para usar el certificado verificable.');
    const cfg=cloud.config();
    const response=await fetch(`${cfg.supabaseUrl}/functions/v1/certificate-management`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`,apikey:cfg.supabasePublishableKey},body:JSON.stringify({action,...payload})});
    const body=await response.json().catch(()=>({}));
    if(!response.ok){
      const map={not_eligible:'Todavía no cumples los requisitos oficiales del servidor.',name_required:'Escribe tu nombre completo antes de emitir el certificado.',invalid_session:'La sesión expiró. Vuelve a iniciar sesión.'};
      const error=new Error(map[body?.error]||'No se pudo completar la operación del certificado.');error.code=body?.error;error.details=body;throw error;
    }
    return body;
  }

  function renderCertificate(cert){
    const active=cert.status==='active';
    badge.className=`certificate-official-badge ${active?'active':'revoked'}`;
    badge.textContent=active?'VERIFICABLE · ACTIVO':'VERIFICABLE · REVOCADO';
    copy.textContent=active?'Este certificado tiene un registro público verificable mediante su código exacto.':'El registro existe, pero actualmente está revocado por Administración MIRMC.';
    progress.innerHTML=`<div><small>PROMEDIO OFICIAL</small><strong>${Number(cert.average||0)}%</strong></div><div><small>FINALIZACIÓN</small><strong>${formatDate(cert.completion_date)}</strong></div>`;
    codeBox.hidden=false;codeBox.textContent=cert.certificate_code;
    actions.innerHTML=`<a class="button button-primary" href="verify-certificate.html?code=${encodeURIComponent(cert.certificate_code)}">Verificar registro →</a>`;
    if(active){
      document.querySelector('#certificateCode').textContent=`VERIFICABLE · ${cert.certificate_code}`;
      document.querySelector('#certificateAverage').textContent=`${Number(cert.average||0)}%`;
      document.querySelector('#certificateDate').textContent=formatDate(cert.completion_date);
      const input=document.querySelector('#certificateName');
      const display=document.querySelector('#certificateDisplayName');
      if(input&&display){input.value=cert.participant_name||input.value;display.textContent=cert.participant_name||display.textContent;}
    }
    setMessage(active?'Registro oficial localizado correctamente.':'Este código no debe presentarse como certificado vigente.',active?'success':'error');
  }

  function renderEligibility(data){
    badge.className='certificate-official-badge';badge.textContent=data.eligible?'LISTO PARA EMITIR':'VALIDACIÓN EN PROCESO';
    copy.textContent=data.eligible?'El servidor confirmó toda la ruta académica. Ya puedes emitir tu código verificable.':'Sigue estudiando normalmente. Las evaluaciones con sesión activa se registran también en el expediente oficial.';
    progress.innerHTML=`<div><small>LECCIONES OFICIALES</small><strong>${Number(data.lesson_count||0)} / 15</strong></div><div><small>EXÁMENES OFICIALES</small><strong>${Number(data.exam_count||0)} / 3</strong></div>`;
    codeBox.hidden=true;codeBox.textContent='';actions.innerHTML='';
    if(data.eligible){
      const button=document.createElement('button');button.type='button';button.className='button button-primary';button.textContent='Emitir certificado verificable';
      button.addEventListener('click',async()=>{
        const name=document.querySelector('#certificateName')?.value?.trim()||'';
        if(name.length<2){setMessage('Escribe primero el nombre completo que aparecerá en el certificado.','error');document.querySelector('#certificateName')?.focus();return;}
        if(!confirm(`¿Emitir el certificado verificable a nombre de “${name}”? El registro quedará asociado a tu cuenta.`))return;
        button.disabled=true;setMessage('Emitiendo registro oficial…');
        try{const result=await call('issue',{participant_name:name});renderCertificate(result.certificate);setMessage(result.existing?'Ya existía un certificado para esta cuenta; se cargó el mismo registro.':'Certificado verificable emitido correctamente.','success');}
        catch(error){setMessage(error.message,'error');button.disabled=false;}
      });
      actions.appendChild(button);
    } else {
      const missing=[];
      if(data.missing_lessons?.length)missing.push(`lecciones: ${data.missing_lessons.join(', ')}`);
      if(data.missing_exams?.length)missing.push(`exámenes: ${data.missing_exams.join(', ')}`);
      setMessage(missing.length?`Pendiente oficialmente · ${missing.join(' · ')}`:'Todavía no se completó la validación oficial.','');
    }
  }

  async function boot(){
    if(!cloud?.configured()){badge.textContent='SIN NUBE';copy.textContent='La emisión verificable requiere conexión con Supabase.';setMessage('El certificado local sigue disponible, pero no puede convertirse en verificable sin la nube.','error');return;}
    const client=await cloud.getClient();const {data}=await client.auth.getSession();session=data?.session||null;
    if(!session){badge.textContent='INICIA SESIÓN';copy.textContent='El certificado verificable se asocia a una cuenta autenticada.';progress.innerHTML='';actions.innerHTML='<a class="button button-primary" href="account.html">Ir a Mi cuenta →</a>';setMessage('Tu certificado imprimible local no se pierde. Inicia sesión para consultar la evidencia oficial.');return;}
    try{
      const mine=await call('mine');
      if(mine.certificate){renderCertificate(mine.certificate);return;}
      const eligibility=await call('eligibility');renderEligibility(eligibility);
    }catch(error){badge.textContent='NO DISPONIBLE';copy.textContent='No se pudo consultar el registro oficial.';setMessage(error.message,'error');}
  }

  boot();
})();