(function () {
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function LogoSphere(canvas, img, opts) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.img = img;
        this.depth = opts.depth || 90;
        this.dotColor = opts.dotColor || '208,208,208';
        this.rotationSpeed = opts.rotationSpeed || 0.18; // radians/sec
        this.cameraDistance = 200; // shrinks (and goes negative) as user scrolls -> "zoom in"
        this.targetCameraDistance = 200;
        this.focal = 1400;
        this.angle = 0;
        this.points = [];
        this.assembleStart = null;
        this.assembleDuration = 1500;
        this.assembled = false;
        this._resize();
        this._sample();
        this._bindEvents();
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
        var maxDim = Math.min(this.vw, this.vh) * 1.2;
        var scale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight);
        var w = img.naturalWidth * scale;
        var h = img.naturalHeight * scale;

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

        var step = 2.2;
        var pts = [];
        for (var y = 0; y < h; y += step) {
            for (var x = 0; x < w; x += step) {
                var idx = (Math.floor(y) * Math.floor(w) + Math.floor(x)) * 4;
                if (data[idx + 3] > 80) {
                    var lx = x - w / 2;
                    var ly = y - h / 2;
                    var lz = (Math.random() - 0.5) * this.depth;
                    pts.push({
                        x: lx, y: ly, z: lz,
                        startX: (Math.random() - 0.5) * this.vw * 1.4,
                        startY: (Math.random() - 0.5) * this.vh * 1.4,
                        startZ: (Math.random() - 0.5) * 900,
                        delay: Math.random() * 500
                    });
                }
            }
        }
        this.points = pts;
    };

    LogoSphere.prototype._bindEvents = function () {
        var self = this;
        window.addEventListener('resize', function () {
            self._resize();
        });
        window.addEventListener('scroll', function () {
            var vh = self.vh;
            var y = window.pageYOffset || document.documentElement.scrollTop || 0;
            var hz = Math.max(0, Math.min(1, y / (vh * 0.9)));
            // 200 (idle) -> -150 (camera pushes past the surface) as user scrolls
            self.targetCameraDistance = 200 - hz * 350;
        }, { passive: true });
    };

    LogoSphere.prototype._frame = function (ts) {
        if (!this.assembleStart) this.assembleStart = ts;
        var elapsed = ts - this.assembleStart;

        this.angle += this.rotationSpeed / 60;
        this.cameraDistance += (this.targetCameraDistance - this.cameraDistance) * 0.08;

        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.vw, this.vh);

        var cx = this.vw / 2;
        var cy = this.vh / 2;
        var cosA = Math.cos(this.angle);
        var sinA = Math.sin(this.angle);
        var allAssembled = true;

        for (var i = 0; i < this.points.length; i++) {
            var p = this.points[i];
            var t = Math.max(0, Math.min(1, (elapsed - p.delay) / this.assembleDuration));
            if (t < 1) allAssembled = false;
            var e = easeOutCubic(t);

            // rotate the assembled (target) point around Y axis
            var rx = p.x * cosA - p.z * sinA;
            var rz = p.x * sinA + p.z * cosA;

            var curX = p.startX + (rx - p.startX) * e;
            var curY = p.startY + (p.y - p.startY) * e;
            var curZ = p.startZ + (rz - p.startZ) * e;

            var scale = this.focal / (this.focal + curZ + this.cameraDistance);
            var sx = cx + curX * scale;
            var sy = cy + curY * scale;
            var size = Math.max(0.6, 1.7 * scale);
            var alpha = Math.max(0.15, Math.min(1, scale * 1.1)) * (0.6 + 0.4 * e);

            ctx.fillStyle = 'rgba(' + this.dotColor + ',' + alpha.toFixed(2) + ')';
            ctx.fillRect(sx, sy, size, size);
        }

        if (allAssembled && !this.assembled) {
            this.assembled = true;
            if (this.canvas.parentElement) {
                this.canvas.parentElement.classList.add('sphere-assembled');
            }
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
                new LogoSphere(canvas, img, {});
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
