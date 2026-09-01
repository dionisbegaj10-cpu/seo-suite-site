# SEOsuite iPad wallpapers

Stills of the **homepage hero orb** — the rotating dot sphere ("blob") that
sits behind the hero on seosuite.studio. `generate.py` re-implements the
geometry, wave shape and perspective projection of `js/blob-min.js` using
the `blob_settings` from `js/main.js`, so the sphere is the real thing at
its resting shape, not a lookalike.

Files are named `seosuite-hero-wallpaper-<device>-<theme>-<orientation>.png`:

| Device key | Portrait resolution |
| --- | --- |
| `ipad-pro-13` | 2064 x 2752 (13" iPad Pro M4) |
| `ipad-pro-12-9` | 2048 x 2732 (12.9" iPad Pro) |
| `ipad-pro-11` | 1668 x 2388 (11" iPad Pro) |
| `ipad-air-11` | 1640 x 2360 (iPad Air 10.9"/11") |
| `ipad-10-2` | 1620 x 2160 (iPad 10.2") |
| `ipad-mini` | 1488 x 2266 (iPad mini 6) |

Themes: `dark` (white dots on `#0e0e0e`) and `light` (grey dots on white,
as the site renders it). Orientations: `portrait` and `landscape`.

The orb sits at 42% of the height in portrait so the lock-screen clock and
widgets stay clear of it, and is centred in landscape.

To set one: AirDrop or download the PNG, open it in Photos, then
Share → Use as Wallpaper → Set. Turn **off** "Perspective Zoom" so the
sphere is not cropped.

## Regenerating

    pip install pillow
    python3 img/wallpapers/generate.py

Everything worth changing is at the top of `generate.py` (sizes, colours,
wave shape) or in `render()`'s arguments: `scale` (orb size), `yaw` /
`pitch` (viewing angle), `phase` (where in the wave animation the frame is
taken) and `cy_frac` (vertical position).
