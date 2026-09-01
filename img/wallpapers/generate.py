"""
Generate SEOsuite iPad wallpapers from the homepage hero.

Re-implements the dot-sphere ("blob") that renders behind the hero on
seosuite.studio — same geometry, same wave shape and same projection as
js/blob-min.js driven by the blob_settings in js/main.js — and renders a
still frame of it at iPad resolutions.

Requires Pillow:  pip install pillow
"""

import math
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.dirname(os.path.abspath(__file__))

# --- Hero settings, mirrored from js/main.js -------------------------------
BLOB_SIZE = 250                 # Q
BLOB_DISTANCE = 1000            # S
PERSPECTIVE_DISTORTION = 1      # v  ->  camera = S/v, focal = 1000/v
DETALISATION = 60               # rings, at the hero's ~1440px canvas width
DOT_SIZE = 1.5                  # css px, same reference width
DOT_COLOR_LIGHT = (170, 170, 170)   # the hero uses #d0d0d0; nudged darker so the
                                    # dots survive iPadOS wallpaper dimming
DOT_COLOR_DARK = (255, 255, 255)
BG_LIGHT = (255, 255, 255)
BG_DARK = (14, 14, 14)              # #0e0e0e, the site's dark surface

# shapes[0] in js/main.js — the shape the hero morphs to and rests on.
WAVES = (
    (76.923, 0.879, 0.0),   # amp1, freq1, phase1
    (60.0,   0.165, 0.0),
    (50.0,   0.0,   0.0),
)

REF_WIDTH = 1440.0   # desktop hero canvas width the settings above are tuned for
SS = 2               # supersampling factor

SIZES = {
    "ipad-pro-13":   (2064, 2752),
    "ipad-pro-12-9": (2048, 2732),
    "ipad-pro-11":   (1668, 2388),
    "ipad-air-11":   (1640, 2360),
    "ipad-10-2":     (1620, 2160),
    "ipad-mini":     (1488, 2266),
}


def rotation(yaw, pitch):
    cy, sy = math.cos(yaw), math.sin(yaw)
    cp, sp = math.cos(pitch), math.sin(pitch)
    # Y rotation then X rotation
    return (
        (cy,       0.0, sy),
        (sy * sp,  cp, -cy * sp),
        (-sy * cp, sp,  cy * cp),
    )


def points(detalisation, phase_shift):
    """The blob's vertices, exactly as js/blob-min.js walks them."""
    (a1, f1, p1), (a2, f2, p2), (a3, f3, p3) = WAVES
    p1 += phase_shift
    p2 += phase_shift * 0.62      # WAVE_2_MOTION_SPEED / WAVE_1_MOTION_SPEED
    n = detalisation
    for l in range(n):
        e = l / n * math.pi - math.pi / 2          # latitude
        h = round(n * math.cos(e) * 2)
        for g in range(h):
            a = g / h * 2 * math.pi - math.pi      # longitude
            yield (
                (BLOB_SIZE + a1 * math.sin(f1 * e + p1)) * math.cos(e) * math.cos(a),
                (BLOB_SIZE + a2 * math.sin(f2 * a + p2)) * math.cos(e) * math.sin(a),
                (BLOB_SIZE + a3 * math.sin(f3 * e + p3)) * math.sin(e),
            )


def render(w, h, bg, dot, scale=1.9, yaw=0.55, pitch=-0.28, phase=0.9, cy_frac=0.42):
    """One still frame of the hero blob, centred at cy_frac of the height."""
    W, H = w * SS, h * SS
    img = Image.new("RGB", (W, H), bg)
    px = img.load()

    zoom = W / REF_WIDTH * scale                    # match the hero's on-screen size
    camera = BLOB_DISTANCE / PERSPECTIVE_DISTORTION
    focal = 1000.0 / PERSPECTIVE_DISTORTION
    # Fixed dot count: scaling up enlarges the same dot pattern (as the hero
    # does when it zooms) rather than packing in dots until they merge solid.
    detal = int(round(DETALISATION * 1.5))
    dot_px = DOT_SIZE * zoom
    m = rotation(yaw, pitch)
    cx, cy = W / 2, H * cy_frac

    for x, y, z in points(detal, phase):
        rx = m[0][0] * x + m[0][1] * y + m[0][2] * z
        ry = m[1][0] * x + m[1][1] * y + m[1][2] * z
        rz = m[2][0] * x + m[2][1] * y + m[2][2] * z

        s = focal / (camera + rz)                   # perspective, as in blob-min.js
        if s <= 0:
            continue
        alpha = s * s if s < 1 else 1.0             # far dots fade out
        size = dot_px * s
        if size <= 0:
            continue

        sx, sy = cx + rx * s * zoom, cy + ry * s * zoom
        # blob-min.js draws each dot as a filled square from (sx, sy)
        x0, y0 = int(sx), int(sy)
        x1, y1 = int(sx + size) + 1, int(sy + size) + 1
        if x1 < 0 or y1 < 0 or x0 >= W or y0 >= H:
            continue
        for yy in range(max(0, y0), min(H, y1)):
            for xx in range(max(0, x0), min(W, x1)):
                # coverage of this pixel by the dot square, for soft edges
                cov = (min(sx + size, xx + 1) - max(sx, xx)) * \
                      (min(sy + size, yy + 1) - max(sy, yy))
                if cov <= 0:
                    continue
                a = alpha * min(1.0, cov)
                old = px[xx, yy]
                px[xx, yy] = (
                    int(old[0] + (dot[0] - old[0]) * a),
                    int(old[1] + (dot[1] - old[1]) * a),
                    int(old[2] + (dot[2] - old[2]) * a),
                )

    return img.resize((w, h), Image.LANCZOS)


def main():
    for name, (w, h) in SIZES.items():
        for theme, bg, dot in (("light", BG_LIGHT, DOT_COLOR_LIGHT),
                               ("dark", BG_DARK, DOT_COLOR_DARK)):
            for orient in ("portrait", "landscape"):
                ww, hh = (w, h) if orient == "portrait" else (h, w)
                # landscape has room to spare; centre the blob a little higher
                cy = 0.42 if orient == "portrait" else 0.5
                out = os.path.join(
                    OUT, f"seosuite-hero-wallpaper-{name}-{theme}-{orient}.png")
                render(ww, hh, bg, dot, cy_frac=cy).save(out, optimize=True)
                print(f"{ww}x{hh}  {os.path.basename(out)}  "
                      f"{os.path.getsize(out) // 1024}KB")


if __name__ == "__main__":
    main()
