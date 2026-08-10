(() => {
  const accountUrl = new URL('account.html', window.location.href).href;
  window.MIRMC_CLOUD_CONFIG = {
    enabled: true,
    provider: 'supabase',
    supabaseUrl: 'https://eqffbegdezlzzffvmsqk.supabase.co',
    supabasePublishableKey: 'sb_publishable_b51TvDZ3sxwLTygqS_UUHw_mnLvj0dO',
    redirectUrl: accountUrl,
    googleEnabled: false,
    schemaVersion: 1
  };
})();
