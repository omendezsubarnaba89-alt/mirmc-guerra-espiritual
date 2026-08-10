(() => {
  const level = Number(new URLSearchParams(location.search).get('level') || 1);
  const assessment = window.MIRMC_ASSESSMENTS?.[level];
  const course = window.MIRMC_COURSE_DATA;
  const courseProgress = window.MIRMCProgress;
  const academic = window.MIRMCAssessmentProgress;
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
  $('#assessmentEyebrow').textContent = `CIERRE DEL NIVEL ${level}`;
  $('#assessmentTitle').textContent = assessment.title;
  $('#assessmentSubtitle').textContent = assessment.subtitle;

  function renderHistory(){
    const state = academic.result(level);
    $('#assessmentHistory').innerHTML = `
      <div><small>INTENTOS</small><b>${state?.attempts || 0}</b></div>
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

  $('#assessmentSubmit').addEventListener('click', () => {
    let score = 0;
    let answered = 0;
    assessment.questions.forEach((item, qi) => {
      const section = form.querySelector(`[data-question="${qi}"]`);
      const selected = form.querySelector(`input[name="aq${qi}"]:checked`);
      section.querySelectorAll('.assessment-option').forEach(x => x.classList.remove('correct','wrong'));
      if (!selected) return;
      answered++;
      const selectedIndex = Number(selected.value);
      const selectedLabel = selected.closest('.assessment-option');
      const correctLabel = section.querySelector(`input[value="${item.answer}"]`)?.closest('.assessment-option');
      if (selectedIndex === item.answer) { score++; selectedLabel?.classList.add('correct'); }
      else { selectedLabel?.classList.add('wrong'); correctLabel?.classList.add('correct'); }
    });

    const result = $('#assessmentResult');
    if (answered < assessment.questions.length) {
      result.className = 'assessment-result fail';
      result.textContent = `Faltan ${assessment.questions.length - answered} preguntas por responder.`;
      return;
    }

    const state = academic.record(level, score, assessment.questions.length);
    renderHistory();
    result.className = `assessment-result ${state.lastPct >= assessment.pass ? 'pass' : 'fail'}`;
    if (state.lastPct >= assessment.pass) {
      const next = level < 3 ? `lesson.html?lesson=${course.levels[level + 1].lessons[0]}` : 'academic.html';
      const label = level < 3 ? `Nivel aprobado con ${state.lastPct}%. El Nivel ${level + 1} ya está habilitado.` : `Nivel aprobado con ${state.lastPct}%. Ya completaste los tres cierres académicos.`;
      result.innerHTML = `${label}<br><a href="${next}">${level < 3 ? `Comenzar Nivel ${level + 1} →` : 'Ver registro académico →'}</a>`;
    } else {
      result.innerHTML = `Resultado: ${state.lastPct}%. Necesitas ${assessment.pass}%. Tu mejor nota se conserva; repasa y vuelve a intentarlo.`;
    }
    result.scrollIntoView({ behavior:'smooth', block:'center' });
  });

  renderHistory();
})();