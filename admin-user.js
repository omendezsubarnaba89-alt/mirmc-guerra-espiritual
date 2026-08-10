(() => {
  const $ = s => document.querySelector(s);
  const cloud = window.MIRMCCloud;
  const courseData = window.MIRMC_COURSE_DATA || { lessons: {}, levels: {} };
  const loading = $('#detailLoading');
  const denied = $('#detailDenied');
  const app = $('#detailApp');
  const roleBox = $('#detailRole');
  const identity = $('#detailIdentity');
  const summary = $('#detailSummary');
  const lessonsWrap = $('#detailLessons');
  const examsWrap = $('#detailExams');
  const messageBox = $('#detailMessage');
  const params = new URLSearchParams(location.search);
  const targetUserId = params.get('id') || '';
  let session = null;

  const escapeHtml = value => String(value || '').replace(/[&<>\"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;' }[ch]));
  const fmtDate = value => {
    if (!value) return '—';
    try { return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
    catch { return '—'; }
  };

  async function callAdmin(action, payload = {}) {
    if (!session?.access_token) throw new Error('Sesión no disponible.');
    const cfg = cloud.config();
    const response = await fetch(`${cfg.supabaseUrl}/functions/v1/admin-management`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': cfg.supabasePublishableKey,
      },
      body: JSON.stringify({ action, ...payload }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const map = {
        forbidden: 'Tu cuenta no tiene permisos administrativos.',
        user_not_found: 'El usuario solicitado no existe.',
        missing_user_id: 'Falta identificar al usuario.',
      };
      throw new Error(map[body?.error] || 'No se pudo cargar el expediente.');
    }
    return body;
  }

  function renderDetail(user) {
    const roleLabel = String(user.role || 'student').replace('_', ' ');
    identity.innerHTML = `
      <small>${user.email_confirmed_at ? 'CORREO CONFIRMADO' : 'CORREO PENDIENTE'} · ${escapeHtml(roleLabel.toUpperCase())}</small>
      <h2>${escapeHtml(user.email)}</h2>
      <p>${escapeHtml(user.display_name || 'Sin nombre visible')} · Alta ${fmtDate(user.created_at)} · Último acceso ${fmtDate(user.last_sign_in_at)}</p>`;

    summary.innerHTML = `
      <div><small>LECCIONES</small><strong>${Number(user.lesson_count || 0)}/15</strong></div>
      <div><small>EXÁMENES</small><strong>${Number(user.exam_count || 0)}/3</strong></div>
      <div><small>GUARDIAS</small><strong>${Number(user.guard_count || 0)}</strong></div>
      <div><small>CERTIFICADO</small><strong>${user.certificate_name ? 'SÍ' : 'NO'}</strong></div>`;

    lessonsWrap.innerHTML = Object.keys(courseData.lessons || {}).sort().map(id => {
      const lesson = courseData.lessons[id] || {};
      const state = user.course?.[id] || {};
      const done = Boolean(state.completed);
      return `<article class="detail-lesson">
        <span class="detail-number">${escapeHtml(id)}</span>
        <div class="detail-copy"><strong>${escapeHtml(lesson.title || `Lección ${id}`)}</strong><span>Nivel ${Number(lesson.level || 0)}${state.completedAt ? ` · ${fmtDate(state.completedAt)}` : ''}</span></div>
        <span class="detail-state ${done ? 'done' : ''}">${done ? 'Completada' : 'Pendiente'}</span>
      </article>`;
    }).join('');

    examsWrap.innerHTML = [1,2,3].map(level => {
      const exam = user.exams?.[level] || user.exams?.[String(level)] || {};
      const passed = Boolean(exam.passed);
      const pct = Number(exam.bestPct ?? exam.lastPct ?? 0);
      const levelName = courseData.levels?.[level]?.name || `Nivel ${level}`;
      return `<article class="detail-exam">
        <div><strong>Nivel ${level} · ${escapeHtml(levelName)}</strong><span>Mejor resultado: ${pct}%${exam.updatedAt ? ` · ${fmtDate(exam.updatedAt)}` : ''}</span></div>
        <span class="detail-state ${passed ? 'passed' : ''}">${passed ? 'Aprobado' : 'Pendiente'}</span>
      </article>`;
    }).join('');
  }

  async function boot() {
    if (!targetUserId || !cloud?.configured()) {
      loading.hidden = true;
      denied.hidden = false;
      return;
    }
    try {
      const client = await cloud.getClient();
      const { data } = await client.auth.getSession();
      session = data?.session || null;
      if (!session?.user) throw new Error('missing_session');

      const { data: roleData, error } = await client.from('user_roles').select('role,active').eq('user_id', session.user.id).maybeSingle();
      if (error || !roleData?.active || !['admin','super_admin'].includes(roleData.role)) throw new Error('forbidden');
      roleBox.className = 'admin-role staff';
      roleBox.innerHTML = `<span>ROL AUTORIZADO</span><strong>${roleData.role === 'super_admin' ? 'Super Admin' : 'Admin'}</strong>`;

      const result = await callAdmin('get_user_detail', { user_id: targetUserId });
      renderDetail(result.user || {});
      loading.hidden = true;
      app.hidden = false;
      messageBox.textContent = 'Las notas privadas del Cuaderno no forman parte de este expediente administrativo.';
    } catch (error) {
      loading.hidden = true;
      denied.hidden = false;
      roleBox.innerHTML = '<span>ESTADO</span><strong>Acceso restringido</strong>';
    }
  }

  boot();
})();
