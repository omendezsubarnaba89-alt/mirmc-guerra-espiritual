(() => {
  const study = window.MIRMCStudy;
  if (!study) return;

  function detectItem(){
    const params = new URLSearchParams(location.search);
    const lessonId = params.get('lesson');
    if (lessonId && window.MIRMC_COURSE_DATA?.lessons?.[String(lessonId).padStart(2,'0')]) {
      const id = String(lessonId).padStart(2,'0');
      const lesson = window.MIRMC_COURSE_DATA.lessons[id];
      return { type:'lesson', id, title:lesson.title, subtitle:lesson.subtitle || '', url:`lesson.html?lesson=${id}` };
    }
    const resourceId = params.get('id');
    const resource = window.MIRMC_RESOURCES?.find?.(item => item.id === resourceId);
    if (resource) return { type:'resource', id:resource.id, title:resource.title, subtitle:resource.subtitle || '', url:`resource.html?id=${encodeURIComponent(resource.id)}` };
    return null;
  }

  const item = detectItem();
  if (!item) return;
  study.touch(item);

  function mount(){
    if (document.getElementById('studyToolsCard')) return;
    const target = item.type === 'lesson'
      ? document.querySelector('.lesson-hero')
      : document.querySelector('.resource-meta');
    if (!target) return setTimeout(mount, 20);

    const currentNote = study.note(item.type,item.id)?.text || '';
    const card = document.createElement('section');
    card.id = 'studyToolsCard';
    card.className = `study-tools-card ${item.type}`;
    card.innerHTML = `
      <div class="study-tools-head">
        <div><span>CUADERNO PERSONAL</span><strong>Guarda lo que no quieres perder.</strong></div>
        <div class="study-tools-actions"><button id="studyBookmark" type="button"></button><a href="study.html">Abrir cuaderno ↗</a></div>
      </div>
      <label class="study-note-label"><span>MI NOTA SOBRE ${item.type === 'lesson' ? 'ESTA LECCIÓN' : 'ESTE RECURSO'}</span><textarea id="studyNote" maxlength="12000" placeholder="Escribe una idea, pregunta, aplicación o algo que quieras revisar después…">${escapeHtml(currentNote)}</textarea></label>
      <div class="study-save-row"><small id="studySaveStatus">Las notas se guardan en este navegador y entran en tu respaldo.</small><button id="studySave" type="button">Guardar nota</button></div>`;

    if (item.type === 'lesson') target.insertAdjacentElement('afterend', card);
    else target.insertAdjacentElement('afterend', card);

    const bookmark = card.querySelector('#studyBookmark');
    const refreshBookmark = () => {
      const active = study.isBookmarked(item.type,item.id);
      bookmark.classList.toggle('active', active);
      bookmark.textContent = active ? '★ Guardado' : '☆ Guardar';
      bookmark.setAttribute('aria-pressed', String(active));
    };
    refreshBookmark();
    bookmark.addEventListener('click', () => { study.bookmark(item); refreshBookmark(); });

    const textarea = card.querySelector('#studyNote');
    const status = card.querySelector('#studySaveStatus');
    card.querySelector('#studySave').addEventListener('click', () => {
      const saved = study.saveNote(item, textarea.value);
      status.textContent = saved ? `Nota guardada · ${new Date(saved.updatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}` : 'La nota vacía fue eliminada.';
    });
  }

  function escapeHtml(value){
    return String(value || '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  mount();
})();
