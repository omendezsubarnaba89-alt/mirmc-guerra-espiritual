(() => {
  const course = window.MIRMC_COURSE_DATA || { lessons:{} };
  const library = window.MIRMC_LIBRARY || { resources:[], categories:[] };
  const study = window.MIRMCStudy;
  if (!study) return;
  const $ = s => document.querySelector(s);

  const categoryName = id => library.categories?.find(c => c.id === id)?.name || id;
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

  const lessons = Object.entries(course.lessons || {}).map(([id,item]) => ({
    key:`lesson:${id}`, type:'lesson', id, level:item.level, title:item.title, subtitle:item.subtitle || '',
    meta:`Lección ${id} · Nivel ${item.level}`, url:`lesson.html?lesson=${id}`,
    search:normalize([item.title,item.subtitle,item.objective,item.core,...(item.scriptures || []),...(item.sections || []).flatMap(s => [s.title,s.body]),...(item.keyPoints || [])].join(' '))
  })).sort((a,b) => Number(a.id) - Number(b.id));

  const resources = (library.resources || []).map(item => ({
    key:`resource:${item.id}`, type:'resource', id:item.id, level:item.level, title:item.title, subtitle:item.subtitle || item.summary || '',
    meta:`${categoryName(item.category)} · Nivel ${item.level}`, url:`resource.html?id=${encodeURIComponent(item.id)}`,
    search:normalize([item.title,item.subtitle,item.summary,item.takeaway,...(item.scriptures || []),...(item.sections || []).flat()].join(' '))
  })).sort((a,b) => a.title.localeCompare(b.title,'es'));

  const catalog = [...lessons, ...resources];
  const PAGE_SIZE = 8;
  let view = 'search';
  let visibleLimit = PAGE_SIZE;

  function state(){ return study.read(); }

  function renderStats(){
    const s = state();
    $('#studyStats').innerHTML = `
      <div><small>LECCIONES</small><strong>${lessons.length}</strong></div>
      <div><small>RECURSOS</small><strong>${resources.length}</strong></div>
      <div><small>FAVORITOS</small><strong>${Object.keys(s.bookmarks).length}</strong></div>
      <div><small>NOTAS</small><strong>${Object.keys(s.notes).length}</strong></div>`;
    $('#bookmarkBadge').textContent = Object.keys(s.bookmarks).length;
    $('#noteBadge').textContent = Object.keys(s.notes).length;
  }

  function card(item, options = {}){
    const s = state();
    const bookmarked = Boolean(s.bookmarks[item.key]);
    const note = s.notes[item.key];
    const time = options.time ? new Date(options.time).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}) : '';
    return `<article class="study-result-card" data-key="${item.key}">
      <div class="study-result-top"><span>${item.meta || (item.type === 'lesson' ? 'LECCIÓN' : 'RECURSO')}</span><b>${item.type === 'lesson' ? 'RUTA' : 'BIBLIOTECA'}</b></div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.subtitle || '')}</p>
      ${options.noteText ? `<p class="study-note-preview">${escapeHtml(options.noteText)}</p>` : ''}
      ${time ? `<p class="study-history-time">Última visita: ${escapeHtml(time)}</p>` : ''}
      <div class="study-result-actions">
        <a class="primary" href="${item.url}">Abrir →</a>
        <button type="button" data-action="bookmark">${bookmarked ? '★ Guardado' : '☆ Guardar'}</button>
        ${note ? `<button type="button" data-action="delete-note">Eliminar nota</button>` : ''}
      </div>
    </article>`;
  }

  function catalogItem(entry){ return catalog.find(item => item.key === entry.key) || entry; }

  function rankSearch(items, query){
    if (!query) return items;
    return [...items].sort((a,b) => {
      const aTitle = normalize(a.title).includes(query) ? 0 : normalize(a.subtitle).includes(query) ? 1 : 2;
      const bTitle = normalize(b.title).includes(query) ? 0 : normalize(b.subtitle).includes(query) ? 1 : 2;
      return aTitle - bTitle || (a.type === b.type ? (a.type === 'lesson' ? Number(a.id) - Number(b.id) : a.title.localeCompare(b.title,'es')) : (a.type === 'lesson' ? -1 : 1));
    });
  }

  function render(){
    renderStats();
    const results = $('#studyResults');
    const empty = $('#studyEmpty');
    const query = normalize($('#studySearch').value.trim());
    const type = $('#studyType').value;
    const level = $('#studyLevel').value;
    let items = [];

    if (view === 'search') {
      items = rankSearch(catalog.filter(item => (!query || item.search.includes(query)) && (type === 'all' || item.type === type) && (level === 'all' || String(item.level) === level)), query);
      $('#studyResultLabel').textContent = query ? 'COINCIDENCIAS' : 'RESULTADOS';
      $('#studyResultTitle').textContent = query ? `Buscar: “${$('#studySearch').value.trim()}”` : 'Toda la formación';
      const visible = items.slice(0, visibleLimit);
      results.innerHTML = visible.map(item => card(item)).join('');
      if (visible.length < items.length) {
        results.insertAdjacentHTML('beforeend', `<div class="study-load-more"><button type="button" data-action="load-more">Mostrar ${Math.min(PAGE_SIZE, items.length - visible.length)} más <span>${visible.length}/${items.length}</span></button></div>`);
      }
    } else if (view === 'bookmarks') {
      const entries = Object.values(state().bookmarks).sort((a,b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
      items = entries.map(catalogItem);
      $('#studyResultLabel').textContent = 'FAVORITOS';
      $('#studyResultTitle').textContent = 'Lo que decidiste guardar';
      results.innerHTML = items.map(item => card(item)).join('');
    } else if (view === 'notes') {
      const entries = Object.values(state().notes).sort((a,b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      items = entries;
      $('#studyResultLabel').textContent = 'MIS NOTAS';
      $('#studyResultTitle').textContent = 'Lo que estás procesando';
      results.innerHTML = entries.map(entry => card(catalogItem(entry), { noteText:entry.text })).join('');
    } else {
      const entries = state().history || [];
      items = entries;
      $('#studyResultLabel').textContent = 'RECIENTES';
      $('#studyResultTitle').textContent = 'Por dónde has estado';
      results.innerHTML = entries.map(entry => card(catalogItem(entry), { time:entry.lastAt })).join('');
      if (entries.length) results.insertAdjacentHTML('beforeend','<div class="study-history-clear"><button type="button" data-action="clear-history">Limpiar actividad reciente</button></div>');
    }

    $('#studyResultCount').textContent = `${items.length}`;
    empty.hidden = items.length > 0;
    results.hidden = items.length === 0;
  }

  function resetSearchWindow(){ visibleLimit = PAGE_SIZE; }

  function setView(next){
    view = next;
    resetSearchWindow();
    document.querySelectorAll('.study-tabs button').forEach(button => button.classList.toggle('active', button.dataset.view === view));
    document.querySelector('.study-search-panel').hidden = view !== 'search';
    render();
  }

  $('#studySearch').addEventListener('input', () => { resetSearchWindow(); render(); });
  $('#studyType').addEventListener('change', () => { resetSearchWindow(); render(); });
  $('#studyLevel').addEventListener('change', () => { resetSearchWindow(); render(); });
  document.querySelectorAll('.study-tabs button').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));

  $('#studyResults').addEventListener('click', event => {
    const action = event.target.closest('[data-action]');
    if (!action) return;
    const kind = action.dataset.action;
    if (kind === 'load-more') {
      visibleLimit += PAGE_SIZE;
      render();
      return;
    }
    if (kind === 'clear-history') {
      study.clearHistory();
      render();
      return;
    }
    const cardEl = action.closest('.study-result-card');
    const key = cardEl?.dataset.key;
    const item = catalog.find(entry => entry.key === key) || state().bookmarks[key] || state().notes[key] || state().history.find(entry => entry.key === key);
    if (!item) return;
    if (kind === 'bookmark') study.bookmark(item);
    if (kind === 'delete-note') study.saveNote(item, '');
    render();
  });

  window.addEventListener('mirmc-study-change', render);
  render();

  function escapeHtml(value){ return String(value || '').replace(/[&<>'\"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[char])); }
})();
