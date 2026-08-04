/* Cookie consent gate for Google Analytics.
 *
 * GA is not loaded at all until the visitor accepts. Consent Mode v2 defaults
 * are set to denied first, so even the gtag bootstrap cannot write cookies
 * before a choice is made. The choice lives in localStorage (strictly
 * necessary, no consent required) and can be changed via the footer link.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'ssuite-consent';
    var GA_ID = 'G-15246QV0WM';
    var gaLoaded = false;

    // Flip to true once /privacy/ and /datenschutz/ are published — the banner
    // then links to them. Held false while those pages are still unwritten so
    // the banner cannot link to a 404.
    var LEGAL_PAGES_LIVE = false;

    var COPY = {
        en: {
            text: 'We use cookies to measure how the site is used. Analytics only runs if you accept.',
            accept: 'Accept',
            decline: 'Decline',
            privacy: 'Privacy policy',
            privacyHref: '/privacy/',
            aria: 'Cookie consent'
        },
        de: {
            text: 'Wir verwenden Cookies, um die Nutzung der Website zu messen. Die Analyse läuft nur mit Ihrer Zustimmung.',
            accept: 'Akzeptieren',
            decline: 'Ablehnen',
            privacy: 'Datenschutz',
            privacyHref: '/datenschutz/',
            aria: 'Cookie-Einwilligung'
        }
    };
    var t = COPY[(document.documentElement.lang || 'en').slice(0, 2) === 'de' ? 'de' : 'en'];

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    // Deny everything until told otherwise.
    gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500
    });

    function loadGA() {
        if (gaLoaded) return;
        gaLoaded = true;
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);
        gtag('js', new Date());
        gtag('config', GA_ID, { anonymize_ip: true });
    }

    function grant() {
        gtag('consent', 'update', { analytics_storage: 'granted' });
        loadGA();
    }

    /* Clears the GA cookies that were set while consent was active, so that
       withdrawing consent actually removes them rather than just stopping
       new writes. */
    function clearGACookies() {
        var host = location.hostname;
        var domains = ['', host, '.' + host];
        var parts = host.split('.');
        if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
        document.cookie.split(';').forEach(function (c) {
            var name = c.split('=')[0].trim();
            if (name.indexOf('_ga') !== 0 && name.indexOf('_gid') !== 0) return;
            domains.forEach(function (d) {
                document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
                    (d ? '; domain=' + d : '');
            });
        });
    }

    function read() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }
    function write(v) {
        try { localStorage.setItem(STORAGE_KEY, v); } catch (e) { /* private mode */ }
    }

    function buildBanner() {
        var wrap = document.createElement('div');
        wrap.id = 'cookie-banner';
        wrap.setAttribute('role', 'dialog');
        wrap.setAttribute('aria-label', t.aria);

        var p = document.createElement('p');
        p.textContent = t.text;
        if (LEGAL_PAGES_LIVE) {
            p.textContent += ' ';
            var a = document.createElement('a');
            a.href = t.privacyHref;
            a.textContent = t.privacy;
            p.appendChild(a);
        }

        var btns = document.createElement('div');
        btns.className = 'cookie-banner-btns';

        var decline = document.createElement('button');
        decline.type = 'button';
        decline.className = 'cb-decline';
        decline.textContent = t.decline;
        decline.addEventListener('click', function () {
            write('denied');
            clearGACookies();
            hide();
        });

        var accept = document.createElement('button');
        accept.type = 'button';
        accept.className = 'cb-accept';
        accept.textContent = t.accept;
        accept.addEventListener('click', function () {
            write('granted');
            grant();
            hide();
        });

        btns.appendChild(decline);
        btns.appendChild(accept);
        wrap.appendChild(p);
        wrap.appendChild(btns);
        return wrap;
    }

    var banner = null;
    function show() {
        if (!banner) {
            banner = buildBanner();
            document.body.appendChild(banner);
            // Force a reflow so the browser registers the off-screen start
            // position before the class flips it in. Doing this synchronously
            // rather than via rAF means the banner still appears if the page is
            // in a background tab, where rAF callbacks never fire.
            void banner.offsetHeight;
        }
        banner.classList.add('visible');
    }
    function hide() {
        if (banner) banner.classList.remove('visible');
    }

    // Re-opening from the footer link.
    window.ssuiteOpenCookieSettings = function () {
        show();
        return false;
    };

    function init() {
        var choice = read();
        if (choice === 'granted') { grant(); }
        else if (choice !== 'denied') { show(); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
