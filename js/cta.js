/* Sticky mobile "free analysis" button + click tracking for CTAs.
 * Loaded on content pages (not the homepages, which have their own contact orb).
 * Clicks are sent to GA4 only if the visitor has accepted analytics (gtag from consent.js). */
(function () {
    'use strict';
    var de = (document.documentElement.lang || '').slice(0, 2) === 'de';
    var href = de ? '/#kontakt' : '/en/#contact';

    function track(location) {
        if (window.gtag) gtag('event', 'cta_click', { cta_location: location, page_path: window.location.pathname });
    }

    var btn = document.createElement('a');
    btn.id = 'sticky-cta';
    btn.href = href;
    btn.textContent = de ? 'Kostenlose Analyse →' : 'Free website analysis →';
    btn.addEventListener('click', function () { track('sticky_mobile'); });

    var css = document.createElement('style');
    css.textContent =
        '#sticky-cta{display:none}' +
        '@media (max-width:768px){' +
        '#sticky-cta{display:block;position:fixed;left:16px;right:16px;bottom:max(16px,env(safe-area-inset-bottom,0px) + 12px);z-index:10040;' +
        'background:#111;color:#fff;border:1px solid rgba(255,255,255,0.35);border-radius:100px;padding:15px 20px;text-align:center;' +
        'font:900 13px/1 Arial,Helvetica,sans-serif;letter-spacing:1.2px;text-transform:uppercase;text-decoration:none;' +
        'box-shadow:0 8px 24px rgba(0,0,0,0.35);transform:translateY(140%);transition:transform .35s ease}' +
        '#sticky-cta.show{transform:translateY(0)}' +
        'body{padding-bottom:84px}}';
    document.head.appendChild(css);

    function init() {
        document.body.appendChild(btn);
        // Appear after a little scrolling, so it doesn't cover the page title.
        function onScroll() { btn.classList.toggle('show', window.pageYOffset > 300); }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        var box = document.querySelectorAll('[data-cta]');
        for (var i = 0; i < box.length; i++) {
            box[i].addEventListener('click', function (e) { track(e.currentTarget.getAttribute('data-cta')); });
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
