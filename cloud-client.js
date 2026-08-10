(() => {
  let clientPromise = null;

  function config() {
    return window.MIRMC_CLOUD_CONFIG || {};
  }

  function configured() {
    const c = config();
    return Boolean(c.enabled && c.provider === 'supabase' && /^https:\/\/.+/.test(c.supabaseUrl || '') && (c.supabasePublishableKey || '').length > 20);
  }

  async function getClient() {
    if (!configured()) throw new Error('La sincronización en la nube todavía no está configurada.');
    if (!clientPromise) {
      clientPromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm').then(({ createClient }) => {
        const c = config();
        return createClient(c.supabaseUrl, c.supabasePublishableKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      });
    }
    return clientPromise;
  }

  async function getUser() {
    if (!configured()) return null;
    const client = await getClient();
    const { data, error } = await client.auth.getUser();
    if (error) return null;
    return data?.user || null;
  }

  window.MIRMCCloud = { configured, getClient, getUser, config };
})();
