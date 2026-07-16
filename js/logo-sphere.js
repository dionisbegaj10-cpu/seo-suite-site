(function () {
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    function LogoSphere(canvas, img, opts) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.img = img;
        // Total scroll distance (px) the disassemble/sphere/zoom/wash
        // sequence plays out over. Falls back to one viewport height if no
        // #hero-spacer is found.
        this.scrollRange = opts.scrollRange || (window.innerHeight || 800);
        this.depth = opts.depth || 40;
        this.dotColor = opts.dotColor || '255,255,255';
        this.baseRotationSpeed = opts.rotationSpeed !== undefined ? opts.rotationSpeed : 0.22; // idle: none; ramps in as it morphs into the sphere
        this.cameraDistance = 200; // shrinks (and goes negative) as user scrolls -> "zoom in"
        this.targetCameraDistance = 200;
        this.focal = 1400;
        this.angle = 0;
        this.points = [];
        this.assembleStart = null;
        this.assembleDuration = 900;
        this.assembled = false;
        this.assembledAt = null;
        this.imgFadeDuration = 500;
        // Scroll-driven morph state: 0 = assembled logo at rest, 1 = fully
        // formed, zoomed, wave-distorted dot sphere washed out to white.
        // Smoothed values trail the raw scroll targets for organic easing,
        // and since everything is re-derived from scroll position every
        // frame (no one-shot timers), scrolling back up reverses it cleanly.
        this.morphT = 0;
        this.targetMorphT = 0;
        this.washT = 0;
        this.targetWashT = 0;
        this._resize();
        this._sample();
        this._bindEvents();
        window.__logoSphereDebug = this;
        requestAnimationFrame(this._frame.bind(this));
    }

    LogoSphere.prototype._resize = function () {
        var dpr = window.devicePixelRatio || 1;
        var vw = window.innerWidth || document.documentElement.clientWidth || 1200;
        var vh = window.innerHeight || document.documentElement.clientHeight || 800;
        this.vw = vw;
        this.vh = vh;
        this.canvas.width = vw * dpr;
        this.canvas.height = vh * dpr;
        this.canvas.style.width = vw + 'px';
        this.canvas.style.height = vh + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    LogoSphere.prototype._sample = function () {
        var img = this.img;
        // Fit the logo against the real viewport axes (not the smaller
        // dimension) so wide logos fill the screen just like tall ones —
        // sized like the homepage hero sphere. The 1.1 compensates for the
        // resting projection scale (~0.875) so the logo lands near full-bleed.
        var scale = Math.min(this.vw * 1.1 / img.naturalWidth, this.vh * 1.1 / img.naturalHeight);
        var w = img.naturalWidth * scale;
        var h = img.naturalHeight * scale;
        this.logoW = w;
        this.logoH = h;

        var off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        var offCtx = off.getContext('2d');
        offCtx.drawImage(img, 0, 0, w, h);

        var data;
        try {
            data = offCtx.getImageData(0, 0, w, h).data;
        } catch (e) {
            return;
        }

        // Render a separate, high-resolution (device-pixel-ratio aware) white
        // tint of the logo purely for the crisp fade-in reveal — the low-res
        // sampling canvas above is fine for picking particle positions, but
        // drawing it back out at screen size looked jagged/pixelated.
        var dpr = window.devicePixelRatio || 1;
        var hi = document.createElement('canvas');
        hi.width = w * dpr;
        hi.height = h * dpr;
        var hiCtx = hi.getContext('2d');
        hiCtx.imageSmoothingEnabled = true;
        hiCtx.imageSmoothingQuality = 'high';
        hiCtx.scale(dpr, dpr);
        hiCtx.drawImage(img, 0, 0, w, h);
        hiCtx.globalCompositeOperation = 'source-in';
        hiCtx.fillStyle = '#fff';
        hiCtx.fillRect(0, 0, w, h);
        hiCtx.globalCompositeOperation = 'source-over';
        this.whiteImg = hi;

        // Sparser sampling (~4k target) — the dots only need to read as an
        // approximate silhouette during assembly since they fade out and
        // are replaced by the crisp real logo once assembled, so they no
        // longer need tight overlap for legibility.
        var step = Math.max(3, Math.sqrt((w * h) / 4000));
        this.dotBase = Math.max(2, step * 0.7);
        var pts = [];
        for (var y = 0; y < h; y += step) {
            for (var x = 0; x < w; x += step) {
                var idx = (Math.floor(y) * Math.floor(w) + Math.floor(x)) * 4;
                if (data[idx + 3] > 80) {
                    var lx = x - w / 2;
                    var ly = y - h / 2;
                    var lz = (Math.random() - 0.5) * this.depth;
                    // Each particle approaches from its own random direction
                    // and distance so they visibly mix together as they
                    // converge, rather than all sliding in from one side.
                    var dir = Math.random() * Math.PI * 2;
                    var dist = this.vw * (0.35 + Math.random() * 0.55);
                    pts.push({
                        x: lx, y: ly, z: lz,
                        startX: Math.cos(dir) * dist,
                        startY: Math.sin(dir) * dist * (this.vh / this.vw),
                        startZ: (Math.random() - 0.5) * 1100,
                        delay: Math.random() * 350
                    });
                }
            }
        }

        // Give every particle a second target: a point on an organic,
        // wave-distorted sphere (same distribution technique as the
        // homepage's rotating dot-sphere hero). Scroll morphs each particle
        // from its logo position to this sphere position.
        var n = pts.length;
        var goldenAngle = Math.PI * (3 - Math.sqrt(5));
        var sphereR = (this.logoW + this.logoH) / 4;
        for (var i = 0; i < n; i++) {
            var yFrac = n > 1 ? 1 - (i / (n - 1)) * 2 : 0;
            var radiusAtY = Math.sqrt(Math.max(0, 1 - yFrac * yFrac));
            var theta = goldenAngle * i;
            var bx = Math.cos(theta) * radiusAtY;
            var by = yFrac;
            var bz = Math.sin(theta) * radiusAtY;
            var waveR = sphereR * (1 + 0.18 * Math.sin(by * 4.2) + 0.12 * Math.sin(theta * 3.1));
            pts[i].sx = bx * waveR;
            pts[i].sy = by * waveR;
            pts[i].sz = bz * waveR;
        }

        this.points = pts;
    };

    LogoSphere.prototype._bindEvents = function () {
        var self = this;
        window.addEventListener('resize', function () {
            self._resize();
        });
        window.addEventListener('scroll', function () {
            var y = window.pageYOffset || document.documentElement.scrollTop || 0;
            // The whole sequence (break-apart -> sphere -> zoom -> white wash)
            // plays out over this.scrollRange px, matching the #hero-spacer
            // that reserves that scroll distance — made deliberately long so
            // a single fast swipe can't skip past it before it's visible.
            var hz = Math.max(0, Math.min(1, y / self.scrollRange));
            self.targetMorphT = hz;
            // Wash to white over the back half of the same scroll range.
            self.targetWashT = Math.max(0, Math.min(1, (hz - 0.55) / 0.45));
            // 200 (idle) -> deep negative (camera pushes well past the
            // surface, dots blow up and overlap) as the user scrolls.
            self.targetCameraDistance = 200 - hz * 1100;
        }, { passive: true });
    };

    LogoSphere.prototype._frame = function (ts) {
        if (!this.assembleStart) this.assembleStart = ts;
        var elapsed = ts - this.assembleStart;

        this.morphT += (this.targetMorphT - this.morphT) * 0.08;
        this.washT += (this.targetWashT - this.washT) * 0.08;
        var morphE = easeInOutCubic(Math.max(0, Math.min(1, this.morphT)));
        var washE = easeInOutCubic(Math.max(0, Math.min(1, this.washT)));

        this.rotationSpeed = this.baseRotationSpeed * morphE;
        this.angle += this.rotationSpeed / 60;
        this.cameraDistance += (this.targetCameraDistance - this.cameraDistance) * 0.08;

        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.vw, this.vh);

        var cx = this.vw / 2;
        var cy = this.vh / 2;
        var cosA = Math.cos(this.angle);
        var sinA = Math.sin(this.angle);
        var allAssembled = true;

        // Once assembled and at rest (not being scrolled into the sphere),
        // the dots crossfade out while the real crisp logo fades in on top.
        // As soon as the user scrolls, the image fades back out so the dots
        // are what visibly "break apart" into the sphere.
        var imgAlpha = 0;
        if (this.assembled && this.assembledAt !== null) {
            imgAlpha = Math.max(0, Math.min(1, (ts - this.assembledAt) / this.imgFadeDuration)) * (1 - morphE);
        }
        var dotAlphaMul = 1 - imgAlpha;
        var sizeGrow = 1 + this.morphT * 2.2;

        for (var i = 0; i < this.points.length && dotAlphaMul > 0; i++) {
            var p = this.points[i];
            var t = Math.max(0, Math.min(1, (elapsed - p.delay) / this.assembleDuration));
            if (t < 1) allAssembled = false;
            var e = easeOutCubic(t);

            // blend each particle's rest position from its logo coordinate
            // toward its sphere coordinate as the user scrolls
            var restX = p.x + (p.sx - p.x) * morphE;
            var restY = p.y + (p.sy - p.y) * morphE;
            var restZ = p.z + (p.sz - p.z) * morphE;

            // rotate the (blended) rest point around the Y axis
            var rx = restX * cosA - restZ * sinA;
            var rz = restX * sinA + restZ * cosA;

            var curX = p.startX + (rx - p.startX) * e;
            var curY = p.startY + (restY - p.startY) * e;
            var curZ = p.startZ + (rz - p.startZ) * e;

            var scale = this.focal / (this.focal + curZ + this.cameraDistance);
            var sx = cx + curX * scale;
            var sy = cy + curY * scale;
            var size = Math.max(1.1, (this.dotBase || 2.4) * scale * sizeGrow);
            var alpha = Math.max(0.55, Math.min(1, scale * 1.1)) * (0.7 + 0.3 * e) * dotAlphaMul;

            ctx.fillStyle = 'rgba(' + this.dotColor + ',' + alpha.toFixed(2) + ')';
            ctx.beginPath();
            ctx.arc(sx, sy, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        if (allAssembled && !this.assembled) {
            this.assembled = true;
            this.assembledAt = ts;
            if (this.canvas.parentElement) {
                this.canvas.parentElement.classList.add('sphere-assembled');
            }
        }

        if (imgAlpha > 0) {
            var camScale = this.focal / (this.focal + this.cameraDistance);
            var dw = this.logoW * camScale;
            var dh = this.logoH * camScale;
            ctx.globalAlpha = imgAlpha;
            ctx.drawImage(this.whiteImg || this.img, cx - dw / 2, cy - dh / 2, dw, dh);
            ctx.globalAlpha = 1;
        }

        // Wash the whole sphere out to white as the scroll sequence finishes
        // — painted last so it covers the dots regardless of their own alpha.
        if (washE > 0) {
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = washE;
            ctx.fillRect(0, 0, this.vw, this.vh);
            ctx.globalAlpha = 1;
        }

        requestAnimationFrame(this._frame.bind(this));
    };

    function initLogoSphere() {
        var containers = document.querySelectorAll('.logo-sphere-container');
        containers.forEach(function (container) {
            var img = container.querySelector('img.logo-sphere-source');
            if (!img) return;
            var canvas = document.createElement('canvas');
            canvas.className = 'logo-sphere-canvas';
            container.appendChild(canvas);

            function run() {
                var heroSpacer = document.getElementById('hero-spacer');
                var opts = {};
                if (heroSpacer) opts.scrollRange = heroSpacer.offsetHeight;
                new LogoSphere(canvas, img, opts);
            }
            if (img.complete && img.naturalWidth) {
                run();
            } else {
                img.addEventListener('load', run);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogoSphere);
    } else {
        initLogoSphere();
    }
})();
