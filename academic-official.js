(() => {
  const cloud=window.MIRMCCloud;

  async function sessionContext(){
    if(!cloud?.configured())return {client:null,session:null,reason:'cloud_unavailable'};
    const client=await cloud.getClient();
    const {data,error}=await client.auth.getSession();
    if(error||!data?.session)return {client,session:null,reason:'not_signed_in'};
    return {client,session:data.session,reason:null};
  }

  function waitLabel(seconds){
    const total=Math.max(1,Number(seconds)||0);
    if(total>=3600){const hours=Math.ceil(total/3600);return `${hours} hora${hours===1?'':'s'}`;}
    if(total>=60){const minutes=Math.ceil(total/60);return `${minutes} minuto${minutes===1?'':'s'}`;}
    return `${Math.ceil(total)} segundos`;
  }

  async function call(action,payload={}){
    const {session,reason}=await sessionContext();
    if(!session){const err=new Error(reason==='not_signed_in'?'Inicia sesión para registrar esta evaluación como oficial.':'La nube no está disponible para validación oficial.');err.code=reason;throw err;}
    const cfg=cloud.config();
    const response=await fetch(`${cfg.supabaseUrl}/functions/v1/academic-validation`,{
      method:'POST',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`,apikey:cfg.supabasePublishableKey},
      body:JSON.stringify({action,...payload})
    });
    const body=await response.json().catch(()=>({}));
    if(!response.ok){
      const map={
        invalid_session:'La sesión expiró. Vuelve a entrar en Mi cuenta.',
        invalid_lesson_submission:'La evaluación de la lección no tiene un formato válido.',
        invalid_exam_submission:'La evaluación final no tiene un formato válido.',
        lesson_prerequisite:`Primero debes validar oficialmente la lección ${body?.required_lesson||'anterior'}.`,
        exam_prerequisite:`Primero debes aprobar oficialmente el examen del Nivel ${body?.required_exam||'anterior'}.`,
        lessons_prerequisite:`Faltan validaciones oficiales: ${(body?.missing_lessons||[]).join(', ')}.`,
        exam_rate_limit:`Ya utilizaste los ${Number(body?.max_attempts||3)} intentos oficiales permitidos en 24 horas para este nivel. Podrás intentarlo de nuevo aproximadamente en ${waitLabel(body?.retry_after_seconds)}.`
      };
      const error=new Error(map[body?.error]||'No se pudo registrar la validación oficial.');
      error.code=body?.error||'official_error';error.details=body;throw error;
    }
    window.dispatchEvent(new CustomEvent('mirmc-official-academic',{detail:{action,...body}}));
    return body;
  }

  async function submitLesson(lessonKey,answers){return call('submit_lesson',{lesson_key:String(lessonKey).padStart(2,'0'),answers});}
  async function submitExam(level,answers){return call('submit_exam',{level:Number(level),answers});}
  async function status(){return call('status');}
  async function available(){const ctx=await sessionContext();return Boolean(ctx.session);}

  window.MIRMCOfficialAcademic={call,submitLesson,submitExam,status,available,sessionContext};
})();
