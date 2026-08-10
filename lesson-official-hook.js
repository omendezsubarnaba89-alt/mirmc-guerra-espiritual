(() => {
  const official=window.MIRMCOfficialAcademic;
  const button=document.querySelector('#quizCheck');
  const form=document.querySelector('#quizForm');
  const localResult=document.querySelector('#quizResult');
  if(!official||!button||!form||!localResult)return;
  const id=String(new URLSearchParams(location.search).get('lesson')||'01').padStart(2,'0');
  const status=document.createElement('div');
  status.className='official-academic-status pending';
  status.innerHTML='<strong>VALIDACIÓN OFICIAL MIRMC</strong>Se registrará en la nube cuando revises las tres respuestas con una sesión activa.';
  localResult.after(status);

  button.addEventListener('click',async()=>{
    const inputs=[...form.querySelectorAll('.quiz-question')].map((_,qi)=>form.querySelector(`input[name="q${qi}"]:checked`));
    if(inputs.some(x=>!x))return;
    const answers=inputs.map(x=>Number(x.value));
    status.className='official-academic-status pending';
    status.innerHTML='<strong>VALIDACIÓN OFICIAL MIRMC</strong>Comprobando el intento en el servidor…';
    try{
      const result=await official.submitLesson(id,answers);
      status.className=`official-academic-status ${result.passed?'success':'error'}`;
      status.innerHTML=`<strong>VALIDACIÓN OFICIAL MIRMC</strong>${result.passed?`Aprobada oficialmente · ${result.score}/${result.total}.`:`Intento registrado · ${result.score}/${result.total}. Necesitas 2/3.`}`;
    }catch(error){
      const localOnly=['not_signed_in','cloud_unavailable'].includes(error.code);
      status.className=`official-academic-status ${localOnly?'pending':'error'}`;
      status.innerHTML=`<strong>${localOnly?'PROGRESO LOCAL · VALIDACIÓN PENDIENTE':'VALIDACIÓN OFICIAL PENDIENTE'}</strong>${error.message}`;
    }
  });
})();