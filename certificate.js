(() => {
  const progress = window.MIRMCProgress;
  const exams = window.MIRMCAssessmentProgress;
  const locked = document.getElementById('certificateLocked');
  const experience = document.getElementById('certificateExperience');
  const eligible = progress?.stats().completed === progress?.stats().total && [1,2,3].every(level => exams?.passed(level));

  if (!eligible) {
    locked.hidden = false;
    experience.hidden = true;
    return;
  }

  locked.hidden = true;
  experience.hidden = false;
  const NAME_KEY = 'mirmc-guerra-espiritual-certificate-name-v1';
  const input = document.getElementById('certificateName');
  const display = document.getElementById('certificateDisplayName');
  const saved = (() => { try { return localStorage.getItem(NAME_KEY) || ''; } catch { return ''; } })();
  input.value = saved;
  display.textContent = saved || 'Nombre del participante';

  input.addEventListener('input', () => {
    const value = input.value.trim();
    display.textContent = value || 'Nombre del participante';
    try { localStorage.setItem(NAME_KEY, value); } catch {}
  });

  const examStats = exams.stats();
  document.getElementById('certificateAverage').textContent = `${examStats.average}%`;
  const passedDates = examStats.levels.map(item => item.passedAt).filter(Boolean).map(value => new Date(value));
  const finalDate = passedDates.length ? new Date(Math.max(...passedDates.map(d => d.getTime()))) : new Date();
  document.getElementById('certificateDate').textContent = new Intl.DateTimeFormat('es', { day:'2-digit', month:'short', year:'numeric' }).format(finalDate).toUpperCase();

  const seed = `${examStats.average}-${finalDate.toISOString().slice(0,10)}-${progress.stats().completed}`;
  let hash = 0;
  for (let i=0;i<seed.length;i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  document.getElementById('certificateCode').textContent = `REGISTRO LOCAL · MIRMC-${Math.abs(hash).toString(36).toUpperCase().padStart(6,'0').slice(0,6)}`;

  document.getElementById('printCertificate').addEventListener('click', () => {
    if (!input.value.trim()) {
      input.focus();
      input.setCustomValidity('Escribe el nombre para el certificado.');
      input.reportValidity();
      input.setCustomValidity('');
      return;
    }
    window.print();
  });
})();