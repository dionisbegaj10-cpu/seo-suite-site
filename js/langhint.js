/* Language suggestion bar.
 *
 * Deliberately does NOT redirect. Googlebot crawls from US IPs with an English
 * Accept-Language, so any automatic redirect would send the crawler to /en/ and
 * leave the German pages — the primary version — under-crawled. Instead the
 * page always renders in its own language and we offer the alternative, which
 * is the pattern Google recommends.
 *
 * The counterpart URL comes from the page's own hreflang tags, so this works on
 * every page without per-page configuration.
 */
(function () {
    'use strict';

    var KEY = 'ssuite-lang-choice';

    var pageLang = (document.documentElement.lang || 'de').slice(0, 2).toLowerCase();
    var other = pageLang === 'de' ? 'en' : 'de';

    var COPY = {
        // Shown on a German page to someone whose browser is not German.
        en: { text: 'This page is also available in English.', cta: 'View in English', dismiss: 'Dismiss' },
        // Shown on an English page to someone whose browser is German.
        de: { text: 'Diese Seite ist auch auf Deutsch verfügbar.', cta: 'Auf Deutsch ansehen', dismiss: 'Schließen' }
    };

    function stored() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function remember(v) {
        try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ }
    }

    // Where is the other language version of THIS page?
    function altHref() {
        var link = document.querySelector('link[rel="alternate"][hreflang="' + other + '"]');
        if (!link) return null;
        var href = link.getAttribute('href');
        if (!href) return null;
        try {
            // hreflang hrefs are absolute production URLs, so compare paths
            // rather than origins — otherwise this silently does nothing on
            // staging, on localhost, or if the domain ever changes. Only the
            // path is used, so the visitor is always kept on this host.
            var u = new URL(href, window.location.origin);
            if (!u.pathname || u.pathname.charAt(0) !== '/') return null;
            if (u.pathname === window.location.pathname) return null;
            return u.pathname;
        } catch (e) { return null; }
    }

    function browserPrefers(lang) {
        var langs = navigator.languages && navigator.languages.length
            ? navigator.languages : [navigator.language || ''];
        for (var i = 0; i < langs.length; i++) {
            var l = (langs[i] || '').slice(0, 2).toLowerCase();
            if (l === 'de') return 'de';
            if (l) return l === lang ? lang : l;
        }
        return null;
    }

    function build(t, href) {
        var bar = document.createElement('div');
        bar.id = 'lang-hint';
        bar.setAttribute('role', 'region');
        bar.setAttribute('aria-label', t.text);

        var p = document.createElement('span');
        p.textContent = t.text;

        var go = document.createElement('a');
        go.href = href;
        go.className = 'lang-hint-go';
        go.textContent = t.cta;
        go.addEventListener('click', function () { remember(other); });

        var close = document.createElement('button');
        close.type = 'button';
        close.className = 'lang-hint-close';
        close.setAttribute('aria-label', t.dismiss);
        close.textContent = '×';
        close.addEventListener('click', function () {
            remember(pageLang);
            bar.classList.remove('visible');
            document.body.classList.remove('lang-hint-open');
        });

        bar.appendChild(p);
        bar.appendChild(go);
        bar.appendChild(close);
        return bar;
    }

    function init() {
        if (stored()) return;                   // already chose a language
        var pref = browserPrefers(pageLang);
        if (!pref) return;

        // Only offer the switch when the browser disagrees with this page.
        var wantsOther = (other === 'de' && pref === 'de') ||
                         (other === 'en' && pref !== 'de');
        if (!wantsOther) return;

        var href = altHref();
        if (!href) return;

        var bar = build(COPY[other], href);
        document.body.appendChild(bar);
        void bar.offsetHeight;                  // reflow, so the transition runs
        bar.classList.add('visible');
        // Shifts the site's fixed top elements down so the bar doesn't cover
        // the back-link and language switcher.
        document.body.classList.add('lang-hint-open');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
