(() => {
  const KEY = 'mirmc-guerra-espiritual-assessments-v1';
  const data = window.MIRMC_ASSESSMENTS || {};

  function read(){
    try { const p = JSON.parse(localStorage.getItem(KEY) || '{}'); return p && typeof p === 'object' ? p : {}; }
    catch { return {}; }
  }
  function write(value){
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch {}
    window.dispatchEvent(new CustomEvent('mirmc-assessment-progress', { detail:value }));
  }
  function record(level, score, total){
    const id = String(level);
    const state = read();
    const previous = state[id] || { attempts:0, bestScore:0, bestPct:0, passed:false };
    const pct = Math.round(score / Math.max(total,1) * 100);
    state[id] = {
      attempts: previous.attempts + 1,
      lastScore: score,
      total,
      lastPct: pct,
      bestScore: pct >= (previous.bestPct || 0) ? score : previous.bestScore,
      bestPct: Math.max(previous.bestPct || 0, pct),
      passed: previous.passed || pct >= Number(data[id]?.pass || 80),
      lastAt: new Date().toISOString(),
      passedAt: previous.passedAt || (pct >= Number(data[id]?.pass || 80) ? new Date().toISOString() : null)
    };
    write(state);
    return state[id];
  }
  function result(level){ return read()[String(level)] || null; }
  function passed(level){ return Boolean(result(level)?.passed); }
  function average(){
    const levels = ['1','2','3'];
    const values = levels.map(l => result(l)?.bestPct).filter(v => Number.isFinite(v));
    return values.length ? Math.round(values.reduce((a,b)=>a+b,0)/values.length) : 0;
  }
  function stats(){
    const levels = ['1','2','3'].map(level => ({ level:Number(level), ...(result(level) || { attempts:0,bestPct:0,passed:false }) }));
    return { levels, passed:levels.filter(x=>x.passed).length, total:3, average:average() };
  }
  function reset(){ try { localStorage.removeItem(KEY); } catch {} write({}); }

  window.MIRMCAssessmentProgress = { KEY, read, write, record, result, passed, average, stats, reset };
})();