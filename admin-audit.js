(() => {
  const $ = s => document.querySelector(s);
  const cloud = window.MIRMCCloud;
  const loading = $('#auditLoading');
  const denied = $('#auditDenied');
  const app = $('#auditApp');
  const roleBox = $('#auditRole');
  const list = $('#auditList');
  const messageBox = $('#auditMessage');
  const refresh = $('#refreshAudit');
  let session = null;

  const fmtDate = value => {
    if (!value) return '—';
    try { return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
    catch { return '—'; }
  };
  const escapeHtml = value => String(value || '').replace(/[&<>\"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;' }[ch]));
  const prettyState = value => {
    if (!value) return '—';
    const role = value.role ? String(value.role).replace('_',' ') : '—';
    const active = value.active === false ? 'inactivo' : 'activo';
    return `${role} · ${active}`;
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
    if (!response.ok) throw new Error(body?.error === 'super_admin_required' ? 'Solo un superadministrador puede ver esta bitácora.' : 'No se pudo cargar la bitácora.');
    return body;
  }

  function render(logs) {
    list.innerHTML = logs.length ? logs.map(item => `
      <article class="audit-event">
        <div class="audit-event-head"><strong>${item.action === 'set_role' ? 'Cambio de rol / estado' : escapeHtml(item.action)}</strong><time>${fmtDate(item.created_at)}</time></div>
        <p><b>Actor:</b> ${escapeHtml(item.actor_email || item.actor_user_id)}<br/><b>Usuario:</b> ${escapeHtml(item.target_email || item.target_user_id || '—')}</p>
        <div class="audit-change"><div><small>ANTES</small><code>${escapeHtml(prettyState(item.before_state))}</code></div><div><small>DESPUÉS</small><code>${escapeHtml(prettyState(item.after_state))}</code></div></div>
      </article>`).join('') : '<div class="admin-loading">Todavía no hay cambios administrativos registrados.</div>';
  }

  async function loadAudit() {
    refresh.disabled = true;
    messageBox.textContent = 'Actualizando bitácora…';
    try {
      const result = await callAdmin('list_audit', { limit: 50 });
      const logs = Array.isArray(result?.logs) ? result.logs : [];
      render(logs);
      messageBox.className = 'admin-message success';
      messageBox.textContent = `Bitácora actualizada · ${logs.length} evento${logs.length === 1 ? '' : 's'}.`;
    } catch (error) {
      messageBox.className = 'admin-message error';
      messageBox.textContent = error.message;
    } finally {
      refresh.disabled = false;
    }
  }

  refresh?.addEventListener('click', loadAudit);

  async function boot() {
    if (!cloud?.configured()) {
      loading.hidden = true; denied.hidden = false; return;
    }
    try {
      const client = await cloud.getClient();
      const { data } = await client.auth.getSession();
      session = data?.session || null;
      if (!session?.user) throw new Error('missing_session');
      const { data: roleData, error } = await client.from('user_roles').select('role,active').eq('user_id', session.user.id).maybeSingle();
      if (error || !roleData?.active || roleData.role !== 'super_admin') throw new Error('forbidden');
      roleBox.className = 'admin-role staff';
      roleBox.innerHTML = '<span>ROL AUTORIZADO</span><strong>Super Admin</strong>';
      loading.hidden = true;
      app.hidden = false;
      await loadAudit();
    } catch {
      loading.hidden = true;
      denied.hidden = false;
      roleBox.innerHTML = '<span>ESTADO</span><strong>Acceso restringido</strong>';
    }
  }
  boot();
})();
