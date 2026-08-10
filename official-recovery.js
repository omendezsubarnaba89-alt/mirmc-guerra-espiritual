(() => {
  const official=window.MIRMCOfficialAcademic;
  const progress=window.MIRMCProgress;
  const exams=window.MIRMCAssessmentProgress;
  const sync=window.MIRMCSync;
  const statusBox=document.querySelector('#recoveryStatus');
  const diffBox=document.querySelector('#recoveryDiff');
  const applyButton=document.querySelector('#recoveryApply');
  const message=document.querySelector('#recoveryMessage');
  let officialState=null;
  let lessonSetter=null;

  const setMessage=(text,type='')=>{message.className=`recovery-message ${type}`.trim();message.textContent=text||'';};

  function findLessonSetter(){
    const candidates=['complete','markComplete','completeLesson','setComplete'];
    for(const name of candidates){
      if(typeof progress?.[name]==='function')return id=>progress[name](id);
    }
    return null;
  }

  function localSnapshot(){
    const courseStats=progress?.stats?.()||{completed:0,total:15};
    const examStats=exams?.stats?.()||{levels:[]};
    return {courseStats,examStats};
  }

  function officialMaps(){
    const lessons=new Map((officialState?.lessons||[]).map(x=>[String(x.lesson_key).padStart(2,'0'),x]));
    const finalExams=new Map((officialState?.exams||[]).map(x=>[Number(x.level),x]));
    return {lessons,finalExams};
  }

  function calculateDiff(){
    const {lessons,finalExams}=officialMaps();
    const missingLessons=[...lessons.entries()].filter(([id,row])=>row?.passed&&!progress?.isComplete?.(id)).map(([id,row])=>({id,row})).sort((a,b)=>a.id.localeCompare(b.id));
    const missingExams=[...finalExams.entries()].filter(([level,row])=>row?.passed&&!exams?.passed?.(level)).map(([level,row])=>({level,row})).sort((a,b)=>a.level-b.level);
    return {missingLessons,missingExams};
  }

  function render(){
    const local=localSnapshot();
    const {lessons,finalExams}=officialMaps();
    const officialLessons=[...lessons.values()].filter(x=>x?.passed).length;
    const officialExams=[...finalExams.values()].filter(x=>x?.passed).length;
    const diff=calculateDiff();
    statusBox.innerHTML=`<div><small>ESTE DISPOSITIVO</small><strong>${Number(local.courseStats.completed||0)} / 15</strong></div><div><small>SERVIDOR OFICIAL</small><strong>${officialLessons} / 15</strong></div><div><small>EXÁMENES LOCALES</small><strong>${(local.examStats.levels||[]).filter(x=>x?.passed).length} / 3</strong></div><div><small>EXÁMENES OFICIALES</small><strong>${officialExams} / 3</strong></div>`;
    const rows=[];
    for(const item of diff.missingLessons)rows.push(`<div class="recovery-row"><span>${item.id}</span><strong>${window.MIRMC_COURSE_DATA?.lessons?.[item.id]?.title||`Lección ${item.id}`}</strong><b>OFICIAL ✓ · FALTA LOCAL</b></div>`);
    for(const item of diff.missingExams)rows.push(`<div class="recovery-row"><span>EX${item.level}</span><strong>Evaluación final · Nivel ${item.level}</strong><b>${Number(item.row.best_pct||0)}% OFICIAL ✓</b></div>`);
    diffBox.innerHTML=rows.length?rows.join(''):'<div class="recovery-row"><span>✓</span><strong>Este dispositivo ya contiene todo el progreso oficial disponible.</strong><b>SIN CAMBIOS</b></div>';
    lessonSetter=findLessonSetter();
    const canApply=(diff.missingLessons.length===0||Boolean(lessonSetter))&&typeof exams?.record==='function'&&(diff.missingLessons.length+diff.missingExams.length>0);
    applyButton.disabled=!canApply;
    if(diff.missingLessons.length&&!lessonSetter)setMessage('El motor local de curso de esta versión no expone una operación segura de importación. No se modificó ningún dato. Actualiza la página antes de continuar.','error');
    else if(rows.length)setMessage(`Hay ${diff.missingLessons.length} lección(es) y ${diff.missingExams.length} examen(es) oficiales que pueden añadirse a este dispositivo.`);
    else setMessage('No hay nada que recuperar.','success');
  }

  function backup(){
    try{
      if(typeof sync?.snapshot!=='function')return;
      const payload={saved_at:new Date().toISOString(),snapshot:sync.snapshot()};
      localStorage.setItem('mirmc-official-recovery-backup-v1',JSON.stringify(payload));
    }catch{}
  }

  async function apply(){
    const diff=calculateDiff();
    if(!diff.missingLessons.length&&!diff.missingExams.length)return;
    if(diff.missingLessons.length&&!lessonSetter){setMessage('No hay una operación local segura disponible para restaurar lecciones. No se hizo ningún cambio.','error');return;}
    if(!confirm(`Se agregarán ${diff.missingLessons.length} lección(es) y ${diff.missingExams.length} examen(es) que el servidor ya reconoce como aprobados. No se borrará progreso local. ¿Continuar?`))return;
    applyButton.disabled=true;setMessage('Guardando respaldo y aplicando evidencia oficial…');backup();
    try{
      for(const {id} of diff.missingLessons){
        if(!progress.isComplete(id))await Promise.resolve(lessonSetter(id));
      }
      for(const {level,row} of diff.missingExams){
        if(!exams.passed(level))exams.record(level,Number(row.best_score||8),10);
      }
      if(typeof sync?.push==='function'){
        try{await sync.push();}catch{}
      }
      setMessage('El progreso oficial fue añadido a este dispositivo. Nunca se redujo ni sustituyó un avance local.','success');
      officialState=await official.status();render();
    }catch(error){setMessage(`No se pudo completar la recuperación: ${error.message}. Puedes restaurar el respaldo local desde la herramienta de datos si fuera necesario.`,'error');}
    finally{render();}
  }

  applyButton.addEventListener('click',apply);

  async function boot(){
    if(!official||!progress||!exams){applyButton.disabled=true;setMessage('Falta un componente de progreso. Recarga la aplicación para obtener la versión actual.','error');return;}
    try{
      const ctx=await official.sessionContext();
      if(!ctx.session){setMessage('Inicia sesión en Mi cuenta para consultar tu expediente oficial.','error');diffBox.innerHTML='<a class="button button-primary" href="account.html">Ir a Mi cuenta →</a>';return;}
      setMessage('Consultando el expediente oficial…');officialState=await official.status();render();
    }catch(error){setMessage(error.message,'error');}
  }

  boot();
})();