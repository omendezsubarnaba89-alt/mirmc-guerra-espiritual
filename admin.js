(() => {
  const $ = s => document.querySelector(s);
  const cloud = window.MIRMCCloud;
  const roleBox = $('#adminRole');
  const loading = $('#adminLoading');
  const denied = $('#adminDenied');
  const app = $('#adminApp');
  const usersWrap = $('#adminUsers');
  const summary = $('#adminSummary');
  const messageBox = $('#adminMessage');
  const search = $('#adminSearch');
  const refresh = $('#refreshUsers');
  let client = null;
  let session = null;
  let currentUser = null;
  let currentRole = null;
  let users = [];

  function message(text, type = '') {
    messageBox.className = `admin-message ${type}`.trim();
    messageBox.textContent = text || '';
  }

  function fmtDate(value) {
    if (!value) return '—';
    try { return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
    catch { return '—'; }
  }

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
        super_admin_required: 'Solo un superadministrador puede cambiar roles.',
        cannot_demote_self: 'No puedes quitarte a ti mismo el rol de superadministrador.',
        invalid_role_change: 'El cambio de rol solicitado no es válido.',
      };
      throw new Error(map[body?.error] || 'No se pudo completar la operación administrativa.');
    }
    return body;
  }

  function renderSummary() {
    const confirmed = users.filter(u => u.email_confirmed_at).length;
    const active = users.filter(u => u.active !== false).length;
    const staff = users.filter(u => ['admin','super_admin'].includes(u.role) && u.active !== false).length;
    const certificates = users.filter(u => u.certificate_status === 'active').length;
    summary.innerHTML = `
      <div><small>USUARIOS</small><strong>${users.length}</strong></div>
      <div><small>CONFIRMADOS</small><strong>${confirmed}</strong></div>
      <div><small>PERSONAL</small><strong>${staff}</strong></div>
      <div><small>CERT. ACTIVOS</small><strong>${certificates}</strong></div>`;
  }

  function card(user) {
    const isSelf = user.user_id === currentUser?.id;
    const canEdit = currentRole === 'super_admin' && !(isSelf && user.role === 'super_admin');
    const display = user.display_name || 'Sin nombre visible';
    const stateLabel = user.active === false ? 'INACTIVO' : String(user.role || 'student').replace('_',' ');
    const roleOptions = ['student','admin','super_admin'].map(role => `<option value="${role}" ${user.role === role ? 'selected' : ''}>${role.replace('_',' ')}</option>`).join('');
    const certLabel = user.certificate_status ? String(user.certificate_status).toUpperCase() : 'NO';
    return `<article class="admin-user" data-user-id="${user.user_id}">
      <div class="admin-user-head">
        <div class="admin-user-title"><small>${user.email_confirmed_at ? 'CORREO CONFIRMADO' : 'CORREO PENDIENTE'}</small><strong>${escapeHtml(user.email || '')}</strong><span>${escapeHtml(display)}</span></div>
        <span class="admin-badge">${escapeHtml(stateLabel)}</span>
      </div>
      <div class="admin-user-metrics">
        <div><small>LECCIONES LOCAL</small><strong>${Number(user.lesson_count || 0)}/15</strong></div>
        <div><small>LECCIONES OFICIAL</small><strong>${Number(user.official_lesson_count || 0)}/15</strong></div>
        <div><small>EXÁMENES OFICIAL</small><strong>${Number(user.official_exam_count || 0)}/3</strong></div>
        <div><small>CERTIFICADO</small><strong>${escapeHtml(certLabel)}</strong></div>
        <div><small>ALTA</small><strong>${fmtDate(user.created_at)}</strong></div>
        <div><small>ÚLTIMO ACCESO</small><strong>${fmtDate(user.last_sign_in_at)}</strong></div>
      </div>
      ${currentRole === 'super_admin' ? `<div class="admin-role-editor">
        <select data-role ${canEdit ? '' : 'disabled'}>${roleOptions}</select>
        <label><input type="checkbox" data-active ${user.active !== false ? 'checked' : ''} ${canEdit ? '' : 'disabled'} /> Activo</label>
        <button type="button" data-save-role ${canEdit ? '' : 'disabled'}>${canEdit ? 'Guardar rol' : 'Protegido'}</button>
      </div>` : ''}
    </article>`;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[ch]));
  }

  function renderUsers() {
    const q = (search?.value || '').trim().toLowerCase();
    const filtered = !q ? users : users.filter(u => `${u.email || ''} ${u.display_name || ''} ${u.certificate_code || ''}`.toLowerCase().includes(q));
    usersWrap.innerHTML = filtered.length ? filtered.map(card).join('') : '<div class="admin-loading">No hay usuarios que coincidan con la búsqueda.</div>';
  }

  async function loadUsers() {
    message('Actualizando usuarios…');
    refresh.disabled = true;
    try {
      const result = await callAdmin('list_users', { page: 1, per_page: 100 });
      users = Array.isArray(result?.users) ? result.users : [];
      renderSummary();
      renderUsers();
      message(`Panel actualizado · ${users.length} usuario${users.length === 1 ? '' : 's'}.`, 'success');
    } catch (error) {
      message(error.message, 'error');
    } finally {
      refresh.disabled = false;
    }
  }

  usersWrap.addEventListener('click', async event => {
    const button = event.target.closest('[data-save-role]');
    if (!button) return;
    const cardEl = button.closest('[data-user-id]');
    const userId = cardEl?.dataset?.userId;
    const role = cardEl.querySelector('[data-role]')?.value;
    const active = Boolean(cardEl.querySelector('[data-active]')?.checked);
    if (!userId || !role) return;
    if (!confirm(`¿Guardar rol “${role}” y estado ${active ? 'activo' : 'inactivo'} para este usuario?`)) return;
    button.disabled = true;
    message('Guardando cambio de rol…');
    try {
      await callAdmin('set_role', { user_id: userId, role, active });
      await loadUsers();
      message('Rol actualizado correctamente.', 'success');
    } catch (error) {
      message(error.message, 'error');
      button.disabled = false;
    }
  });

  search?.addEventListener('input', renderUsers);
  refresh?.addEventListener('click', loadUsers);

  async function boot() {
    if (!cloud?.configured()) {
      loading.hidden = true;
      denied.hidden = false;
      roleBox.innerHTML = '<span>ESTADO</span><strong>Nube no disponible</strong>';
      return;
    }

    try { client = await cloud.getClient(); }
    catch {
      loading.hidden = true;
      denied.hidden = false;
      roleBox.innerHTML = '<span>ESTADO</span><strong>Error de conexión</strong>';
      return;
    }

    const { data } = await client.auth.getSession();
    session = data?.session || null;
    currentUser = session?.user || null;
    if (!currentUser) {
      loading.hidden = true;
      denied.hidden = false;
      roleBox.innerHTML = '<span>ESTADO</span><strong>Inicia sesión primero</strong>';
      return;
    }

    const { data: roleData, error } = await client.from('user_roles').select('role,active').eq('user_id', currentUser.id).maybeSingle();
    if (error || !roleData?.active || !['admin','super_admin'].includes(roleData.role)) {
      loading.hidden = true;
      denied.hidden = false;
      roleBox.innerHTML = '<span>ROL</span><strong>Alumno</strong>';
      return;
    }

    currentRole = roleData.role;
    roleBox.className = 'admin-role staff';
    roleBox.innerHTML = `<span>ROL AUTORIZADO</span><strong>${currentRole === 'super_admin' ? 'Super Admin' : 'Admin'}</strong>`;
    loading.hidden = true;
    app.hidden = false;
    await loadUsers();
  }

  boot();
})();
