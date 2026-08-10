(() => {
  const config = window.MIRMC_CLOUD_CONFIG || {};
  const state = { loaded: false, source: 'static', overrides: 0, error: null };

  function mergeLesson(key, payload) {
    const course = window.MIRMC_COURSE_DATA;
    if (!course?.lessons?.[key] || !payload || typeof payload !== 'object') return false;
    course.lessons[key] = { ...course.lessons[key], ...payload };
    return true;
  }

  function mergeResource(key, payload) {
    const library = window.MIRMC_LIBRARY;
    if (!library?.resources || !payload || typeof payload !== 'object') return false;
    const next = { ...payload, id: key };
    const index = library.resources.findIndex(item => item.id === key);
    if (index >= 0) library.resources[index] = { ...library.resources[index], ...next };
    else library.resources.push(next);
    return true;
  }

  async function load() {
    if (!config.enabled || !config.supabaseUrl || !config.supabasePublishableKey) {
      state.loaded = true;
      return state;
    }

    try {
      const url = new URL(`${config.supabaseUrl}/rest/v1/content_items`);
      url.searchParams.set('select', 'content_type,content_key,published_payload,position,published_at');
      url.searchParams.set('published_payload', 'not.is.null');
      url.searchParams.set('order', 'content_type.asc,position.asc,content_key.asc');
      const response = await fetch(url, {
        headers: {
          apikey: config.supabasePublishableKey,
          Authorization: `Bearer ${config.supabasePublishableKey}`,
          Accept: 'application/json'
        },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`content_http_${response.status}`);
      const rows = await response.json();
      let applied = 0;
      for (const row of Array.isArray(rows) ? rows : []) {
        if (row.content_type === 'lesson' && mergeLesson(row.content_key, row.published_payload)) applied++;
        if (row.content_type === 'resource' && mergeResource(row.content_key, row.published_payload)) applied++;
      }
      state.loaded = true;
      state.source = applied ? 'cloud+static' : 'static';
      state.overrides = applied;
      window.dispatchEvent(new CustomEvent('mirmc-content-ready', { detail: { ...state } }));
      return state;
    } catch (error) {
      state.loaded = true;
      state.error = String(error?.message || error);
      state.source = 'static-fallback';
      window.dispatchEvent(new CustomEvent('mirmc-content-ready', { detail: { ...state } }));
      return state;
    }
  }

  window.MIRMCContent = { state, ready: load(), reload: load };
})();