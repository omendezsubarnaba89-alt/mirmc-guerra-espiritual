(() => {
  const $ = s => document.querySelector(s);
  const cloud = window.MIRMCCloud;
  const sync = window.MIRMCSync;
  const mode = $('#accountMode');
  const disabled = $('#cloudDisabled');
  const authArea = $('#authArea');
  const signedOut = $('#signedOutPanel');
  const signedIn = $('#signedInPanel');
  const googleButton = $('#googleSignIn');
  const authSeparator = document.querySelector('.auth-separator');

  function countLocal() {
    const snap = sync.snapshot();
    const lessons = Object.values(snap.course || {}).filter(x => x?.completed).length;
    const exams = Object.values(snap.exams || {}).filter(x => x?.passed).length;
    const guards = Object.values(snap.guard || {}).filter(Boolean).length;
    return { lessons, exams, guards, certificate: Boolean(snap.certificateName) };
  }

  function renderLocalSummary() {
    const c = countLocal();
    $('#localSummary').innerHTML = `
      <div><small>LECCIONES LOCALES</small><strong>${c.lessons}/15</strong></div>
      <div><small>EXÁMENES APROB.</small><strong>${c.exams}/3</strong></div>
      <div><small>GUARDIAS</small><strong>${c.guards}</strong></div>
      <div><small>NOMBRE CERT.</small><strong>${c.certificate ? 'SÍ' : 'NO'}</strong></div>`;
  }

  function message(el, text, type = '') {
    el.className = `account-message ${type}`.trim();
    el.textContent = text || '';
  }

  async function loadProfile(client, user) {
    const { data, error } = await client.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    $('#profileName').value = data?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || '';
  }

  async function renderSession(client, session) {
    const user = session?.user || null;
    signedOut.hidden = Boolean(user);
    signedIn.hidden = !user;
    if (!user) return;

    $('#accountEmail').textContent = user.email || 'Cuenta activa';
    $('#sessionInfo').textContent = `Sesión autenticada · ${user.email || user.id}`;
    try { await loadProfile(client, user); } catch (error) { message($('#profileMessage'), error.message, 'error'); }

    message($('#syncMessage'), 'Comprobando si hay progreso para combinar…');
    try {
      const result = await sync.sync();
      message($('#syncMessage'), result.message, 'success');
      renderLocalSummary();
    } catch (error) {
      message($('#syncMessage'), `La sesión está activa, pero la sincronización no pudo completarse: ${error.message}`, 'error');
    }
  }

  async function bootCloud() {
    renderLocalSummary();
    if (!cloud?.configured()) {
      mode.className = 'account-mode local';
      mode.innerHTML = '<span>MODO ACTUAL</span><strong>Local · sin nube</strong>';
      disabled.hidden = false;
      authArea.hidden = true;
      return;
    }

    mode.className = 'account-mode cloud';
    mode.innerHTML = '<span>MODO ACTUAL</span><strong>Nube activa</strong>';
    disabled.hidden = true;
    authArea.hidden = false;

    const googleEnabled = Boolean(cloud.config().googleEnabled);
    if (googleButton) googleButton.hidden = !googleEnabled;
    if (authSeparator) authSeparator.hidden = !googleEnabled;

    let client;
    try {
      client = await cloud.getClient();
    } catch (error) {
      mode.className = 'account-mode local';
      mode.innerHTML = '<span>ERROR DE CONFIGURACIÓN</span><strong>No se pudo cargar la nube</strong>';
      disabled.hidden = false;
      authArea.hidden = true;
      return;
    }

    const { data } = await client.auth.getSession();
    await renderSession(client, data?.session || null);

    client.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => renderSession(client, session), 0);
    });

    $('#authForm').addEventListener('submit', async event => {
      event.preventDefault();
      const email = $('#authEmail').value.trim();
      const password = $('#authPassword').value;
      message($('#authMessage'), 'Entrando…');
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) message($('#authMessage'), error.message, 'error');
      else message($('#authMessage'), 'Sesión iniciada.', 'success');
    });

    $('#signUp').addEventListener('click', async () => {
      const email = $('#authEmail').value.trim();
      const password = $('#authPassword').value;
      if (!email || password.length < 8) {
        message($('#authMessage'), 'Escribe un correo válido y una contraseña de al menos 8 caracteres.', 'error');
        return;
      }
      message($('#authMessage'), 'Creando cuenta…');
      const { data: result, error } = await client.auth.signUp({ email, password });
      if (error) message($('#authMessage'), error.message, 'error');
      else if (!result?.session) message($('#authMessage'), 'Cuenta creada. Revisa tu correo para confirmar el acceso si Supabase lo solicita.', 'success');
      else message($('#authMessage'), 'Cuenta creada y sesión iniciada.', 'success');
    });

    if (googleEnabled && googleButton) {
      googleButton.addEventListener('click', async () => {
        message($('#authMessage'), 'Abriendo Google…');
        const { error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: cloud.config().redirectUrl }
        });
        if (error) message($('#authMessage'), error.message, 'error');
      });
    }

    $('#saveProfile').addEventListener('click', async () => {
      const { data: authData } = await client.auth.getUser();
      if (!authData?.user) return;
      const displayName = $('#profileName').value.trim().slice(0, 80);
      message($('#profileMessage'), 'Guardando…');
      const { error } = await client.from('profiles').upsert({ user_id: authData.user.id, display_name: displayName }, { onConflict: 'user_id' });
      if (error) message($('#profileMessage'), error.message, 'error');
      else message($('#profileMessage'), 'Perfil guardado.', 'success');
    });

    $('#syncNow').addEventListener('click', async () => {
      message($('#syncMessage'), 'Sincronizando…');
      try {
        const result = await sync.sync();
        message($('#syncMessage'), result.message, 'success');
        renderLocalSummary();
      } catch (error) { message($('#syncMessage'), error.message, 'error'); }
    });

    $('#pushNow').addEventListener('click', async () => {
      if (!confirm('Esto guardará en la nube el progreso actual de este dispositivo. ¿Continuar?')) return;
      message($('#syncMessage'), 'Subiendo progreso local…');
      try {
        await sync.push();
        message($('#syncMessage'), 'Este dispositivo quedó guardado como estado remoto.', 'success');
      } catch (error) { message($('#syncMessage'), error.message, 'error'); }
    });

    $('#pullNow').addEventListener('click', async () => {
      if (!confirm('Esto reemplazará los datos locales por la copia guardada en la nube. ¿Continuar?')) return;
      message($('#syncMessage'), 'Restaurando desde la nube…');
      try {
        const result = await sync.pull();
        message($('#syncMessage'), result.direction === 'pull' ? 'Progreso restaurado desde la nube.' : 'Todavía no existe una copia remota.', 'success');
        renderLocalSummary();
      } catch (error) { message($('#syncMessage'), error.message, 'error'); }
    });

    $('#signOut').addEventListener('click', async () => {
      await client.auth.signOut();
    });
  }

  bootCloud();
})();
