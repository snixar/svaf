<script lang="ts">
  import { siteConfig } from '../lib/config/site';

  interface ConsentPreferences {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
  }

  let scriptsLoaded = $state({
    umami: false,
    cloudflare: false,
    cfUmami: false,
    baidu: false,
    google: false,
    clarity: false,
  });

  $effect(() => {
    function handleConsentUpdate(e: CustomEvent<ConsentPreferences>) {
      loadTrackers(e.detail);
    }
    window.addEventListener('cookie-consent-updated', handleConsentUpdate as EventListener);
    return () => window.removeEventListener('cookie-consent-updated', handleConsentUpdate as EventListener);
  });

  function loadTrackers(preferences: ConsentPreferences) {
    if (!scriptsLoaded.umami) { loadUmami(); scriptsLoaded.umami = true; }
    if (!scriptsLoaded.cloudflare) { loadCloudflare(); scriptsLoaded.cloudflare = true; }
    if (!scriptsLoaded.cfUmami) { loadCfUmami(); scriptsLoaded.cfUmami = true; }

    if (preferences.analytics) {
      if (!scriptsLoaded.baidu) { loadBaidu(); scriptsLoaded.baidu = true; }
      if (!scriptsLoaded.google) { loadGoogle(); scriptsLoaded.google = true; }
      if (!scriptsLoaded.clarity) { loadClarity(); scriptsLoaded.clarity = true; }
    }
  }

  function loadUmami() {
    if (!siteConfig.analytics.umami?.src) return;
    const script = document.createElement('script');
    script.defer = true;
    script.src = siteConfig.analytics.umami.src;
    script.setAttribute('data-website-id', siteConfig.analytics.umami.websiteId);
    document.head.appendChild(script);
  }

  function loadCloudflare() {
    if (!siteConfig.analytics.cfWebAnalytics?.token) return;
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', JSON.stringify({ token: siteConfig.analytics.cfWebAnalytics.token }));
    document.head.appendChild(script);
  }

  function loadCfUmami() {
    if (!siteConfig.analytics.cfUmami?.src) return;
    const script = document.createElement('script');
    script.defer = true;
    script.src = siteConfig.analytics.cfUmami.src;
    document.head.appendChild(script);
  }

  function loadBaidu() {
    if (!siteConfig.analytics.baidu?.id) return;
    const script = document.createElement('script');
    script.innerHTML = `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?${siteConfig.analytics.baidu.id}";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();
    `;
    document.head.appendChild(script);
  }

  function loadGoogle() {
    if (!siteConfig.analytics.google?.measurementId) return;
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + siteConfig.analytics.google.measurementId;
    document.head.appendChild(gtagScript);

    const initScript = document.createElement('script');
    initScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${siteConfig.analytics.google.measurementId}');
    `;
    document.head.appendChild(initScript);
  }

  function loadClarity() {
    if (!siteConfig.analytics.clarity?.projectId) return;
    const script = document.createElement('script');
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${siteConfig.analytics.clarity.projectId}");
    `;
    document.head.appendChild(script);
  }
</script>
