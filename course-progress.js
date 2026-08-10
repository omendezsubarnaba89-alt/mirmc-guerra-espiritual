(() => {
  const KEY = 'mirmc-guerra-espiritual-course-v1';
  const data = window.MIRMC_COURSE_DATA || { lessons: {}, levels: {} };
  const order = Object.keys(data.lessons).sort((a,b) => Number(a) - Number(b));

  function read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch { return {}; }
  }

  function write(progress) {
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch {}
    window.dispatchEvent(new CustomEvent('mirmc-course-progress', { detail: progress }));
  }

  function isComplete(id) {
    return Boolean(read()[id]?.completed);
  }

  function indexOf(id) { return order.indexOf(String(id).padStart(2,'0')); }

  function previous(id) {
    const i = indexOf(id);
    return i > 0 ? order[i - 1] : null;
  }

  function next(id) {
    const i = indexOf(id);
    return i >= 0 && i < order.length - 1 ? order[i + 1] : null;
  }

  function isUnlocked(id) {
    const normalized = String(id).padStart(2,'0');
    if (normalized === order[0]) return true;
    const prev = previous(normalized);
    return prev ? isComplete(prev) : true;
  }

  function complete(id, score = null) {
    const normalized = String(id).padStart(2,'0');
    const progress = read();
    progress[normalized] = {
      ...(progress[normalized] || {}),
      completed: true,
      score,
      completedAt: new Date().toISOString()
    };
    write(progress);
    return progress[normalized];
  }

  function saveQuiz(id, score, total) {
    const normalized = String(id).padStart(2,'0');
    const progress = read();
    progress[normalized] = {
      ...(progress[normalized] || {}),
      quizScore: score,
      quizTotal: total,
      quizAt: new Date().toISOString()
    };
    write(progress);
  }

  function stats() {
    const progress = read();
    const completed = order.filter(id => progress[id]?.completed).length;
    const byLevel = {};
    Object.entries(data.levels).forEach(([level, info]) => {
      const done = info.lessons.filter(id => progress[id]?.completed).length;
      byLevel[level] = { done, total: info.lessons.length, pct: Math.round(done / info.lessons.length * 100) };
    });
    return { completed, total: order.length, pct: Math.round(completed / Math.max(order.length,1) * 100), byLevel };
  }

  function nextAvailable() {
    return order.find(id => isUnlocked(id) && !isComplete(id)) || order[order.length - 1] || null;
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch {}
    window.dispatchEvent(new CustomEvent('mirmc-course-progress', { detail: {} }));
  }

  window.MIRMCProgress = { KEY, read, write, isComplete, isUnlocked, previous, next, complete, saveQuiz, stats, nextAvailable, reset, order };
})();