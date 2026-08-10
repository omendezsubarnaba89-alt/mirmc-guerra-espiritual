(() => {
  const accountUrl = new URL('account.html', window.location.href).href;
  window.MIRMC_CLOUD_CONFIG = {
    enabled: false,
    provider: 'supabase',
    supabaseUrl: '',
    supabasePublishableKey: '',
    redirectUrl: accountUrl,
    schemaVersion: 1
  };
})();
