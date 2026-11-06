/* GA4 with basic consent mode. No Google requests occur before opt-in. */
(() => {
  'use strict';

  const script = document.currentScript;
  const measurementId = script && script.dataset.measurementId;
  if (!/^G-[A-Z0-9]{6,}$/.test(measurementId || '') || window.blogAnalyticsInitialized) return;
  const domains = (script.dataset.domains || location.hostname).split(',').map(value => value.trim());
  if (location.protocol !== 'https:' || !domains.includes(location.hostname)) return;
  if (navigator.globalPrivacyControl || navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  const preferenceKey = 'hibernate.analytics-consent.v1';
  const preferenceLifetime = 180 * 24 * 60 * 60 * 1000;
  const disabledKey = 'hibernate.analytics-disabled';
  const storageGet = key => { try { return localStorage.getItem(key); } catch { return null; } };
  if (storageGet(disabledKey) === '1') return;
  window.blogAnalyticsInitialized = true;

  const readPreference = () => {
    try {
      const value = JSON.parse(storageGet(preferenceKey));
      if (value && ['granted', 'denied'].includes(value.choice) &&
          Number.isFinite(value.savedAt) && value.savedAt <= Date.now() &&
          Date.now() - value.savedAt < preferenceLifetime) return value.choice;
    } catch { /* An invalid or unavailable preference means no consent. */ }
    return null;
  };
  const savePreference = choice => {
    try { localStorage.setItem(preferenceKey, JSON.stringify({ choice, savedAt: Date.now() })); }
    catch { /* Consent lasts only for this page when storage is unavailable. */ }
  };
  const cleanUrl = value => {
    try {
      const url = new URL(value, location.href);
      return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : '';
    } catch { return ''; }
  };

  let consent = readPreference();
  let tracking = false;
  let listenersInstalled = false;
  const milestones = new Set();
  const article = document.querySelector('.post-content');
  const articleDepth = () => {
    if (!article) return 0;
    const box = article.getBoundingClientRect();
    if (box.height <= 0) return 0;
    return Math.max(0, Math.min(100, 100 * (window.innerHeight - box.top) / box.height));
  };
  const track = (eventName, parameters) => {
    if (!tracking || consent !== 'granted') return;
    window.gtag('event', eventName, {
      send_to: measurementId,
      page_location: cleanUrl(location.href),
      page_referrer: document.referrer ? cleanUrl(document.referrer) : '',
      ...parameters,
    });
  };
  const observeScroll = () => {
    if (!tracking || consent !== 'granted' || !article || document.visibilityState === 'hidden') return;
    const depth = articleDepth();
    for (const threshold of [25, 50, 75, 100]) {
      if (depth >= threshold && !milestones.has(threshold)) {
        milestones.add(threshold);
        track('article_scroll', { percent_scrolled: threshold });
      }
    }
  };
  const observeLink = event => {
    if (!tracking || consent !== 'granted' || event.defaultPrevented || event.button > 1) return;
    const element = event.target instanceof Element ? event.target : event.target.parentElement;
    const link = element && element.closest('a[href]');
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (!/^https?:$/.test(url.protocol)) return;
    const isInternal = domains.includes(url.hostname);
    const extension = (url.pathname.match(/\.([a-z0-9]+)$/i) || [])[1];
    const isAsset = isInternal && (link.hasAttribute('download') ||
      /^(csv|cypher|cql|sql|txt|pdf|zip|gz|7z|tar|json|xml|yaml|yml|py|rb|go|rs|js|sh)$/i.test(extension || ''));
    if (isAsset) {
      track('asset_download', {
        file_name: url.pathname.split('/').pop(),
        file_extension: (extension || '').toLowerCase(),
        link_url: cleanUrl(url.href),
      });
    } else if (!isInternal) {
      track('outbound_click', { link_domain: url.hostname, link_url: cleanUrl(url.href) });
    }
  };

  const startTracking = () => {
    if (tracking || consent !== 'granted') return;
    tracking = true;
    window['ga-disable-' + measurementId] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    // Set clean defaults for GA4's automatic session/engagement events too.
    window.gtag('set', {
      page_location: cleanUrl(location.href),
      page_referrer: document.referrer ? cleanUrl(document.referrer) : '',
    });
    window.gtag('js', new Date());
    const configuration = {
      send_page_view: true,
      page_location: cleanUrl(location.href),
      page_referrer: document.referrer ? cleanUrl(document.referrer) : '',
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 90 * 24 * 60 * 60,
      cookie_update: false,
      cookie_flags: 'SameSite=Lax;Secure',
    };
    if (script.dataset.debug === 'true') configuration.debug_mode = true;
    window.gtag('config', measurementId, configuration);
    const googleTag = document.createElement('script');
    googleTag.async = true;
    googleTag.id = 'blog-google-tag';
    googleTag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(googleTag);

    // Do not report reading milestones reached before analytics was accepted.
    for (const threshold of [25, 50, 75, 100]) {
      if (articleDepth() >= threshold) milestones.add(threshold);
    }
    if (!listenersInstalled) {
      listenersInstalled = true;
      let scheduled = false;
      window.addEventListener('scroll', () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => { scheduled = false; observeScroll(); });
      }, { passive: true });
      document.addEventListener('click', observeLink);
      document.addEventListener('auxclick', observeLink);
    }
  };

  const removeAnalyticsCookies = () => {
    const names = document.cookie.split(';').map(cookie => cookie.trim().split('=')[0])
      .filter(name => /^_ga($|_)/.test(name));
    const parts = location.hostname.split('.');
    const cookieDomains = ['', ...parts.slice(0, -1).map((_, i) => parts.slice(i).join('.'))];
    for (const name of names) for (const domain of cookieDomains) {
      document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax; Secure';
    }
  };

  const panel = document.createElement('section');
  panel.className = 'analytics-consent';
  panel.id = 'analytics-consent';
  panel.hidden = true;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', 'analytics-consent-title');
  panel.innerHTML = '<h2 id="analytics-consent-title">Optional analytics</h2>' +
    '<p>Allow Google Analytics cookies to help me understand which articles are useful, how far readers scroll, and which examples they download? You can decline and use the whole site.</p>' +
    '<p><a class="analytics-privacy">Privacy and analytics details</a></p>' +
    '<div class="analytics-actions"><button type="button" data-choice="granted">Accept analytics</button>' +
    '<button type="button" data-choice="denied">Decline analytics</button>' +
    '<button type="button" data-close hidden>Close</button></div>';
  panel.querySelector('.analytics-privacy').href = script.dataset.privacyUrl;
  document.body.appendChild(panel);

  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'analytics-settings';
  settings.id = 'analytics-settings';
  settings.textContent = 'Analytics settings';
  settings.setAttribute('aria-controls', panel.id);
  settings.setAttribute('aria-expanded', 'false');
  document.body.appendChild(settings);

  const setPanel = visible => {
    panel.hidden = !visible;
    settings.setAttribute('aria-expanded', String(visible));
    panel.querySelector('[data-close]').hidden = consent === null;
  };
  settings.addEventListener('click', () => {
    setPanel(true);
    panel.querySelector('[data-choice]').focus({ preventScroll: true });
  });
  panel.querySelector('[data-close]').addEventListener('click', () => {
    setPanel(false); settings.focus({ preventScroll: true });
  });
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape' && consent !== null) { setPanel(false); settings.focus({ preventScroll: true }); }
  });
  for (const button of panel.querySelectorAll('[data-choice]')) button.addEventListener('click', () => {
    const wasTracking = tracking;
    consent = button.dataset.choice;
    savePreference(consent);
    setPanel(false);
    settings.focus({ preventScroll: true });
    if (consent === 'granted') startTracking();
    else if (wasTracking) {
      tracking = false;
      window['ga-disable-' + measurementId] = true;
      removeAnalyticsCookies();
      // Reload removes the already-loaded Google tag and its event listeners.
      location.reload();
    }
  });
  window.addEventListener('storage', event => {
    if ((event.key === preferenceKey && readPreference() === 'denied' && tracking) ||
        (event.key === disabledKey && event.newValue === '1')) {
      window['ga-disable-' + measurementId] = true;
      removeAnalyticsCookies();
      location.reload();
    }
  });

  if (consent === 'granted') startTracking();
  else if (consent === null) setPanel(true);
})();
