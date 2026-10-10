/* SSUITE dot field: a perspective grid of dots rippling like a surface of
 * water, drawn on a full-screen canvas behind the homepage and blog.
 *
 *   var field = new DotField('blob_container', { color: '#d0d0d0' });
 *   field.setMode('hero' | 'calm' | 'wide');   // eases to a preset
 *   field.setZoom(0..1);                        // 0 = far, 1 = close
 *   field.color = '#1c1c1c';                    // dot colour
 */
(function () {
    'use strict';

    var MODES = {
        hero: { amp: 1.0, tilt: 0.95, spin: 0.06, size: 1.0 },
        calm: { amp: 0.35, tilt: 1.25, spin: 0.03, size: 0.8 },
        wide: { amp: 0.7, tilt: 0.7, spin: 0.045, size: 0.9 }
    };

    function DotField(containerId, opts) {
        opts = opts || {};
        this.el = document.getElementById(containerId);
        if (!this.el) return;
        this.color = opts.color || '#d0d0d0';
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('aria-hidden', 'true');
        this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
        this.el.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.target = { amp: 1, tilt: 0.95, spin: 0.06, size: 1, zoom: 0 };
        this.state = { amp: 1, tilt: 0.95, spin: 0.06, size: 1, zoom: 0 };
        if (opts.mode && MODES[opts.mode]) this.setMode(opts.mode, true);
        if (typeof opts.zoom === 'number') this.setZoom(opts.zoom, true);

        this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        this.angle = 0;
        this.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var self = this;
        this.resize();
        window.addEventListener('resize', function () { self.resize(); });
        window.addEventListener('pointermove', function (e) {
            self.pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
            self.pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
        }, { passive: true });

        this.last = performance.now();
        this.t = 0;
        requestAnimationFrame(function loop(now) {
            self.frame(now);
            requestAnimationFrame(loop);
        });
    }

    DotField.prototype.setMode = function (name, instant) {
        var m = MODES[name];
        if (!m) return;
        for (var k in m) {
            this.target[k] = m[k];
            if (instant) this.state[k] = m[k];
        }
    };

    DotField.prototype.setZoom = function (z, instant) {
        this.target.zoom = Math.max(0, Math.min(1, z));
        if (instant) this.state.zoom = this.target.zoom;
    };

    DotField.prototype.resize = function () {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.w = this.el.clientWidth || window.innerWidth;
        this.h = this.el.clientHeight || window.innerHeight;
        this.canvas.width = Math.round(this.w * dpr);
        this.canvas.height = Math.round(this.h * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Fewer dots on small screens keeps phones smooth.
        this.cols = this.w < 600 ? 46 : 72;
        this.rows = this.w < 600 ? 46 : 72;
    };

    DotField.prototype.frame = function (now) {
        var dt = Math.min(0.05, (now - this.last) / 1000);
        this.last = now;
        if (!this.reduced) this.t += dt;

        // Ease every parameter toward its target.
        var s = this.state, tg = this.target, ease = 1 - Math.pow(0.02, dt);
        for (var k in tg) s[k] += (tg[k] - s[k]) * ease;
        var p = this.pointer;
        p.x += (p.tx - p.x) * ease;
        p.y += (p.ty - p.y) * ease;
        if (!this.reduced) this.angle += s.spin * dt;

        var ctx = this.ctx, w = this.w, h = this.h;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = this.color;

        var cols = this.cols, rows = this.rows;
        var span = 2.2;                       // grid half-width in world units
        var camDist = 4.2 - s.zoom * 2.4;     // closer camera = bigger field
        var focal = Math.min(w, h) * 0.9;
        var tilt = s.tilt + p.y * 0.08;
        var yaw = this.angle + p.x * 0.12;
        var cosT = Math.cos(tilt), sinT = Math.sin(tilt);
        var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
        var t = this.t, amp = 0.28 * s.amp;
        var base = (w < 600 ? 1.1 : 1.5) * s.size;

        for (var i = 0; i < cols; i++) {
            var u = (i / (cols - 1)) * 2 - 1;
            for (var j = 0; j < rows; j++) {
                var v = (j / (rows - 1)) * 2 - 1;
                var x = u * span, z = v * span;
                // Keep the field round rather than square.
                var r2 = u * u + v * v;
                if (r2 > 1) continue;
                // Two travelling waves plus a radial ripple from the centre.
                var r = Math.sqrt(r2) * span;
                var y = amp * (Math.sin(x * 1.7 + t * 0.9) * 0.55 +
                               Math.cos(z * 1.3 - t * 0.6) * 0.45 +
                               Math.sin(r * 3.1 - t * 1.4) * 0.6) * (1 - r2 * 0.5);

                // Rotate around the vertical axis, then tilt toward the camera.
                var rx = x * cosY - z * sinY;
                var rz = x * sinY + z * cosY;
                var ty = y * cosT - rz * sinT;
                var tz = y * sinT + rz * cosT + camDist;
                if (tz <= 0.2) continue;

                var sx = w / 2 + (rx / tz) * focal;
                var sy = h / 2 + (ty / tz) * focal;
                if (sx < -4 || sx > w + 4 || sy < -4 || sy > h + 4) continue;

                var d = base * (2.6 / tz);
                ctx.globalAlpha = Math.max(0.15, Math.min(1, 1.4 - r2));
                ctx.fillRect(sx - d / 2, sy - d / 2, d, d);
            }
        }
        ctx.globalAlpha = 1;
    };

    window.DotField = DotField;
})();
