import math, os, random
from PIL import Image, ImageDraw, ImageFilter

ROOT = "/home/user/seo-suite-site"
OUT  = os.path.join(ROOT, "img", "wallpapers")
os.makedirs(OUT, exist_ok=True)

SIZES = {
    "ipad-pro-13":  (2064, 2752),
    "ipad-pro-12-9":(2048, 2732),
    "ipad-pro-11":  (1668, 2388),
    "ipad-air-11":  (1640, 2360),
    "ipad-10-2":    (1620, 2160),
    "ipad-mini":    (1488, 2266),
}

THEMES = {
    # bg outer, bg inner (center glow), logo file, accent
    "dark":  ((14, 14, 14), (46, 46, 46), "logo_white.png", (255, 255, 255)),
    "light": ((232, 232, 232), (255, 255, 255), "logo.png",  (28, 28, 28)),
}

def radial_bg(w, h, outer, inner):
    """Soft radial glow rendered small then upscaled (fast + smooth)."""
    sw, sh = 96, int(96 * h / w)
    g = Image.new("RGB", (sw, sh))
    px = g.load()
    cx, cy = sw / 2, sh * 0.42
    maxd = math.hypot(max(cx, sw - cx), max(cy, sh - cy))
    for y in range(sh):
        for x in range(sw):
            t = min(1.0, math.hypot(x - cx, y - cy) / maxd)
            t = t ** 1.35
            px[x, y] = tuple(int(inner[i] + (outer[i] - inner[i]) * t) for i in range(3))
    return g.resize((w, h), Image.LANCZOS)

def add_grain(img, amount=5):
    w, h = img.size
    noise = Image.effect_noise((w // 4, h // 4), 24).resize((w, h), Image.BILINEAR)
    return Image.blend(img, Image.merge("RGB", (noise, noise, noise)), amount / 100)

def rings(img, accent, opacity):
    """Concentric hairline rings echoing the circular logo."""
    w, h = img.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = w / 2, h * 0.42
    base = min(w, h) * 0.20
    for i in range(1, 7):
        r = base * (1 + i * 0.42)
        d.ellipse([cx - r, cy - r, cx + r, cy + r],
                  outline=accent + (int(opacity * (1 - i / 8)),),
                  width=max(1, w // 900))
    return Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")

def build(w, h, theme):
    outer, inner, logo_name, accent = THEMES[theme]
    img = radial_bg(w, h, outer, inner)
    img = rings(img, accent, 46)
    img = add_grain(img, 4)

    logo = Image.open(os.path.join(ROOT, "img", logo_name)).convert("RGBA")
    size = int(min(w, h) * 0.34)
    logo = logo.resize((size, size), Image.LANCZOS)

    # soft drop shadow so the badge sits on the glow
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    shadow = Image.new("RGBA", logo.size, (0, 0, 0, 90))
    shadow.putalpha(logo.split()[3].point(lambda a: int(a * 0.45)))
    lx, ly = int(w / 2 - size / 2), int(h * 0.42 - size / 2)
    sh.paste(shadow, (lx, ly + int(size * 0.035)), shadow)
    sh = sh.filter(ImageFilter.GaussianBlur(size * 0.05))
    img = Image.alpha_composite(img.convert("RGBA"), sh)
    img.paste(logo, (lx, ly), logo)
    return img.convert("RGB")

made = []
for name, (w, h) in SIZES.items():
    for theme in THEMES:
        for orient in ("portrait", "landscape"):
            ww, hh = (w, h) if orient == "portrait" else (h, w)
            path = os.path.join(OUT, f"seosuite-wallpaper-{name}-{theme}-{orient}.png")
            build(ww, hh, theme).save(path, optimize=True)
            made.append((path, ww, hh))

for p, w, h in made:
    print(f"{w}x{h}  {os.path.relpath(p, ROOT)}  {os.path.getsize(p)//1024}KB")
