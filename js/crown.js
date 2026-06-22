/*
 * crown.js — a detailed bunny FACE rendered with the ORIGINAL blob motion.
 *
 * Drop-in replacement for blob-min.js (same window.BlobAnimation(id, settings)
 * API main.js drives). The motion is a faithful port of the original
 * ilabsolutions blob — same diagonal-axis tumble accumulated as q = R(angle,axis)*q,
 * same perspective scale = $/(aa+z) with alpha = scale^2, and the same cursor
 * inertia (a fast stroke boosts the angle + sets the axis from the mouse delta,
 * then eases back to the resting speed over INERTIAL_TIME with a powOut(3) curve).
 * Only the geometry differs: a dense bunny-face point cloud instead of a sphere.
 */
(function () {
  function clampNum(v, def, lo, hi) { return isNaN(v) ? def : v < lo ? lo : v > hi ? hi : v; }
  function powOut3(t) { t = 1 - t; return 1 - t * t * t; }

  // Model space: +x right, +y up, +z toward the viewer.
  function buildBunnyFace() {
    var P = [];
    function rnd(a) { return (Math.random() - 0.5) * a; }
    var HX = 0.76, HY = 0.70, HZ = 0.56;

    function ell(cx, cy, cz, rx, ry, rz, latN, lonScale, jit) {
      for (var i = 0; i <= latN; i++) {
        var lat = (i / latN) * Math.PI - Math.PI / 2 + rnd(jit * 0.6);
        var cl = Math.cos(lat), sl = Math.sin(lat);
        var lonN = Math.max(1, Math.round(latN * lonScale * cl));
        for (var j = 0; j < lonN; j++) {
          var lon = (j / lonN) * Math.PI * 2 + rnd(jit);
          var rj = 1 + rnd(jit * 0.5);
          P.push([cx + rx * rj * cl * Math.cos(lon), cy + ry * rj * sl, cz + rz * rj * cl * Math.sin(lon)]);
        }
      }
    }
    function frontZ(x, y) { var q = 1 - (x / HX) * (x / HX) - (y / HY) * (y / HY); return HZ * Math.sqrt(q > 0 ? q : 0); }

    // head + chubby cheeks
    ell(0, 0, 0, HX, HY, HZ, 50, 2.3, 0.02);
    ell(0.46, -0.17, 0.30, 0.23, 0.21, 0.21, 18, 2.0, 0.02);
    ell(-0.46, -0.17, 0.30, 0.23, 0.21, 0.21, 18, 2.0, 0.02);

    // ears — teardrop with inner-ear ridge, splayed out + leaning back
    function ear(side) {
      var raw = [], L = 1.06, rows = 44;
      for (var i = 0; i <= rows; i++) {
        var t = i / rows;
        var prof = Math.sin(Math.pow(t, 0.82) * Math.PI);
        var w = 0.05 + 0.145 * prof, dep = 0.04 + 0.10 * prof;
        var ringN = Math.max(5, Math.round(24 * prof) + 5);
        for (var j = 0; j < ringN; j++) { var a = (j / ringN) * Math.PI * 2; raw.push([Math.cos(a) * w, t * L, Math.sin(a) * dep]); }
        if (prof > 0.3) {
          var iw = w * 0.5, segs = Math.max(2, Math.round(ringN * 0.4));
          for (var s = 0; s <= segs; s++) { var a2 = (s / segs) * Math.PI - Math.PI / 2; raw.push([Math.cos(a2) * iw, t * L, dep * 0.6 + Math.sin(a2) * 0.012]); }
        }
      }
      var ang = -side * 0.14, ca = Math.cos(ang), sa = Math.sin(ang);
      for (var n = 0; n < raw.length; n++) {
        var x = raw[n][0], y = raw[n][1], z = raw[n][2];
        x += side * 0.10 * (y / L) * (y / L);
        var X = x * ca - y * sa, Y = x * sa + y * ca;
        P.push([X + side * 0.17, Y + 0.55, z - 0.20 * (Y / L) + 0.02]);
      }
    }
    ear(1); ear(-1);

    // eyes — iris ring + inner ring + pupil highlight
    function eye(side) {
      var ex = side * 0.30, ey = 0.13, zz = frontZ(ex, ey), R = 0.12, k, an;
      for (k = 0; k < 48; k++) { an = k / 48 * Math.PI * 2; P.push([ex + Math.cos(an) * R, ey + Math.sin(an) * R * 1.08, zz + 0.02]); }
      for (k = 0; k < 30; k++) { an = k / 30 * Math.PI * 2; P.push([ex + Math.cos(an) * R * 0.62, ey + Math.sin(an) * R * 0.62 * 1.08, zz + 0.05]); }
      for (k = 0; k < 6; k++) P.push([ex + rnd(0.025), ey + rnd(0.025), zz + 0.08]);
    }
    eye(1); eye(-1);

    // nose — small filled downward triangle
    (function () {
      var ny = -0.15, zz = frontZ(0, ny);
      for (var i = 0; i < 56; i++) { var u = Math.random(); P.push([(Math.random() - 0.5) * 2 * 0.065 * (1 - u), ny - u * 0.095, zz + 0.05]); }
    })();

    // mouth — the bunny "Y"
    (function () {
      var zz = frontZ(0, -0.30), i;
      for (i = 0; i < 10; i++) P.push([0, -0.245 - i / 10 * 0.075, zz + 0.03]);
      for (var s = -1; s <= 1; s += 2) for (i = 0; i < 13; i++) { var f = i / 12; P.push([s * f * 0.135, -0.32 - Math.sin(f * 1.25) * 0.065, zz + 0.03]); }
    })();

    // whiskers
    for (var s = -1; s <= 1; s += 2) for (var w = 0; w < 3; w++) {
      var slope = (w - 1) * 0.16;
      for (var i = 1; i <= 11; i++) { var f = i / 11, len = 0.70 * f; P.push([s * (0.17 + len), -0.13 + slope * len * 1.1, 0.50 - f * 0.26]); }
    }

    // centre on the face's mass + scale to sit like the original; flip Y so the
    // ears point up and -Z so the face looks at the viewer at rest.
    var CY = 0.42, SC = 0.60;
    for (var i = 0; i < P.length; i++) { P[i][0] *= SC; P[i][1] = (CY - P[i][1]) * SC; P[i][2] = -P[i][2] * SC; }
    return P;
  }

  function Crown(id, settings) {
    settings = settings || {};
    var host = document.getElementById(id);
    if (!host) return;
    var INF = Number.POSITIVE_INFINITY;

    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;width:100%;height:100%;overflow:hidden;';
    host.appendChild(wrap);
    var m = document.createElement('canvas');
    m.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    wrap.appendChild(m);
    var U = m.getContext('2d');

    var Q = clampNum(settings.BLOB_SIZE, 250, 1, INF);
    var S = clampNum(settings.BLOB_DISTANCE, 1000, 0, INF);
    var X = clampNum(settings.ROTATION_SPEED, 5, 0, INF) / 1000;
    var v = clampNum(settings.PERSPECTIVE_DISTORTION, 1, 0.001, INF);
    var da = clampNum(settings.DOT_SIZE, 2, 0, INF);
    var ba = settings.DOT_COLOR || 'black';
    var u = clampNum(settings.MOUSE_DISTANCE_MIN, 20, 0, INF);
    var J = clampNum(settings.MOUSE_DISTANCE_MAX, u + 400, u + 0.001, INF);
    var B = clampNum(settings.MOUSE_SENSITIVITY, 1, 0, INF) / 1000;
    var ja = 1000 * clampNum(settings.INERTIAL_TIME, 2, 0, INF);
    var Ba = 30, wa = 100;
    var aa = S / v, $ = 1000 / v;

    var pts = buildBunnyFace();
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    var W = 0, H = 0, scale = 1, targetScale = 1;

    var c = { angle: X };
    var A_ = 5, z = 5, K = 1;
    var q = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    var tw = null, ga = 0, ha = 0, ta = 0, ua = 0, va = 0, sa = 0, primed = false, raf = 0;

    function resize() {
      W = wrap.clientWidth || window.innerWidth;
      H = wrap.clientHeight || window.innerHeight;
      m.width = Math.floor(W * dpr);
      m.height = Math.floor(H * dpr);
    }

    function t(a, cc, b) { var s = $ / (aa + b); return { x: s * a, y: s * cc, alpha: s < 1 ? s * s : 1, scale: s }; }

    function frame() {
      if (tw) {
        var pr = (Date.now() - tw.t0) / tw.dur;
        if (pr >= 1) { c.angle = tw.to; tw = null; }
        else c.angle = tw.from + (tw.to - tw.from) * powOut3(pr);
      }
      scale += (targetScale - scale) * 0.06;
      var Qs = Q * scale;

      var O = Math.sqrt(z * z + A_ * A_), n = z / O || 1e-4, p = -A_ / O || 1e-4;
      var P = Math.sin(c.angle), F = Math.cos(c.angle);
      var e = [
        [n * n + p * p * F, n * p * (1 - F), p * P],
        [n * p * (1 - F), p * p + n * n * F, -n * P],
        [-p * P, n * P, (n * n + p * p) * F]
      ];
      var nq = [[], [], []];
      for (var g = 0; g < 3; g++) for (var x = 0; x < 3; x++) nq[g][x] = e[g][0] * q[0][x] + e[g][1] * q[1][x] + e[g][2] * q[2][x];
      q = nq;

      U.setTransform(dpr, 0, 0, dpr, 0, 0);
      U.clearRect(0, 0, W, H);
      U.translate(W / 2, H / 2);
      U.fillStyle = ba;
      for (var i = 0; i < pts.length; i++) {
        var pt = pts[i];
        var d = pt[0] * Qs, f = pt[1] * Qs, kk = pt[2] * Qs;
        var ax = q[0][0] * d + q[0][1] * f + q[0][2] * kk;
        var by = q[1][0] * d + q[1][1] * f + q[1][2] * kk;
        var dz = q[2][0] * d + q[2][1] * f + q[2][2] * kk;
        var pr2 = t(ax, by, dz);
        var b = da * pr2.scale;
        if (b > 40) b = 40;
        if (b > 0) { U.globalAlpha = pr2.alpha; U.fillRect(pr2.x, pr2.y, b, b); }
      }
      U.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function pos(ev) { var b = m.getBoundingClientRect(); return { x: ev.clientX - b.left, y: ev.clientY - b.top }; }
    function onMove(ev) {
      if (!primed) { var p0 = pos(ev); ga = p0.x; ha = p0.y; primed = true; return; }
      var fa = Date.now();
      if (fa - sa <= 1000 / Ba) return;
      var l = pos(ev);
      var G = l.x - ga, Hd = l.y - ha;
      var I = Math.sqrt(G * G + Hd * Hd);
      var Wd = Math.sqrt((l.x - W / 2) * (l.x - W / 2) + (l.y - H / 2) * (l.y - H / 2));
      if (I && Wd < J) {
        var ia = Wd < u ? 1 : (J - Wd) / (J - u);
        if (va && Math.abs(Math.acos((G * ta + Hd * ua) / (va * I))) > Math.PI / 2) K *= -1;
        var boost = Math.min(I, wa) * B * ia;
        if (boost > Math.abs(c.angle)) {
          c.angle = K * boost;
          A_ = K * G; z = K * Hd;
          tw = { from: c.angle, to: K * X, t0: Date.now(), dur: ja };
        }
        ta = G; ua = Hd; va = I;
      }
      ga = l.x; ha = l.y; sa = fa;
    }

    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', onMove);

    // Touch support for mobile — vertical and diagonal swipes only
    var touchX = 0, touchY = 0, touchPrimed = false;
    function onTouchStart(ev) {
      var t = ev.touches[0];
      touchX = t.clientX; touchY = t.clientY; touchPrimed = false;
    }
    function onTouchMove(ev) {
      var t = ev.touches[0];
      var G = t.clientX - touchX, Hd = t.clientY - touchY;
      var I = Math.sqrt(G * G + Hd * Hd);
      if (!I) return;
      // Block near-horizontal swipes (angle < 30° from horizontal)
      if (Math.abs(Hd) < Math.abs(G) * 0.577) { touchX = t.clientX; touchY = t.clientY; return; }
      var fa = Date.now();
      if (fa - sa <= 1000 / Ba) { touchX = t.clientX; touchY = t.clientY; return; }
      var Wd = Math.sqrt((t.clientX - W / 2) * (t.clientX - W / 2) + (t.clientY - H / 2) * (t.clientY - H / 2));
      var ia = Wd < u ? 1 : Wd < J ? (J - Wd) / (J - u) : 0;
      if (ia && touchPrimed) {
        if (va && Math.abs(Math.acos(Math.max(-1, Math.min(1, (G * ta + Hd * ua) / (va * I))))) > Math.PI / 2) K *= -1;
        var boost = Math.min(I, wa) * B * ia;
        if (boost > Math.abs(c.angle)) {
          c.angle = K * boost;
          A_ = K * G; z = K * Hd;
          tw = { from: c.angle, to: K * X, t0: Date.now(), dur: ja };
        }
        ta = G; ua = Hd; va = I;
      }
      touchPrimed = true;
      touchX = t.clientX; touchY = t.clientY; sa = fa;
    }
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', onTouchStart, { passive: true });
      document.addEventListener('touchmove', onTouchMove, { passive: true });
    }

    resize();
    frame();

    this.morphTo = function () {};
    this.resize = resize;
    this.destroy = function () {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMove);
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    };
    Object.defineProperties(this, {
      blobSize: { get: function () { return targetScale * 250; }, set: function (val) { targetScale = clampNum((val || 250) / 250, 0.5, 1.6, 999); }, configurable: true },
      blobDistance: { get: function () { return S; }, set: function (val) { S = clampNum(val, 1000, 0, INF); aa = S / v; }, configurable: true },
      perspectiveDistortion: { get: function () { return v; }, set: function (val) { v = clampNum(val, 1, 0.001, INF); aa = S / v; $ = 1000 / v; }, configurable: true },
      dotSize: { get: function () { return da; }, set: function (val) { da = clampNum(val, 1.5, 0.3, 6); }, configurable: true },
      dotColor: { get: function () { return ba; }, set: function (val) { ba = val || 'black'; }, configurable: true }
    });
  }

  Crown.instances = {};
  window.BlobAnimation = Crown;
})();
