(() => {
  const official=window.MIRMCOfficialAcademic;
  const localSummary=document.querySelector('#academicSummary');
  if(!localSummary)return;
  const panel=document.createElement('section');
  panel.className='official-record';
  panel.innerHTML=`<div class="official-record-head"><div><span>EXPEDIENTE OFICIAL MIRMC</span><h2>Validaciones guardadas por el servidor.</h2></div><b class="official-record-badge pending" id="officialRecordBadge">COMPROBANDO</b></div><p class="official-record-copy" id="officialRecordCopy">Consultando las validaciones oficiales de tu cuenta…</p><div class="official-record-stats" id="officialRecordStats"></div><div class="official-levels" id="officialRecordLevels"></div><div class="official-record-actions" id="officialRecordActions"></div><div class="official-record-message" id="officialRecordMessage"></div>`;
  localSummary.after(panel);

  const badge=panel.querySelector('#officialRecordBadge');
  const copy=panel.querySelector('#officialRecordCopy');
  const stats=panel.querySelector('#officialRecordStats');
  const levels=panel.querySelector('#officialRecordLevels');
  const actions=panel.querySelector('#officialRecordActions');
  const message=panel.querySelector('#officialRecordMessage');
  const LEVELS={1:['01','02','03','04','05'],2:['06','07','08','09','10'],3:['11','12','13','14','15']};

  function signedOut(){
    badge.textContent='SIN SESIÓN';badge.className='official-record-badge pending';copy.textContent='El registro local sigue disponible, pero la evidencia oficial está asociada a una cuenta MIRMC.';stats.innerHTML='';levels.innerHTML='';actions.innerHTML='<a class="button button-primary" href="account.html">Iniciar sesión →</a>';message.textContent='Las evaluaciones finales oficiales requieren cuenta y conexión.';
  }

  function render(data){
    const lessons=new Map((data.lessons||[]).map(x=>[String(x.lesson_key).padStart(2,'0'),x]));
    const exams=new Map((data.exams||[]).map(x=>[Number(x.level),x]));
    const passedLessons=[...lessons.values()].filter(x=>x.passed).length;
    const passedExams=[...exams.values()].filter(x=>x.passed).length;
    const complete=passedLessons===15&&passedExams===3;
    badge.textContent=complete?'RUTA OFICIAL COMPLETA':'EN PROCESO';badge.className=`official-record-badge ${complete?'':'pending'}`;
    copy.textContent=complete?'El servidor confirmó las 15 lecciones y los tres cierres de nivel. Puedes solicitar el certificado verificable.':'Este bloque no se calcula desde localStorage: refleja únicamente intentos validados y guardados por el servidor.';
    stats.innerHTML=`<div><small>LECCIONES OFICIALES</small><strong>${passedLessons} / 15</strong></div><div><small>EXÁMENES OFICIALES</small><strong>${passedExams} / 3</strong></div>`;
    levels.innerHTML=[1,2,3].map(level=>{
      const count=LEVELS[level].filter(id=>lessons.get(id)?.passed).length;
      const exam=exams.get(level);
      return `<div class="official-level"><span>0${level}</span><strong>${count}/5 lecciones validadas</strong><b>${exam?.passed?`EXAMEN ${Number(exam.best_pct||0)}% ✓`:'EXAMEN PENDIENTE'}</b></div>`;
    }).join('');
    actions.innerHTML=`<a class="button button-ghost" href="certificate.html">${complete?'Abrir certificado verificable →':'Ver estado del certificado →'}</a><a class="button button-ghost" href="account.html">Mi cuenta →</a>`;
    message.textContent='El progreso local puede ser mayor mientras trabajas offline; solo pasa a este expediente cuando la validación oficial llega al servidor.';
  }

  async function boot(){
    if(!official){signedOut();return;}
    try{
      const ctx=await official.sessionContext();
      if(!ctx.session){signedOut();return;}
      const data=await official.status();render(data);
    }catch(error){badge.textContent='NO DISPONIBLE';badge.className='official-record-badge pending';copy.textContent='No se pudo consultar el expediente oficial en este momento.';message.textContent=error.message;actions.innerHTML='<a class="button button-ghost" href="account.html">Revisar Mi cuenta →</a>';}
  }
  boot();
})();