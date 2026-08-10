(() => {
  const data = window.MIRMC_COURSE_DATA;
  const progress = window.MIRMCProgress;
  const stage = document.getElementById('levelStage');
  const tabs = [...document.querySelectorAll('.training-tab')];
  const training = document.getElementById('entrenamiento');
  if (!data || !progress || !stage || !training) return;

  let decorating = false;

  function createOverview() {
    if (document.getElementById('courseOverview')) return;
    const overview = document.createElement('div');
    overview.id = 'courseOverview';
    overview.className = 'course-overview reveal visible';
    overview.innerHTML = `
      <div class="course-overview-main">
        <span>PROGRESO DE LA RUTA</span>
        <strong id="courseHomePct">0%</strong>
        <div class="course-home-track"><i id="courseHomeBar"></i></div>
      </div>
      <div class="course-overview-stats">
        <div><b id="courseHomeCount">0/15</b><small>LECCIONES</small></div>
        <div><b id="courseHomeNext">01</b><small>PRÓXIMA</small></div>
      </div>
      <a class="course-continue" id="courseContinue" href="lesson.html?lesson=01">Comenzar ruta <span>→</span></a>
    `;
    const tabContainer = training.querySelector('.training-tabs');
    tabContainer?.before(overview);
  }

  function updateOverview() {
    createOverview();
    const stats = progress.stats();
    const next = progress.nextAvailable();
    const pct = document.getElementById('courseHomePct');
    const bar = document.getElementById('courseHomeBar');
    const count = document.getElementById('courseHomeCount');
    const nextEl = document.getElementById('courseHomeNext');
    const continueLink = document.getElementById('courseContinue');
    if (pct) pct.textContent = `${stats.pct}%`;
    if (bar) bar.style.width = `${stats.pct}%`;
    if (count) count.textContent = `${stats.completed}/${stats.total}`;
    if (nextEl) nextEl.textContent = stats.completed === stats.total ? '✓' : next;
    if (continueLink) {
      if (stats.completed === stats.total) {
        continueLink.href = 'lesson.html?lesson=15';
        continueLink.innerHTML = 'Ruta completada <span>✓</span>';
      } else {
        continueLink.href = `lesson.html?lesson=${next}`;
        continueLink.innerHTML = `${stats.completed ? 'Continuar' : 'Comenzar'} ruta <span>→</span>`;
      }
    }
  }

  function currentLevelFromStage() {
    const kicker = stage.querySelector('.level-kicker')?.textContent || '';
    const match = kicker.match(/NIVEL\s+(\d+)/i);
    return match ? Number(match[1]) : Number(tabs.find(t => t.classList.contains('active'))?.dataset.level || 1);
  }

  function decorateRows() {
    if (decorating) return;
    decorating = true;
    const rows = [...stage.querySelectorAll('.lesson-list li')];
    rows.forEach(row => {
      const number = row.querySelector(':scope > span')?.textContent?.trim();
      if (!number || !data.lessons[number]) return;
      row.classList.add('course-lesson-row');
      row.querySelector('.course-row-action')?.remove();
      row.classList.remove('is-complete','is-locked','is-open');

      const complete = progress.isComplete(number);
      const unlocked = progress.isUnlocked(number);
      const action = document.createElement(unlocked ? 'a' : 'span');
      action.className = 'course-row-action';

      if (complete) {
        row.classList.add('is-complete');
        action.textContent = 'COMPLETADA ✓';
        action.href = `lesson.html?lesson=${number}`;
      } else if (unlocked) {
        row.classList.add('is-open');
        action.textContent = 'ABRIR →';
        action.href = `lesson.html?lesson=${number}`;
      } else {
        row.classList.add('is-locked');
        action.textContent = 'BLOQUEADA';
        action.setAttribute('aria-label', `Lección ${number} bloqueada`);
      }
      row.appendChild(action);
    });

    const level = currentLevelFromStage();
    const summary = stage.querySelector('.level-summary');
    if (summary) {
      summary.querySelector('.level-progress-inline')?.remove();
      const s = progress.stats().byLevel[level];
      const block = document.createElement('div');
      block.className = 'level-progress-inline';
      block.innerHTML = `<span>NIVEL ${level}</span><div><i style="width:${s.pct}%"></i></div><b>${s.done}/${s.total}</b>`;
      summary.appendChild(block);
    }
    decorating = false;
  }

  function decorateLibraryHome() {
    const resourceGrid = document.querySelector('.resource-grid');
    if (!resourceGrid) return;
    const mappings = ['formacion','estudio','discernimiento','liderazgo','repaso','devocional'];
    const cards = [...resourceGrid.querySelectorAll('.resource-card')];
    cards.forEach((card, index) => {
      if (card.dataset.libraryReady === 'true') return;
      const type = mappings[index] || 'formacion';
      const url = `library.html?type=${type}`;
      card.dataset.libraryReady = 'true';
      card.classList.add('library-clickable');
      card.setAttribute('role','link');
      card.setAttribute('tabindex','0');
      card.setAttribute('aria-label', `${card.querySelector('h3')?.textContent || 'Recurso'}: abrir en la Biblioteca MIRMC`);
      const go = () => { location.href = url; };
      card.addEventListener('click', go);
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          go();
        }
      });
    });

    if (!document.getElementById('libraryHomeCta')) {
      const cta = document.createElement('div');
      cta.id = 'libraryHomeCta';
      cta.className = 'library-home-cta';
      cta.innerHTML = '<a class="button button-primary" href="library.html">Abrir biblioteca completa <span>→</span></a>';
      resourceGrid.after(cta);
    }
  }

  createOverview();
  updateOverview();
  decorateRows();
  decorateLibraryHome();

  const observer = new MutationObserver(() => {
    if (decorating) return;
    requestAnimationFrame(decorateRows);
  });
  observer.observe(stage, { childList: true, subtree: false });

  tabs.forEach(tab => tab.addEventListener('click', () => setTimeout(decorateRows, 20)));
  window.addEventListener('mirmc-course-progress', () => {
    updateOverview();
    decorateRows();
  });
})();
