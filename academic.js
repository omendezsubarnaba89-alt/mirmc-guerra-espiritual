(() => {
  const course = window.MIRMC_COURSE_DATA;
  const progress = window.MIRMCProgress;
  const exams = window.MIRMCAssessmentProgress;
  const $ = s => document.querySelector(s);

  if (!course || !progress || !exams) return;

  function levelReady(level){
    return course.levels[level].lessons.every(id => progress.isComplete(id));
  }
  function certificateEligible(){
    return progress.stats().completed === progress.stats().total && [1,2,3].every(level => exams.passed(level));
  }
  function renderOverview(){
    const ps = progress.stats();
    const es = exams.stats();
    $('#academicOverview').innerHTML = `
      <div class="academic-stat highlight"><small>PROGRESO</small><strong>${ps.pct}%</strong></div>
      <div class="academic-stat"><small>LECCIONES</small><strong>${ps.completed}/${ps.total}</strong></div>
      <div class="academic-stat"><small>EXÁMENES</small><strong>${es.passed}/3</strong></div>
      <div class="academic-stat"><small>PROMEDIO</small><strong>${es.average || 0}%</strong></div>`;
  }
  function renderLevels(){
    $('#academicLevels').innerHTML = [1,2,3].map(level => {
      const info = course.levels[level];
      const levelStats = progress.stats().byLevel[level];
      const exam = exams.result(level);
      const ready = levelReady(level);
      const passed = exams.passed(level);
      const lessons = info.lessons.map(id => {
        const done = progress.isComplete(id);
        return `<a class="academic-lesson ${done ? 'done' : ''}" href="${progress.isUnlocked(id) ? `lesson.html?lesson=${id}` : '#'}" ${progress.isUnlocked(id) ? '' : 'aria-disabled="true"'}>
          <span>${id}</span><div><strong>${course.lessons[id].title}</strong></div><small>${done ? '✓' : progress.isUnlocked(id) ? '→' : '⌁'}</small></a>`;
      }).join('');
      const examText = passed
        ? `Aprobado. Mejor nota: ${exam.bestPct}%. Intentos: ${exam.attempts}.`
        : ready ? 'Las cinco lecciones están completas. Ya puedes presentar el cierre del nivel.'
        : `Completa primero las cinco lecciones. Avance: ${levelStats.done}/${levelStats.total}.`;
      return `<article class="academic-level">
        <div class="academic-level-head"><div><span>NIVEL ${level}</span><h2>${info.name}</h2></div><div class="academic-level-score"><small>EXAMEN FINAL</small><strong>${passed ? `${exam.bestPct}%` : '—'}</strong></div></div>
        <div class="academic-level-body">
          <div class="academic-lessons"><div class="academic-lessons-head"><span>LECCIONES</span><b>${levelStats.done}/${levelStats.total}</b></div><div class="academic-lesson-list">${lessons}</div></div>
          <div class="academic-exam"><span class="academic-exam-label">CIERRE ACADÉMICO</span><h3 class="${passed ? 'passed' : ''}">${passed ? 'Nivel aprobado ✓' : 'Evaluación final'}</h3><p>${examText}</p><a class="button ${passed || ready ? 'button-primary' : 'button-ghost locked'}" href="assessment.html?level=${level}">${passed ? 'Ver / repetir evaluación' : ready ? 'Presentar evaluación' : 'Evaluación bloqueada'}</a></div>
        </div>
      </article>`;
    }).join('');
  }
  function renderCertificate(){
    const eligible = certificateEligible();
    const action = $('#certificateAction');
    $('#certificateTitle').textContent = eligible ? 'Tu certificado ya está disponible.' : 'Todavía estás construyendo la ruta.';
    $('#certificateText').textContent = eligible
      ? `Completaste las 15 lecciones y aprobaste los tres exámenes con promedio de ${exams.average()}%. Puedes generar tu certificado interno MIRMC.`
      : 'Completa las 15 lecciones y aprueba las tres evaluaciones finales con al menos 80% para habilitar el certificado.';
    action.setAttribute('aria-disabled', String(!eligible));
    action.textContent = eligible ? 'Generar certificado →' : 'Certificado bloqueado';
  }
  function render(){ renderOverview(); renderLevels(); renderCertificate(); }
  render();
  window.addEventListener('mirmc-course-progress', render);
  window.addEventListener('mirmc-assessment-progress', render);
})();