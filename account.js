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
  const signInButton = $('#signIn');
  const signUpButton = $('#signUp');
  const resendButton = $('#resendConfirmation');
  const COOLDOWN_KEY = 'mirmc-auth-email-cooldown-v1';
  let authBusy = false;
  let cooldownTimer = null;
  let pendingConfirmation = false;

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

  function authErrorMessage(error) {
    const code = String(error?.code || '').toLowerCase();
    const raw = String(error?.message || '');
    const lower = raw.toLowerCase();
    const wait = raw.match(/after\s+(\d+)\s+seconds?/i)?.[1];

    if (code === 'email_not_confirmed' || lower.includes('email not confirmed')) {
      pendingConfirmation = true;
      if (resendButton) resendButton.hidden = false;
      return 'Tu cuenta ya existe, pero todavía falta confirmar el correo. Revisa tu bandeja de entrada y la carpeta de spam.';
    }
    if (code === 'over_email_send_rate_limit' || error?.status === 429 || lower.includes('only request this after')) {
      const seconds = Number(wait || 60);
      startCooldown(Number.isFinite(seconds) ? seconds : 60);
      return `Por seguridad, espera ${seconds} segundos antes de pedir otro correo de confirmación.`;
    }
    if (code === 'invalid_credentials' || lower.includes('invalid login credentials')) {
      return 'El correo o la contraseña no coinciden. Si acabas de crear la cuenta, confirma primero el correo.';
    }
    if (code === 'user_already_exists' || lower.includes('already registered')) {
      return 'Ese correo ya tiene una cuenta. Prueba con “Entrar” o reenvía el correo de confirmación.';
    }
    if (code === 'weak_password' || lower.includes('password')) {
      return 'La contraseña no cumple los requisitos de seguridad. Usa al menos 8 caracteres y evita contraseñas fáciles de adivinar.';
    }
    if (code === 'email_address_invalid' || lower.includes('invalid email')) {
      return 'El correo escrito no parece válido. Revísalo e inténtalo otra vez.';
    }
    if (!navigator.onLine) return 'No hay conexión a Internet. Tu progreso local sigue guardado; vuelve a intentarlo cuando recuperes conexión.';
    return raw || 'No se pudo completar la operación. Inténtalo nuevamente.';
  }

  function cooldownRemaining() {
    const until = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
  }

  function setButtonsBusy(value) {
    authBusy = Boolean(value);
    signInButton && (signInButton.disabled = authBusy);
    refreshCooldownUI();
  }

  function refreshCooldownUI() {
    const remaining = cooldownRemaining();
    if (signUpButton) {
      signUpButton.disabled = authBusy || remaining > 0;
      signUpButton.textContent = remaining > 0 ? `Crear cuenta (${remaining}s)` : 'Crear cuenta';
    }
    if (resendButton) {
      resendButton.disabled = authBusy || remaining > 0;
      resendButton.textContent = remaining > 0 ? `Reenviar correo (${remaining}s)` : 'Reenviar correo de confirmación';
      resendButton.hidden = !pendingConfirmation;
    }
    if (remaining <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
      localStorage.removeItem(COOLDOWN_KEY);
    }
  }

  function startCooldown(seconds = 60) {
    const safe = Math.max(1, Number(seconds) || 60);
    const currentUntil = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    const nextUntil = Math.max(currentUntil, Date.now() + safe * 1000);
    localStorage.setItem(COOLDOWN_KEY, String(nextUntil));
    if (!cooldownTimer) cooldownTimer = setInterval(refreshCooldownUI, 1000);
    refreshCooldownUI();
  }

  function resumeCooldown() {
    if (cooldownRemaining() > 0 && !cooldownTimer) cooldownTimer = setInterval(refreshCooldownUI, 1000);
    refreshCooldownUI();
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

    pendingConfirmation = false;
    if (resendButton) resendButton.hidden = true;
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
    resumeCooldown();

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
      if (authBusy) return;
      const email = $('#authEmail').value.trim();
      const password = $('#authPassword').value;
      setButtonsBusy(true);
      message($('#authMessage'), 'Comprobando tu cuenta…');
      try {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) message($('#authMessage'), authErrorMessage(error), 'error');
        else message($('#authMessage'), 'Sesión iniciada correctamente.', 'success');
      } finally {
        setButtonsBusy(false);
      }
    });

    signUpButton?.addEventListener('click', async () => {
      if (authBusy || cooldownRemaining() > 0) return;
      const email = $('#authEmail').value.trim();
      const password = $('#authPassword').value;
      if (!email || password.length < 8) {
        message($('#authMessage'), 'Escribe un correo válido y una contraseña de al menos 8 caracteres.', 'error');
        return;
      }

      setButtonsBusy(true);
      message($('#authMessage'), 'Creando tu cuenta…');
      try {
        const { data: result, error } = await client.auth.signUp({ email, password });
        if (error) {
          message($('#authMessage'), authErrorMessage(error), 'error');
          return;
        }

        if (!result?.session) {
          pendingConfirmation = true;
          startCooldown(60);
          message($('#authMessage'), 'Cuenta creada. Te enviamos un correo de confirmación. Ábrelo antes de intentar entrar.', 'success');
        } else {
          message($('#authMessage'), 'Cuenta creada y sesión iniciada correctamente.', 'success');
        }
      } finally {
        setButtonsBusy(false);
      }
    });

    resendButton?.addEventListener('click', async () => {
      if (authBusy || cooldownRemaining() > 0) return;
      const email = $('#authEmail').value.trim();
      if (!email) {
        message($('#authMessage'), 'Escribe primero el correo de la cuenta que quieres confirmar.', 'error');
        return;
      }

      setButtonsBusy(true);
      message($('#authMessage'), 'Enviando un nuevo correo de confirmación…');
      try {
        const { error } = await client.auth.resend({ type: 'signup', email });
        if (error) {
          message($('#authMessage'), authErrorMessage(error), 'error');
          return;
        }
        pendingConfirmation = true;
        startCooldown(60);
        message($('#authMessage'), 'Correo reenviado. Revisa tu bandeja de entrada y spam antes de volver a solicitar otro.', 'success');
      } finally {
        setButtonsBusy(false);
      }
    });

    if (googleEnabled && googleButton) {
      googleButton.addEventListener('click', async () => {
        message($('#authMessage'), 'Abriendo Google…');
        const { error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: cloud.config().redirectUrl }
        });
        if (error) message($('#authMessage'), authErrorMessage(error), 'error');
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
