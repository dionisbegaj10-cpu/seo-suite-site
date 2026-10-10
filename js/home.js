/* SSUITE homepage: background dot field, light/dark switching and the
 * scroll reveals for each section. No dependencies. */
(function () {
    'use strict';

    function $(id) { return document.getElementById(id); }
    function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
    function viewH() { return window.innerHeight || document.documentElement.clientHeight; }

    // Whole element on screen.
    function onScreen(el) {
        if (!el) return false;
        var b = el.getBoundingClientRect();
        return b.top >= 0 && b.left >= 0 && b.bottom <= viewH() &&
               b.right <= (window.innerWidth || document.documentElement.clientWidth);
    }
    // Top edge has entered the viewport (with a 10% head start).
    function reached(el) {
        return !!el && el.getBoundingClientRect().top <= viewH() * 1.1;
    }

    // Words reveal one after another.
    function stagger(id, startMs, stepMs) {
        var el = $(id);
        if (!el) return;
        Array.prototype.forEach.call(el.querySelectorAll('span'), function (s, i) {
            s.style.transitionDelay = (startMs + i * stepMs) + 'ms';
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var body = document.body;
        body.classList.add('animated');

        var field = window.DotField ? new DotField('blob_container', { color: '#d0d0d0', mode: 'hero' }) : null;
        window.ssField = field;

        stagger('intro', 0, 90);
        stagger('text1', 100, 15);
        stagger('stats-sub', 100, 15);
        stagger('stats-title', 100, 80);
        stagger('ftitle', 150, 80);

        var intro = $('intro');
        var textAnchor = $('anchor-1');
        var servicesAnchor = $('anchor-2');
        var statsAnchor = $('anchor-3');
        var learnAnchor = $('anchor-4');
        var footerAnchor = $('anchor-5');
        var statsGrid = $('stats-grid');
        var freeAnalysis = $('free-analysis-section');
        var fieldEl = $('blob_container');

        function update() {
            var y = window.pageYOffset;

            if (field) {
                if (onScreen(intro)) {
                    field.setMode('hero');
                    if (y < viewH()) field.setZoom(Math.min(1, y / (viewH() * 0.26)));
                }
                if (onScreen(textAnchor)) { field.setMode('calm'); field.setZoom(1); }
                if (onScreen(statsAnchor) || onScreen(footerAnchor)) { field.setMode('wide'); field.setZoom(0); }
            }

            // Dark while the hero, the studio stats or the footer is on screen.
            var dark = onScreen(intro) || onScreen(statsAnchor) || onScreen(footerAnchor);
            body.classList.toggle('animated', dark);
            if (fieldEl) fieldEl.classList.toggle('animated', dark);

            if (reached(textAnchor)) $('text1').classList.add('animated');
            if (reached(freeAnalysis)) freeAnalysis.classList.add('animated');
            if (reached(servicesAnchor)) each('#collaborations, .customer-clients, #explore-label', function (el) { el.classList.add('animated'); });
            if (reached(statsGrid)) each('#stats-title, #stats-grid, #stats-sub', function (el) { el.classList.add('animated'); });
            if (reached(learnAnchor)) { var l = $('learn-section'); if (l) l.classList.add('animated'); }
            if (reached(footerAnchor)) each('#ftitle, .footer-box-center, #address, .footer-box-right', function (el) { el.classList.add('animated'); });
        }

        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        requestAnimationFrame(function () {
            if (intro) intro.classList.add('animated');
            update();
        });
    });
})();
