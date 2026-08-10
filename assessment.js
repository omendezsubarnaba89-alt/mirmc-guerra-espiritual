(() => {
  const level = Number(new URLSearchParams(location.search).get('level') || 1);
  const assessment = window.MIRMC_ASSESSMENTS?.[level];
  const course = window.MIRMC_COURSE_DATA;
  const courseProgress = window.MIRMCProgress;
  const academic = window.MIRMCAssessmentProgress;
  const official = window.MIRMCOfficialAcademic;
  const $ = s => document.querySelector(s);

  if (!assessment || !course?.levels?.[level]) {
    document.body.innerHTML = '<main class="assessment-shell"><section class="assessment-state"><h1>Evaluación no encontrada.</h1><a class="button button-primary" href="academic.html">Volver al registro académico</a></section></main>';
    return;
  }

  const levelLessons = course.levels[level].lessons;
  const incomplete = levelLessons.filter(id => !courseProgress.isComplete(id));
  const locked = $('#assessmentLocked');
  const experience = $('#assessmentExperience');

  document.title = `${assessment.title} | MIRMC Guerra Espiritual`;

  if (incomplete.length) {
    locked.hidden = false;
    experience.hidden = true;
    $('#lockedMessage').textContent = `Completa las cinco lecciones del Nivel ${level}. Te faltan ${incomplete.length}: ${incomplete.join(', ')}.`;
    $('#lockedAction').href = `lesson.html?lesson=${incomplete[0]}`;
    $('#lockedAction').textContent = `Continuar en la lección ${incomplete[0]}`;
    return;
  }

  locked.hidden = true;
  experience.hidden = false;
  $('#assessmentEyebrow').textContent = `CIERRE OFICIAL DEL NIVEL ${level}`;
  $('#assessmentTitle').textContent = assessment.title;
  $('#assessmentSubtitle').textContent = assessment.subtitle;

  function renderHistory(){
    const state = academic.result(level);
    $('#assessmentHistory').innerHTML = `
      <div><small>INTENTOS REGISTRADOS</small><b>${state?.attempts || 0}</b></div>
      <div><small>MEJOR NOTA</small><b>${state?.bestPct || 0}%</b></div>
      <div><small>ESTADO</small><b>${state?.passed ? 'APROBADO ✓' : 'PENDIENTE'}</b></div>`;
  }

  const form = $('#assessmentForm');
  form.innerHTML = assessment.questions.map((item, qi) => `
    <section class="assessment-question" data-question="${qi}">
      <div class="assessment-qindex">PREGUNTA ${String(qi+1).padStart(2,'0')} / ${assessment.questions.length}</div>
      <strong>${item.q}</strong>
      <div class="assessment-options">
        ${item.options.map((option, oi) => `<label class="assessment-option"><input type="radio" name="aq${qi}" value="${oi}" /><span>${option}</span></label>`).join('')}
      </div>
    </section>`).join('');

  const result = $('#assessmentResult');
  const officialStatus = document.createElement('div');
  officialStatus.className = 'official-academic-status pending';
  officialStatus.innerHTML = '<strong>CALIFICACIÓN OFICIAL</strong>Las respuestas correctas no se incluyen en el navegador. Esta evaluación se califica únicamente en el servidor y permite hasta 3 intentos oficiales por cada 24 horas.';
  result.after(officialStatus);

  $('#assessmentSubmit').addEventListener('click', async () => {
    const inputs = assessment.questions.map((_, qi) => form.querySelector(`input[name="aq${qi}"]:checked`));
    const unanswered = inputs.filter(x => !x).length;
    if (unanswered) {
      result.className = 'assessment-result fail';
      result.textContent = `Faltan ${unanswered} preguntas por responder.`;
      return;
    }

    if (!official) {
      result.className = 'assessment-result fail';
      result.innerHTML = 'La calificación oficial no está disponible en este momento. <a href="account.html">Revisa tu cuenta →</a>';
      return;
    }

    const button = $('#assessmentSubmit');
    const answers = inputs.map(input => Number(input.value));
    button.disabled = true;
    button.textContent = 'Calificando en servidor…';
    officialStatus.className = 'official-academic-status pending';
    officialStatus.innerHTML = '<strong>CALIFICACIÓN OFICIAL</strong>Validando sesión, prerrequisitos e intento…';

    try {
      const server = await official.submitExam(level, answers);
      let state = academic.result(level);
      if (!state?.passed || !server.already_passed) state = academic.record(level, Number(server.score || 0), Number(server.total || 10));
      else state = state || academic.record(level, Number(server.score || 0), Number(server.total || 10));
      renderHistory();

      result.className = `assessment-result ${server.passed ? 'pass' : 'fail'}`;
      officialStatus.className = `official-academic-status ${server.passed ? 'success' : 'error'}`;
      if (server.passed) {
        const next = level < 3 ? `lesson.html?lesson=${course.levels[level + 1].lessons[0]}` : 'academic.html';
        officialStatus.innerHTML = `<strong>CALIFICACIÓN OFICIAL MIRMC</strong>Aprobado en el servidor con ${server.pct}%.${server.already_passed ? ' Este nivel ya constaba como aprobado.' : ''}`;
        result.innerHTML = `Nivel ${level} aprobado oficialmente con ${server.pct}%.<br><a href="${next}">${level < 3 ? `Comenzar Nivel ${level + 1} →` : 'Ver registro académico →'}</a>`;
      } else {
        officialStatus.innerHTML = `<strong>CALIFICACIÓN OFICIAL MIRMC</strong>Intento registrado: ${server.pct}%. Intentos restantes en la ventana actual: ${Number(server.attempts_remaining ?? 0)}.`;
        result.textContent = `Resultado oficial: ${server.pct}%. Necesitas ${assessment.pass}%. Repasa antes de utilizar otro intento.`;
      }
      result.scrollIntoView({ behavior:'smooth', block:'center' });
    } catch (error) {
      result.className = 'assessment-result fail';
      result.textContent = error.message;
      officialStatus.className = 'official-academic-status error';
      officialStatus.innerHTML = `<strong>NO SE REGISTRÓ UN INTENTO OFICIAL</strong>${error.message}`;
      if (['not_signed_in','invalid_session'].includes(error.code)) result.innerHTML += '<br><a href="account.html">Ir a Mi cuenta →</a>';
    } finally {
      button.disabled = false;
      button.textContent = 'Calificar evaluación oficial';
    }
  });

  renderHistory();
})();