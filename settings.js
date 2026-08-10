(() => {
  const KEYS = {
    guard:'mirmc-guerra-espiritual-guardia-v1',
    course:'mirmc-guerra-espiritual-course-v1',
    exams:'mirmc-guerra-espiritual-assessments-v1',
    certificateName:'mirmc-guerra-espiritual-certificate-name-v1'
  };
  const $ = s => document.querySelector(s);

  function readJson(key){
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
  }
  function snapshot(){
    return {
      app:'MIRMC Guerra Espiritual',
      version:1,
      exportedAt:new Date().toISOString(),
      data:{
        guard:readJson(KEYS.guard),
        course:readJson(KEYS.course),
        exams:readJson(KEYS.exams),
        certificateName:localStorage.getItem(KEYS.certificateName) || ''
      }
    };
  }
  function counts(){
    const course = readJson(KEYS.course);
    const exams = readJson(KEYS.exams);
    const guard = readJson(KEYS.guard);
    const lessonCount = Object.values(course).filter(x => x?.completed).length;
    const examCount = Object.values(exams).filter(x => x?.passed).length;
    const guardCount = Object.values(guard).filter(Boolean).length;
    return { lessonCount, examCount, guardCount, hasName:Boolean(localStorage.getItem(KEYS.certificateName)) };
  }
  function renderStatus(){
    const c = counts();
    $('#settingsStatus').innerHTML = `
      <div><small>LECCIONES</small><strong>${c.lessonCount}/15</strong></div>
      <div><small>EXÁMENES</small><strong>${c.examCount}/3</strong></div>
      <div><small>GUARDIAS</small><strong>${c.guardCount}</strong></div>
      <div><small>NOMBRE CERT.</small><strong>${c.hasName ? 'SÍ' : 'NO'}</strong></div>`;
  }

  $('#exportBackup').addEventListener('click', () => {
    const data = JSON.stringify(snapshot(), null, 2);
    const blob = new Blob([data], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0,10);
    link.href = url;
    link.download = `mirmc-guerra-espiritual-respaldo-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  $('#importBackup').addEventListener('change', async event => {
    const result = $('#importResult');
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.app !== 'MIRMC Guerra Espiritual' || parsed?.version !== 1 || !parsed?.data || typeof parsed.data !== 'object') throw new Error('Formato de respaldo no reconocido.');
      const { guard, course, exams, certificateName } = parsed.data;
      if (!guard || typeof guard !== 'object' || !course || typeof course !== 'object' || !exams || typeof exams !== 'object') throw new Error('El respaldo está incompleto.');
      localStorage.setItem(KEYS.guard, JSON.stringify(guard));
      localStorage.setItem(KEYS.course, JSON.stringify(course));
      localStorage.setItem(KEYS.exams, JSON.stringify(exams));
      if (typeof certificateName === 'string') localStorage.setItem(KEYS.certificateName, certificateName.slice(0,80));
      result.className = 'settings-result success';
      result.textContent = 'Respaldo restaurado correctamente. Tu progreso ya está disponible en este navegador.';
      renderStatus();
    } catch (error) {
      result.className = 'settings-result error';
      result.textContent = error?.message || 'No se pudo restaurar el respaldo.';
    } finally {
      event.target.value = '';
    }
  });

  $('#resetAll').addEventListener('click', () => {
    const confirmed = window.confirm('Esto borrará todo el progreso local de MIRMC Guerra Espiritual en este navegador. ¿Continuar?');
    if (!confirmed) return;
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    renderStatus();
    const result = $('#importResult');
    result.className = 'settings-result success';
    result.textContent = 'Los datos locales fueron eliminados.';
  });

  let installPrompt = null;
  const installButton = $('#installApp');
  const installHint = $('#installHint');
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    installButton.disabled = false;
    installButton.textContent = 'Instalar MIRMC Guerra Espiritual';
    installHint.textContent = 'Tu navegador permite instalar la aplicación en este dispositivo.';
  });
  installButton.addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.disabled = true;
    installButton.textContent = 'Solicitud de instalación enviada';
  });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  renderStatus();
})();