(() => {
  const data = window.MIRMC_COURSE_DATA;
  const progress = window.MIRMCProgress;
  const params = new URLSearchParams(location.search);
  const id = String(params.get('lesson') || '01').padStart(2,'0');
  const lesson = data?.lessons?.[id];

  const $ = s => document.querySelector(s);
  const loading = $('#lessonLoading');
  const locked = $('#lessonLocked');
  const experience = $('#lessonExperience');

  if (!lesson) {
    loading.innerHTML = '<strong>Lección no encontrada.</strong><br><a href="index.html#entrenamiento">Volver a la Ruta MIRMC</a>';
    return;
  }

  document.title = `${id} · ${lesson.title} | MIRMC Guerra Espiritual`;

  const prevId = progress.previous(id);
  const nextId = progress.next(id);
  const unlocked = progress.isUnlocked(id);

  if (!unlocked) {
    loading.hidden = true;
    locked.hidden = false;
    const btn = $('#lockedPrevious');
    if (prevId) {
      btn.href = `lesson.html?lesson=${prevId}`;
      btn.textContent = `Completar lección ${prevId}`;
    }
    return;
  }

  loading.hidden = true;
  experience.hidden = false;

  function renderProgress() {
    const stats = progress.stats();
    $('#courseProgressText').textContent = `${stats.completed}/${stats.total}`;
    $('#courseProgressPct').textContent = `${stats.pct}%`;
    $('#courseProgressBar').style.width = `${stats.pct}%`;
    $('#lessonState').textContent = progress.isComplete(id) ? 'COMPLETADA ✓' : 'EN PROGRESO';
    $('#completePanel').classList.toggle('is-done', progress.isComplete(id));
    if (progress.isComplete(id)) {
      const button = $('#completeLesson');
      button.disabled = false;
      button.innerHTML = 'Lección completada <span>✓</span>';
    }
  }

  const levelInfo = data.levels[lesson.level];
  const globalPosition = progress.order.indexOf(id) + 1;
  $('#lessonBreadcrumb').innerHTML = `<a href="index.html">Inicio</a> · <a href="index.html#entrenamiento">Ruta MIRMC</a> · Lección ${id}`;
  $('#lessonLevel').textContent = `NIVEL ${lesson.level} · ${levelInfo.name.toUpperCase()}`;
  $('#lessonTitle').textContent = lesson.title;
  $('#lessonSubtitle').textContent = lesson.subtitle;
  $('#lessonDuration').textContent = `TIEMPO · ${lesson.duration}`;
  $('#lessonPosition').textContent = `LECCIÓN ${globalPosition} DE ${progress.order.length}`;
  $('#lessonObjective').textContent = lesson.objective;
  $('#lessonScriptures').innerHTML = lesson.scriptures.map(ref => `<span>${ref}</span>`).join('');
  $('#lessonCore').textContent = lesson.core;
  $('#lessonSections').innerHTML = lesson.sections.map((section, index) => `
    <section class="lesson-section lesson-block">
      <div class="lesson-section-index">${String(index + 1).padStart(2,'0')} / ${String(lesson.sections.length).padStart(2,'0')}</div>
      <h2>${section.title}</h2>
      <p>${section.body}</p>
    </section>
  `).join('');
  $('#lessonKeyPoints').innerHTML = lesson.keyPoints.map((point,index) => `<li><span>${String(index+1).padStart(2,'0')}</span><div>${point}</div></li>`).join('');
  $('#lessonPractice').textContent = lesson.practice;
  $('#lessonReflection').textContent = lesson.reflection;
  $('#sidebarLevel').textContent = `Nivel ${lesson.level} · ${levelInfo.short}`;

  function sideNav() {
    $('#lessonNavigator').innerHTML = levelInfo.lessons.map(lessonId => {
      const item = data.lessons[lessonId];
      const complete = progress.isComplete(lessonId);
      const canOpen = progress.isUnlocked(lessonId);
      const classes = ['lesson-side-link'];
      if (lessonId === id) classes.push('current');
      if (!canOpen) classes.push('locked');
      const state = complete ? '✓' : canOpen ? '→' : '⌁';
      return `<a class="${classes.join(' ')}" href="${canOpen ? `lesson.html?lesson=${lessonId}` : '#'}" ${canOpen ? '' : 'aria-disabled="true"'}><span>${lessonId}</span><strong>${item.title}</strong><small>${state}</small></a>`;
    }).join('');
  }
  sideNav();

  const quizForm = $('#quizForm');
  quizForm.innerHTML = lesson.quiz.map((item, qi) => `
    <div class="quiz-question" data-question="${qi}">
      <strong>${qi + 1}. ${item.q}</strong>
      <div class="quiz-options">
        ${item.options.map((option, oi) => `<label class="quiz-option"><input type="radio" name="q${qi}" value="${oi}" /> <span>${option}</span></label>`).join('')}
      </div>
    </div>
  `).join('');

  let quizPassed = progress.isComplete(id);
  const checkButton = $('#quizCheck');
  const completeButton = $('#completeLesson');
  completeButton.disabled = !quizPassed;

  checkButton.addEventListener('click', () => {
    let score = 0;
    let answered = 0;
    lesson.quiz.forEach((item, qi) => {
      const selected = quizForm.querySelector(`input[name="q${qi}"]:checked`);
      const container = quizForm.querySelector(`[data-question="${qi}"]`);
      container.querySelectorAll('.quiz-option').forEach(label => label.classList.remove('correct','wrong'));
      if (!selected) return;
      answered++;
      const selectedIndex = Number(selected.value);
      const selectedLabel = selected.closest('.quiz-option');
      const correctInput = container.querySelector(`input[value="${item.answer}"]`);
      const correctLabel = correctInput?.closest('.quiz-option');
      if (selectedIndex === item.answer) {
        score++;
        selectedLabel?.classList.add('correct');
      } else {
        selectedLabel?.classList.add('wrong');
        correctLabel?.classList.add('correct');
      }
    });

    const result = $('#quizResult');
    if (answered < lesson.quiz.length) {
      result.className = 'quiz-result fail';
      result.textContent = 'Responde las tres preguntas antes de revisar la evaluación.';
      return;
    }

    progress.saveQuiz(id, score, lesson.quiz.length);
    quizPassed = score >= 2;
    result.className = `quiz-result ${quizPassed ? 'pass' : 'fail'}`;
    result.textContent = quizPassed
      ? `Aprobado: ${score} de ${lesson.quiz.length}. Ya puedes completar esta lección.`
      : `Resultado: ${score} de ${lesson.quiz.length}. Repasa la enseñanza y vuelve a intentarlo.`;
    completeButton.disabled = !quizPassed;
  });

  completeButton.addEventListener('click', () => {
    if (!quizPassed && !progress.isComplete(id)) return;
    progress.complete(id);
    renderProgress();
    sideNav();
    configureFooterNav();
    const panel = $('#completePanel');
    panel.animate([{opacity:.45,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:300,easing:'ease-out'});
    if (nextId) {
      setTimeout(() => $('#nextLesson')?.focus(), 250);
    }
  });

  function configureFooterNav() {
    const prev = $('#prevLesson');
    const next = $('#nextLesson');
    if (prevId) {
      prev.href = `lesson.html?lesson=${prevId}`;
      prev.querySelector('strong').textContent = `${prevId} · ${data.lessons[prevId].title}`;
    } else {
      prev.classList.add('disabled');
      prev.removeAttribute('href');
      prev.querySelector('strong').textContent = 'Inicio de la ruta';
    }

    if (nextId) {
      const nextUnlocked = progress.isUnlocked(nextId);
      next.href = nextUnlocked ? `lesson.html?lesson=${nextId}` : '#';
      next.classList.toggle('disabled', !nextUnlocked);
      next.setAttribute('aria-disabled', String(!nextUnlocked));
      next.querySelector('strong').textContent = nextUnlocked ? `${nextId} · ${data.lessons[nextId].title}` : `Completa esta lección para desbloquear ${nextId}`;
    } else {
      next.href = 'index.html#entrenamiento';
      next.querySelector('small').textContent = 'RUTA COMPLETADA';
      next.querySelector('strong').textContent = 'Volver al centro de entrenamiento';
    }
  }

  configureFooterNav();
  renderProgress();

  window.addEventListener('mirmc-course-progress', () => {
    renderProgress();
    sideNav();
    configureFooterNav();
  });
})();