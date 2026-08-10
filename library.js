(() => {
  const data = window.MIRMC_LIBRARY;
  if (!data) return;

  const $ = s => document.querySelector(s);
  const search = $('#librarySearch');
  const categoryFilter = $('#categoryFilter');
  const levelFilter = $('#levelFilter');
  const clearFilters = $('#clearFilters');
  const featuredGrid = $('#featuredGrid');
  const featuredSection = $('#featuredSection');
  const libraryGrid = $('#libraryGrid');
  const resultsCount = $('#resultsCount');
  const libraryEmpty = $('#libraryEmpty');
  const stats = $('#libraryStats');

  const params = new URLSearchParams(location.search);

  data.categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    categoryFilter.appendChild(option);
  });

  const initialCategory = params.get('type');
  if (initialCategory && data.categories.some(c => c.id === initialCategory)) categoryFilter.value = initialCategory;
  const initialLevel = params.get('level');
  if (['1','2','3'].includes(initialLevel)) levelFilter.value = initialLevel;
  const initialQuery = params.get('q');
  if (initialQuery) search.value = initialQuery;

  function categoryName(id) {
    return data.categories.find(c => c.id === id)?.name || id;
  }

  function card(resource, featured = false) {
    const cls = featured ? 'featured-card' : 'library-card';
    return `<a class="${cls}" href="resource.html?id=${encodeURIComponent(resource.id)}">
      <div class="resource-topline"><span>NIVEL ${resource.level} · ${resource.format.toUpperCase()}</span><b>${categoryName(resource.category).toUpperCase()}</b></div>
      <h3>${resource.title}</h3>
      <p>${resource.summary}</p>
      <span class="resource-open">ABRIR RECURSO →</span>
    </a>`;
  }

  function normalized(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  }

  function matches(resource) {
    const q = normalized(search.value.trim());
    const cat = categoryFilter.value;
    const level = levelFilter.value;
    const haystack = normalized([resource.title,resource.subtitle,resource.summary,resource.category,resource.format,...resource.scriptures].join(' '));
    return (!q || haystack.includes(q)) && (cat === 'all' || resource.category === cat) && (level === 'all' || String(resource.level) === level);
  }

  function render() {
    const filtered = data.resources.filter(matches);
    const hasFilters = Boolean(search.value.trim()) || categoryFilter.value !== 'all' || levelFilter.value !== 'all';
    const featured = hasFilters ? [] : data.resources.filter(r => r.featured).slice(0,4);

    featuredSection.hidden = featured.length === 0;
    featuredGrid.innerHTML = featured.map(r => card(r, true)).join('');
    libraryGrid.innerHTML = filtered.map(r => card(r, false)).join('');
    resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'RECURSO' : 'RECURSOS'}`;
    libraryEmpty.hidden = filtered.length !== 0;

    const newParams = new URLSearchParams();
    if (search.value.trim()) newParams.set('q', search.value.trim());
    if (categoryFilter.value !== 'all') newParams.set('type', categoryFilter.value);
    if (levelFilter.value !== 'all') newParams.set('level', levelFilter.value);
    history.replaceState(null,'',`${location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`);
  }

  stats.innerHTML = `<span><b>${data.resources.length}</b> RECURSOS</span><span><b>${data.categories.length}</b> CATEGORÍAS</span><span><b>3</b> NIVELES</span><span><b>0</b> DESCARGAS FALSAS</span>`;

  let timer;
  search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 90); });
  categoryFilter.addEventListener('change', render);
  levelFilter.addEventListener('change', render);
  clearFilters.addEventListener('click', () => {
    search.value = '';
    categoryFilter.value = 'all';
    levelFilter.value = 'all';
    render();
    search.focus();
  });

  render();
})();
