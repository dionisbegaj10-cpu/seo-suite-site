(function () {
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function assembleLogoParticles(canvas, img, width, height) {
        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        var scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
        var drawW = img.naturalWidth * scale;
        var drawH = img.naturalHeight * scale;
        var offsetX = (width - drawW) / 2;
        var offsetY = (height - drawH) / 2;

        var off = document.createElement('canvas');
        off.width = width;
        off.height = height;
        var offCtx = off.getContext('2d');
        offCtx.drawImage(img, offsetX, offsetY, drawW, drawH);

        var data;
        try {
            data = offCtx.getImageData(0, 0, width, height).data;
        } catch (e) {
            canvas.style.display = 'none';
            return;
        }

        var particles = [];
        var step = 2;
        for (var y = 0; y < height; y += step) {
            for (var x = 0; x < width; x += step) {
                var idx = (y * width + x) * 4;
                if (data[idx + 3] > 80) {
                    var angle = Math.random() * Math.PI * 2;
                    var dist = 120 + Math.random() * 220;
                    var startX = width / 2 + Math.cos(angle) * dist;
                    var startY = height / 2 + Math.sin(angle) * dist;
                    particles.push({
                        tx: x, ty: y,
                        startX: startX, startY: startY,
                        delay: Math.random() * 260
                    });
                }
            }
        }

        var duration = 1200;
        var startTime = null;

        function frame(ts) {
            if (!startTime) startTime = ts;
            var elapsed = ts - startTime;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            var allDone = true;
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                var t = Math.max(0, Math.min(1, (elapsed - p.delay) / duration));
                if (t < 1) allDone = false;
                var e = easeOutCubic(t);
                var cx = p.startX + (p.tx - p.startX) * e;
                var cy = p.startY + (p.ty - p.startY) * e;
                ctx.fillRect(cx, cy, 1.6, 1.6);
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
            var canvas = wrap.querySelector('canvas.client-logo-canvas');
            var img = wrap.querySelector('img.client-logo');
            if (!canvas || !img) return;
            var w = parseInt(canvas.dataset.width, 10) || 220;
            var h = parseInt(canvas.dataset.height, 10) || 90;
            if (img.complete && img.naturalWidth) {
                assembleLogoParticles(canvas, img, w, h);
            } else {
                img.addEventListener('load', function () {
                    assembleLogoParticles(canvas, img, w, h);
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogoParticles);
    } else {
        initLogoParticles();
    }
})();
