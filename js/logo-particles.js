(function () {
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function assembleLogoParticles(canvas, img, wrap) {
        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;
        var vw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 1200;
        var vh = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 800;

        canvas.width = vw * dpr;
        canvas.height = vh * dpr;
        canvas.style.width = vw + 'px';
        canvas.style.height = vh + 'px';
        ctx.scale(dpr, dpr);

        var wrapRect = wrap.getBoundingClientRect();
        var targetW = wrapRect.width;
        var targetH = wrapRect.height;

        var scale = Math.min(targetW / img.naturalWidth, targetH / img.naturalHeight);
        var drawW = img.naturalWidth * scale;
        var drawH = img.naturalHeight * scale;
        var offsetX = (targetW - drawW) / 2;
        var offsetY = (targetH - drawH) / 2;

        var off = document.createElement('canvas');
        off.width = targetW;
        off.height = targetH;
        var offCtx = off.getContext('2d');
        offCtx.drawImage(img, offsetX, offsetY, drawW, drawH);

        var data;
        try {
            data = offCtx.getImageData(0, 0, targetW, targetH).data;
        } catch (e) {
            canvas.style.display = 'none';
            return;
        }

        var particles = [];
        var step = 2;
        for (var y = 0; y < targetH; y += step) {
            for (var x = 0; x < targetW; x += step) {
                var idx = (y * targetW + x) * 4;
                if (data[idx + 3] > 80) {
                    particles.push({
                        tx: wrapRect.left + x,
                        ty: wrapRect.top + y,
                        startX: Math.random() * vw,
                        startY: Math.random() * vh,
                        delay: Math.random() * 500
                    });
                }
            }
        }

        var duration = 1500;
        var startTime = null;

        function frame(ts) {
            if (!startTime) startTime = ts;
            var elapsed = ts - startTime;
            ctx.clearRect(0, 0, vw, vh);
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            var allDone = true;
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                var t = Math.max(0, Math.min(1, (elapsed - p.delay) / duration));
                if (t < 1) allDone = false;
                var e = easeOutCubic(t);
                var cx = p.startX + (p.tx - p.startX) * e;
                var cy = p.startY + (p.ty - p.startY) * e;
                ctx.fillRect(cx, cy, 1.8, 1.8);
            }
            if (!allDone) {
                requestAnimationFrame(frame);
            } else {
                canvas.classList.add('assembled');
            }
        }
        requestAnimationFrame(frame);
    }

    function initLogoParticles() {
        var wraps = document.querySelectorAll('.client-logo-wrap');
        wraps.forEach(function (wrap) {
            var img = wrap.querySelector('img.client-logo');
            if (!img) return;

            var canvas = document.createElement('canvas');
            canvas.className = 'client-logo-canvas';
            document.body.appendChild(canvas);

            function run(retries) {
                var vw = window.innerWidth || document.documentElement.clientWidth;
                var vh = window.innerHeight || document.documentElement.clientHeight;
                if ((!vw || !vh) && retries > 0) {
                    setTimeout(function () { run(retries - 1); }, 50);
                    return;
                }
                assembleLogoParticles(canvas, img, wrap);
            }

            if (img.complete && img.naturalWidth) {
                run(20);
            } else {
                img.addEventListener('load', function () { run(20); });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogoParticles);
    } else {
        initLogoParticles();
    }
})();
