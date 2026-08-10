(() => {
  if (window.__MIRMC_AUTO_SYNC__) return;
  window.__MIRMC_AUTO_SYNC__ = { started: false, session: false, lastSyncAt: null };

  const status = window.__MIRMC_AUTO_SYNC__;
  let client = null;
  let session = null;
  let busy = false;
  let queued = false;
  let lastFingerprint = '';
  let debounceTimer = null;

  function emit(state, detail = {}) {
    window.dispatchEvent(new CustomEvent('mirmc-cloud-status', {
      detail: { state, at: new Date().toISOString(), ...detail }
    }));
  }

  function loadScript(src, ready) {
    if (ready()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = [...document.scripts].find(script => (script.getAttribute('src') || '').endsWith(src));
      if (existing) {
        const poll = setInterval(() => {
          if (ready()) { clearInterval(poll); resolve(); }
        }, 50);
        setTimeout(() => { clearInterval(poll); ready() ? resolve() : reject(new Error(`No se pudo cargar ${src}`)); }, 10000);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => ready() ? resolve() : reject(new Error(`Carga incompleta: ${src}`));
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.head.appendChild(script);
    });
  }

  async function ensureCloudModules() {
    await loadScript('cloud-config.js', () => Boolean(window.MIRMC_CLOUD_CONFIG));
    await loadScript('cloud-client.js', () => Boolean(window.MIRMCCloud));
    await loadScript('cloud-sync.js', () => Boolean(window.MIRMCSync));
  }

  function fingerprint() {
    try { return JSON.stringify(window.MIRMCSync?.snapshot?.() || {}); }
    catch { return ''; }
  }

  async function reconcile(reason = 'manual', force = false) {
    if (!session || !window.MIRMCSync || !navigator.onLine) return;
    const current = fingerprint();
    if (!force && current && current === lastFingerprint) return;
    if (busy) { queued = true; return; }

    busy = true;
    emit('syncing', { reason });
    try {
      const result = await window.MIRMCSync.sync();
      lastFingerprint = fingerprint();
      status.lastSyncAt = new Date().toISOString();
      emit('synced', { reason, direction: result?.direction || 'none', message: result?.message || '' });
    } catch (error) {
      emit('error', { reason, message: error?.message || 'No se pudo sincronizar.' });
    } finally {
      busy = false;
      if (queued) {
        queued = false;
        setTimeout(() => reconcile('queued', true), 300);
      }
    }
  }

  function schedule(reason = 'change') {
    if (!session) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => reconcile(reason, false), 1200);
  }

  async function setSession(nextSession) {
    session = nextSession || null;
    status.session = Boolean(session);
    if (!session) {
      lastFingerprint = fingerprint();
      emit('signed-out');
      return;
    }
    await reconcile('session-start', true);
  }

  async function boot() {
    try {
      await ensureCloudModules();
      if (!window.MIRMCCloud?.configured()) {
        emit('local-only');
        return;
      }

      client = await window.MIRMCCloud.getClient();
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      status.started = true;
      await setSession(data?.session || null);

      client.auth.onAuthStateChange((_event, nextSession) => {
        setTimeout(() => setSession(nextSession), 0);
      });

      ['mirmc-course-progress', 'mirmc-assessment-progress', 'mirmc-study-change'].forEach(name => {
        window.addEventListener(name, () => schedule(name));
      });
      window.addEventListener('storage', () => schedule('storage'));
      window.addEventListener('online', () => reconcile('online', true));
      window.addEventListener('focus', () => reconcile('focus', true));
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) reconcile('visible', true);
      });

      setInterval(() => reconcile('local-check', false), 15000);
      setInterval(() => reconcile('remote-check', true), 60000);
    } catch (error) {
      emit('error', { reason: 'boot', message: error?.message || 'No se pudo iniciar la nube.' });
    }
  }

  boot();
})();
