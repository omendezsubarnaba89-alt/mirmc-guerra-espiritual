(() => {
  const data = window.MIRMC_LIBRARY;
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const resource = data?.resources?.find(item => item.id === id);
  const $ = s => document.querySelector(s);
  const missing = $('#resourceMissing');
  const article = $('#resourceArticle');

  if (!resource) {
    missing.hidden = false;
    return;
  }

  const category = data.categories.find(c => c.id === resource.category)?.name || resource.category;
  document.title = `${resource.title} | Biblioteca MIRMC`;
  article.hidden = false;
  $('#resourceCategory').textContent = category;
  $('#resourceEyebrow').textContent = `${category.toUpperCase()} · NIVEL ${resource.level}`;
  $('#resourceTitle').textContent = resource.title;
  $('#resourceSubtitle').textContent = resource.subtitle;
  $('#resourceMeta').innerHTML = `<span>${resource.format.toUpperCase()}</span><span>${resource.duration.toUpperCase()}</span><span>NIVEL ${resource.level}</span>`;
  $('#resourceScriptures').innerHTML = resource.scriptures.map(ref => `<span>${ref}</span>`).join('');
  $('#resourceSections').innerHTML = resource.sections.map(([title, body], index) => `
    <section class="resource-section">
      <small>${String(index + 1).padStart(2,'0')} / ${String(resource.sections.length).padStart(2,'0')}</small>
      <h2>${title}</h2>
      <p>${body}</p>
    </section>
  `).join('');
  $('#resourceTakeaway').textContent = resource.takeaway;
})();
