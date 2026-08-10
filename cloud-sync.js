(() => {
  const KEYS = {
    guard: 'mirmc-guerra-espiritual-guardia-v1',
    course: 'mirmc-guerra-espiritual-course-v1',
    exams: 'mirmc-guerra-espiritual-assessments-v1',
    study: 'mirmc-guerra-espiritual-study-v1',
    certificateName: 'mirmc-guerra-espiritual-certificate-name-v1'
  };

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
  }

  function snapshot() {
    return {
      schemaVersion: 1,
      guard: readJson(KEYS.guard),
      course: readJson(KEYS.course),
      exams: readJson(KEYS.exams),
      study: readJson(KEYS.study),
      certificateName: localStorage.getItem(KEYS.certificateName) || ''
    };
  }

  function isEmptyObject(value) {
    return !value || typeof value !== 'object' || Object.keys(value).length === 0;
  }

  function isMeaningful(data) {
    return Boolean(data && (!isEmptyObject(data.guard) || !isEmptyObject(data.course) || !isEmptyObject(data.exams) || !isEmptyObject(data.study) || data.certificateName));
  }

  function mergeGuard(local = {}, remote = {}) {
    const out = { ...remote };
    for (const [key, value] of Object.entries(local)) {
      if (typeof value === 'boolean' || typeof remote[key] === 'boolean') out[key] = Boolean(value || remote[key]);
      else out[key] = value ?? remote[key];
    }
    return out;
  }

  function latestIso(a, b) {
    if (!a) return b || null;
    if (!b) return a || null;
    return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
  }

  function earliestIso(a, b) {
    if (!a) return b || null;
    if (!b) return a || null;
    return new Date(a).getTime() <= new Date(b).getTime() ? a : b;
  }

  function mergeCourse(local = {}, remote = {}) {
    const ids = new Set([...Object.keys(remote), ...Object.keys(local)]);
    const out = {};
    ids.forEach(id => {
      const a = remote[id] || {};
      const b = local[id] || {};
      out[id] = {
        ...a,
        ...b,
        completed: Boolean(a.completed || b.completed),
        quizScore: Math.max(Number(a.quizScore || 0), Number(b.quizScore || 0)),
        quizTotal: Math.max(Number(a.quizTotal || 0), Number(b.quizTotal || 0)),
        quizAt: latestIso(a.quizAt, b.quizAt),
        completedAt: earliestIso(a.completedAt, b.completedAt)
      };
      if (!out[id].quizTotal) delete out[id].quizTotal;
      if (!out[id].quizScore) delete out[id].quizScore;
      if (!out[id].quizAt) delete out[id].quizAt;
      if (!out[id].completedAt) delete out[id].completedAt;
    });
    return out;
  }

  function mergeExams(local = {}, remote = {}) {
    const levels = new Set([...Object.keys(remote), ...Object.keys(local)]);
    const out = {};
    levels.forEach(level => {
      const a = remote[level] || {};
      const b = local[level] || {};
      const aTime = new Date(a.lastAt || 0).getTime();
      const bTime = new Date(b.lastAt || 0).getTime();
      const latest = bTime >= aTime ? b : a;
      const aBest = Number(a.bestPct || 0);
      const bBest = Number(b.bestPct || 0);
      const bestSource = bBest >= aBest ? b : a;
      out[level] = {
        ...a,
        ...b,
        passed: Boolean(a.passed || b.passed),
        attempts: Math.max(Number(a.attempts || 0), Number(b.attempts || 0)),
        total: Math.max(Number(a.total || 0), Number(b.total || 0)) || latest.total,
        bestPct: Math.max(aBest, bBest),
        bestScore: bestSource.bestScore ?? latest.bestScore ?? 0,
        lastScore: latest.lastScore ?? null,
        lastPct: latest.lastPct ?? null,
        lastAt: latestIso(a.lastAt, b.lastAt),
        passedAt: earliestIso(a.passedAt, b.passedAt)
      };
    });
    return out;
  }

  function mergeStudy(local = {}, remote = {}) {
    const a = remote && typeof remote === 'object' ? remote : {};
    const b = local && typeof local === 'object' ? local : {};
    const bookmarks = { ...(a.bookmarks || {}), ...(b.bookmarks || {}) };
    const notes = { ...(a.notes || {}) };
    for (const [key, note] of Object.entries(b.notes || {})) {
      const remoteNote = notes[key];
      if (!remoteNote || new Date(note?.updatedAt || 0).getTime() >= new Date(remoteNote?.updatedAt || 0).getTime()) notes[key] = note;
    }
    const historyMap = new Map();
    for (const entry of [...(a.history || []), ...(b.history || [])]) {
      if (!entry?.key) continue;
      const old = historyMap.get(entry.key);
      if (!old || new Date(entry.lastAt || 0).getTime() >= new Date(old.lastAt || 0).getTime()) historyMap.set(entry.key, entry);
    }
    const history = [...historyMap.values()].sort((x,y) => new Date(y.lastAt || 0) - new Date(x.lastAt || 0)).slice(0,30);
    return { bookmarks, notes, history };
  }

  function merge(local, remote) {
    local = local || {};
    remote = remote || {};
    return {
      schemaVersion: 1,
      guard: mergeGuard(local.guard, remote.guard),
      course: mergeCourse(local.course, remote.course),
      exams: mergeExams(local.exams, remote.exams),
      study: mergeStudy(local.study, remote.study),
      certificateName: (local.certificateName || remote.certificateName || '').slice(0, 80)
    };
  }

  function apply(data) {
    if (!data || typeof data !== 'object') throw new Error('Datos de sincronización inválidos.');
    localStorage.setItem(KEYS.guard, JSON.stringify(data.guard || {}));
    localStorage.setItem(KEYS.course, JSON.stringify(data.course || {}));
    localStorage.setItem(KEYS.exams, JSON.stringify(data.exams || {}));
    localStorage.setItem(KEYS.study, JSON.stringify(data.study || {}));
    if (typeof data.certificateName === 'string') localStorage.setItem(KEYS.certificateName, data.certificateName.slice(0, 80));
    window.dispatchEvent(new CustomEvent('mirmc-cloud-applied', { detail: data }));
  }

  async function requireUser() {
    const cloud = window.MIRMCCloud;
    if (!cloud?.configured()) throw new Error('La nube todavía no está configurada.');
    const client = await cloud.getClient();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError || !authData?.user) throw new Error('Inicia sesión para sincronizar.');
    return { client, user: authData.user };
  }

  async function readRemote() {
    const { client, user } = await requireUser();
    const { data, error } = await client
      .from('user_learning_state')
      .select('payload,client_updated_at,updated_at')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    return { client, user, row: data || null };
  }

  async function push(payload = snapshot()) {
    const { client, user } = await requireUser();
    const now = new Date().toISOString();
    const { error } = await client.from('user_learning_state').upsert({
      user_id: user.id,
      schema_version: 1,
      payload,
      client_updated_at: now
    }, { onConflict: 'user_id' });
    if (error) throw error;
    return { payload, syncedAt: now, direction: 'push' };
  }

  async function pull() {
    const { row } = await readRemote();
    if (!row?.payload) return { payload: snapshot(), syncedAt: null, direction: 'none' };
    apply(row.payload);
    return { payload: row.payload, syncedAt: row.updated_at || row.client_updated_at || null, direction: 'pull' };
  }

  async function sync() {
    const local = snapshot();
    const { row } = await readRemote();
    const remote = row?.payload || null;
    if (!remote && !isMeaningful(local)) return { payload: local, direction: 'none', message: 'No hay progreso para sincronizar todavía.' };
    if (!remote) {
      const result = await push(local);
      return { ...result, message: 'Progreso local guardado en la nube.' };
    }
    if (!isMeaningful(local)) {
      apply(remote);
      return { payload: remote, direction: 'pull', message: 'Progreso recuperado desde la nube.' };
    }
    const merged = merge(local, remote);
    apply(merged);
    const result = await push(merged);
    return { ...result, direction: 'merge', message: 'Progreso, notas y favoritos combinados sin perder avances.' };
  }

  window.MIRMCSync = { KEYS, snapshot, isMeaningful, merge, apply, readRemote, push, pull, sync };
})();
