(() => {
  const KEY = 'mirmc-guerra-espiritual-study-v1';

  function read(){
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || '{}');
      return {
        bookmarks: data?.bookmarks && typeof data.bookmarks === 'object' ? data.bookmarks : {},
        notes: data?.notes && typeof data.notes === 'object' ? data.notes : {},
        history: Array.isArray(data?.history) ? data.history : []
      };
    } catch { return { bookmarks:{}, notes:{}, history:[] }; }
  }

  function write(state){
    localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('mirmc-study-change', { detail: state }));
    return state;
  }

  function makeKey(type,id){ return `${type}:${String(id)}`; }

  function bookmark(item){
    const state = read();
    const key = makeKey(item.type,item.id);
    if (state.bookmarks[key]) delete state.bookmarks[key];
    else state.bookmarks[key] = { ...item, key, addedAt:new Date().toISOString() };
    write(state);
    return Boolean(state.bookmarks[key]);
  }

  function isBookmarked(type,id){ return Boolean(read().bookmarks[makeKey(type,id)]); }

  function saveNote(item,text){
    const state = read();
    const key = makeKey(item.type,item.id);
    const clean = String(text || '').trim().slice(0,12000);
    if (!clean) delete state.notes[key];
    else state.notes[key] = { ...item, key, text:clean, updatedAt:new Date().toISOString() };
    write(state);
    return state.notes[key] || null;
  }

  function note(type,id){ return read().notes[makeKey(type,id)] || null; }

  function touch(item){
    const state = read();
    const key = makeKey(item.type,item.id);
    const current = { ...item, key, lastAt:new Date().toISOString() };
    state.history = [current, ...state.history.filter(entry => entry?.key !== key)].slice(0,30);
    write(state);
    return current;
  }

  function clearHistory(){ const state = read(); state.history=[]; write(state); }

  window.MIRMCStudy = { KEY, read, write, makeKey, bookmark, isBookmarked, saveNote, note, touch, clearHistory };

  if (!window.__MIRMC_AUTO_SYNC_LOADER__) {
    window.__MIRMC_AUTO_SYNC_LOADER__ = true;
    const script = document.createElement('script');
    script.src = 'cloud-autosync.js';
    script.defer = true;
    document.head.appendChild(script);
  }
})();
