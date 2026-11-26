(() => {
  const analyticsId = 'G-FJWTZ4NWHB';
  const preferenceName = '__Host-cc-analytics';
  const panel = document.getElementById('cookiesPanel');
  const settings = document.getElementById('cookiesOpen');
  const allow = document.getElementById('cookiesYes');
  const deny = document.getElementById('cookiesNo');
  const status = document.getElementById('cookiePrivacyStatus');
  let loaded = false;
  try {
    sessionStorage.removeItem('camping-classics-online-eligibility');
  } catch { /* Storage may be unavailable. */ }

  const readPreference = () => document.cookie.split('; ').find(cookie => cookie.startsWith(preferenceName + '='))?.split('=')[1];
  const privacySignal = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';

  function clearAnalyticsCookies() {
    for (const part of document.cookie.split('; ')) {
      const key = part.split('=')[0];
      if (!/^_ga(?:_|$)/.test(key)) continue;
      for (const domain of ['', '; Domain=' + location.hostname]) {
        document.cookie = key + '=; Max-Age=0; Path=/; Secure; SameSite=Lax' + domain;
      }
    }
  }
  function disableAnalytics() {
    window['ga-disable-' + analyticsId] = true;
    if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied' });
    window.gtag = undefined;
    clearAnalyticsCookies();
  }
  function enableAnalytics() {
    if (loaded || privacySignal() || readPreference() !== 'yes') return;
    loaded = true;
    window['ga-disable-' + analyticsId] = false;
    window.dataLayer = [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', analyticsId, {
      cookie_domain: 'none', cookie_flags: 'SameSite=Lax;Secure', cookie_expires: 15552000,
      allow_google_signals: false, allow_ad_personalization_signals: false,
      // Never include a shared trip, search query or referrer in a page view.
      page_location: location.origin + location.pathname, page_referrer: ''
    });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + analyticsId;
    document.head.append(tag);
  }
  function updateConsentControls() {
    if (!allow || !status) return;
    allow.disabled = privacySignal();
    status.textContent = privacySignal()
      ? 'Your browser privacy signal is on. Optional analytics stays off.'
       : '';
  }
  function rememberPreference(yes) {
    document.cookie = preferenceName + '=' + (yes ? 'yes' : 'no') + '; Path=/; Max-Age=15552000; SameSite=Lax; Secure';
  }
  updateConsentControls();
  const previous = readPreference();
  if (previous === 'yes' && !privacySignal()) enableAnalytics();
  else disableAnalytics();
  if (panel) panel.hidden = previous === 'no' || previous === 'yes' || privacySignal();
  settings?.addEventListener('click', () => {
    updateConsentControls();
    panel.hidden = false;
    deny.focus();
  });
  deny?.addEventListener('click', () => {
    rememberPreference(false);
    panel.hidden = true;
    disableAnalytics();
    if (loaded) location.reload();
  });
  allow?.addEventListener('click', () => {
    if (privacySignal()) return;
    rememberPreference(true);
    panel.hidden = true;
    enableAnalytics();
  });
})();
