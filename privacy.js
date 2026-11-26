(() => {
  const analyticsId = 'G-FJWTZ4NWHB';
  const preferenceName = '__Host-cc-analytics';
  const ageKey = 'camping-classics-online-eligibility';
  const panel = document.getElementById('cookiesPanel');
  const settings = document.getElementById('cookiesOpen');
  const allow = document.getElementById('cookiesYes');
  const deny = document.getElementById('cookiesNo');
  const status = document.getElementById('cookiePrivacyStatus');
  const dialog = document.getElementById('privacyAgeDialog');
  const ageForm = document.getElementById('privacyAgeForm');
  const ageOptions = document.getElementById('privacyAgeOptions');
  const ageMessage = document.getElementById('privacyAgeMessage');
  const ageClose = document.getElementById('privacyAgeClose');
  let eligibility = '';
  let loaded = false;
  let pendingAge;
  let resolveAge;
  let opener;

  try {
    const saved = sessionStorage.getItem(ageKey);
    if (['eligible', 'restricted'].includes(saved)) eligibility = saved;
  } catch { /* The current tab still works without session storage. */ }

  const readPreference = () => document.cookie.split('; ').find(cookie => cookie.startsWith(preferenceName + '='))?.split('=')[1];
  const privacySignal = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  const canUseOnline = () => eligibility === 'eligible';

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
    if (loaded || !canUseOnline() || privacySignal() || readPreference() !== 'yes') return;
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
    allow.disabled = eligibility === 'restricted' || privacySignal();
    status.textContent = privacySignal()
      ? 'Your browser privacy signal is on. Optional analytics stays off.'
      : eligibility === 'restricted'
        ? 'Optional analytics is off for this visit. You can keep using the planner, checklist, guides and games.'
        : '';
  }
  function rememberPreference(yes) {
    document.cookie = preferenceName + '=' + (yes ? 'yes' : 'no') + '; Path=/; Max-Age=15552000; SameSite=Lax; Secure';
  }
  function showAgeDialog(restricted = false) {
    opener = document.activeElement;
    ageForm.hidden = restricted;
    ageMessage.hidden = !restricted;
    ageClose.textContent = restricted ? 'Keep planning' : 'Not now';
    if (typeof dialog.showModal !== 'function') return false;
    dialog.showModal();
    return true;
  }
  function settleAge(value) {
    const resolve = resolveAge;
    resolveAge = undefined;
    pendingAge = undefined;
    resolve?.(value);
  }
  function requireOnlineAccess() {
    if (canUseOnline()) return Promise.resolve(true);
    if (eligibility === 'restricted') {
      if (!dialog.open) showAgeDialog(true);
      return Promise.resolve(false);
    }
    if (pendingAge) return pendingAge;
    pendingAge = new Promise(resolve => { resolveAge = resolve; });
    const result = pendingAge;
    if (!showAgeDialog()) settleAge(false);
    return result;
  }

  ageForm?.addEventListener('submit', event => {
    event.preventDefault();
    const value = ageOptions.value;
    if (!['under13', '13to15', '16plus'].includes(value)) return;
    eligibility = value === '16plus' ? 'eligible' : 'restricted';
    try { sessionStorage.setItem(ageKey, eligibility); } catch { /* Keep the choice in memory. */ }
    if (eligibility === 'restricted') {
      rememberPreference(false);
      disableAnalytics();
      if (panel) panel.hidden = true;
      ageForm.hidden = true;
      ageMessage.hidden = false;
      ageClose.textContent = 'Keep planning';
      ageClose.focus();
    } else {
      dialog.close();
      enableAnalytics();
    }
    updateConsentControls();
    if (!canUseOnline()) settleAge(false);
  });
  ageClose?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => {
    opener?.focus({ preventScroll: true });
    settleAge(canUseOnline());
  });

  window.campingPrivacy = Object.freeze({ canUseOnline, requireOnlineAccess });
  updateConsentControls();
  const previous = readPreference();
  if (canUseOnline() && previous === 'yes' && !privacySignal()) enableAnalytics();
  else disableAnalytics();
  if (panel) panel.hidden = previous === 'no' || (previous === 'yes' && canUseOnline()) || eligibility === 'restricted' || privacySignal();
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
  allow?.addEventListener('click', async () => {
    if (privacySignal() || !(await requireOnlineAccess())) return;
    rememberPreference(true);
    panel.hidden = true;
    enableAnalytics();
  });
})();
