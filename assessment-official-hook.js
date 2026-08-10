(() => {
  const official=window.MIRMCOfficialAcademic;
  const button=document.querySelector('#assessmentSubmit');
  const form=document.querySelector('#assessmentForm');
  const localResult=document.querySelector('#assessmentResult');
  if(!official||!button||!form||!localResult)return;
  const level=Number(new URLSearchParams(location.search).get('level')||1);
  const assessment=window.MIRMC_ASSESSMENTS?.[level];
  if(!assessment)return;
  const status=document.createElement('div');
  status.className='official-academic-status pending';
  status.innerHTML='<strong>VALIDACIÓN OFICIAL MIRMC</strong>El resultado se recalculará en el servidor al enviar las 10 respuestas.';
  localResult.after(status);

  button.addEventListener('click',async()=>{
    const inputs=assessment.questions.map((_,qi)=>form.querySelector(`input[name="aq${qi}"]:checked`));
    if(inputs.some(x=>!x))return;
    const answers=inputs.map(x=>Number(x.value));
    status.className='official-academic-status pending';
    status.innerHTML='<strong>VALIDACIÓN OFICIAL MIRMC</strong>Recalculando el examen en Supabase…';
    try{
      const result=await official.submitExam(level,answers);
      status.className=`official-academic-status ${result.passed?'success':'error'}`;
      status.innerHTML=`<strong>VALIDACIÓN OFICIAL MIRMC</strong>${result.passed?`Nivel ${level} aprobado oficialmente · ${result.pct}%.`:`Intento oficial registrado · ${result.pct}%. Se requiere 80%.`}`;
    }catch(error){
      const localOnly=['not_signed_in','cloud_unavailable'].includes(error.code);
      status.className=`official-academic-status ${localOnly?'pending':'error'}`;
      status.innerHTML=`<strong>${localOnly?'RESULTADO LOCAL · VALIDACIÓN PENDIENTE':'NO SE PUDO VALIDAR OFICIALMENTE'}</strong>${error.message}`;
    }
  });
})();