#!/usr/bin/env python3
"""
Generate reusable brand assets from the owner-provided PNG poster logo.

Why this exists:
- The supplied PNG is a full poster/sign composition, not a ready-made web logo set.
- We need multiple derivatives for different jobs:
  * primary transparent logo for hero/footer
  * compact circular mark for nav/favicon/app icons
  * favicon sizes + .ico bundle

Approach:
- Flood-fill only the edge-connected near-white background to transparent.
  This preserves interior whites (e.g. BARBER SHOP letters) because they're not
  connected to the image border. Nice. Primitive. Effective.
- Crop the resulting transparent image to sane sub-compositions.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "CandMBarber-Logo.png"
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)


def is_bg(px: tuple[int, int, int, int]) -> bool:
    r, g, b, a = px
    if a == 0:
        return True
    # Warm off-white textured wall background.
    # Be generous: only edge-connected pixels are removed, so interior whites
    # in the wordmark remain safe.
    return min(r, g, b) >= 220 and max(r, g, b) >= 236 and (max(r, g, b) - min(r, g, b)) <= 34


def knock_out_edge_background(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    seen = [[False] * h for _ in range(w)]
    q: deque[tuple[int, int]] = deque()

    # Seed with all border pixels that look like the paper/wall background.
    border_points = []
    for x in range(w):
        border_points.append((x, 0))
        border_points.append((x, h - 1))
    for y in range(h):
        border_points.append((0, y))
        border_points.append((w - 1, y))

    for x, y in border_points:
        if not seen[x][y] and is_bg(px[x, y]):
            seen[x][y] = True
            q.append((x, y))

    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        for nx, ny in (
            (x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1),
            (x - 1, y - 1), (x + 1, y - 1), (x - 1, y + 1), (x + 1, y + 1),
        ):
            if 0 <= nx < w and 0 <= ny < h and not seen[nx][ny] and is_bg(px[nx, ny]):
                seen[nx][ny] = True
                q.append((nx, ny))
    return img


def crop_bbox(img: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    part = img.crop(box)
    bbox = part.getbbox()
    return part.crop(bbox) if bbox else part


def knock_out_edge_non_dark(img: Image.Image) -> Image.Image:
    """Remove edge-connected pixels that are NOT part of the black badge.

    Used for the circular C&M mark crop:
    - poster background at top/sides is edge-connected -> gone
    - red oval peeking in at the bottom is edge-connected -> gone
    - white C&M letters are enclosed by the black medallion -> preserved
    """
    img = img.convert('RGBA')
    px = img.load()
    w, h = img.size
    seen = [[False] * h for _ in range(w)]
    q: deque[tuple[int, int]] = deque()

    def is_non_dark(p):
        r, g, b, a = p
        return a != 0 and max(r, g, b) > 70

    border_points = []
    for x in range(w):
        border_points.append((x, 0))
        border_points.append((x, h - 1))
    for y in range(h):
        border_points.append((0, y))
        border_points.append((w - 1, y))

    for x, y in border_points:
        if not seen[x][y] and is_non_dark(px[x, y]):
            seen[x][y] = True
            q.append((x, y))

    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        for nx, ny in (
            (x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1),
            (x - 1, y - 1), (x + 1, y - 1), (x - 1, y + 1), (x + 1, y + 1),
        ):
            if 0 <= nx < w and 0 <= ny < h and not seen[nx][ny] and is_non_dark(px[nx, ny]):
                seen[nx][ny] = True
                q.append((nx, ny))
    return img


def remove_bottom_non_dark(img: Image.Image, start_ratio: float = 0.82) -> Image.Image:
    img = img.convert('RGBA')
    px = img.load()
    w, h = img.size
    start_y = int(h * start_ratio)
    for y in range(start_y, h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a and max(r, g, b) > 70:
                px[x, y] = (r, g, b, 0)
    return img


def normalize_mark_palette(img: Image.Image) -> Image.Image:
    """For tiny icons, we want a brutally clean black/white badge.

    Convert any opaque non-white color (including the stubborn red sliver)
    to black, and convert bright pixels to white. Transparency stays put.
    """
    img = img.convert('RGBA')
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if not a:
                continue
            if min(r, g, b) >= 185:
                px[x, y] = (255, 255, 255, a)
            else:
                px[x, y] = (0, 0, 0, a)
    return img


def remove_bottom_right_non_dark(img: Image.Image, start_x_ratio: float = 0.72, start_y_ratio: float = 0.80) -> Image.Image:
    """Kill leftover poster-arrow junk in the primary logo crop.

    The source poster has a blue/red arrow that peeks into the lower-right of the
    cropped sign mark. We only remove NON-dark pixels in the bottom-right corner,
    which preserves the black mustache while evicting the colored shard.
    """
    img = img.convert('RGBA')
    px = img.load()
    w, h = img.size
    start_x = int(w * start_x_ratio)
    start_y = int(h * start_y_ratio)
    for y in range(start_y, h):
        for x in range(start_x, w):
            r, g, b, a = px[x, y]
            if a and max(r, g, b) > 70:
                px[x, y] = (r, g, b, 0)
    return img


def patch_primary_logo_corner(img: Image.Image) -> Image.Image:
    """Remove the final tiny poster-arrow artifact at the lower-right edge.

    Measured directly from the generated 2056x1532 primary asset. This is a
    tiny blue/red shard that sits below the mustache and should not appear in
    the cleaned logo crop.
    """
    img = img.convert('RGBA')
    px = img.load()
    # Exact local cleanup zone for the lingering shard.
    # Paint it black because this region visually belongs to the mustache.
    for y in range(1416, 1526):
        for x in range(1348, 1480):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = (0, 0, 0, a)
    return img


def pad_square(img: Image.Image, size: int, bg=(0, 0, 0, 0)) -> Image.Image:
    out = Image.new("RGBA", (size, size), bg)
    iw, ih = img.size
    scale = min((size * 0.82) / iw, (size * 0.82) / ih)
    resized = img.resize((max(1, round(iw * scale)), max(1, round(ih * scale))), Image.LANCZOS)
    x = (size - resized.width) // 2
    y = (size - resized.height) // 2
    out.alpha_composite(resized, (x, y))
    return out


def main() -> None:
    raw = Image.open(SRC).convert("RGBA")

    transparent = knock_out_edge_background(raw)

    # Primary logo crop: keep the strong badge/sign composition, ditch the arrow.
    # Box tuned from the supplied 2096x2048 source.
    primary = crop_bbox(transparent, (20, 40, 2076, 1588))
    primary = remove_bottom_right_non_dark(primary, 0.72, 0.80)
    primary = patch_primary_logo_corner(primary)
    primary.save(ASSETS / "logo-primary.png")

    # Compact brand mark: the circular C&M medallion. Best for nav/favicon.
    # Measured from the source image by locating the upper dark circular badge.
    # Exact measured bbox of the dark circular badge in the source image.
    mark_box = (828, 57, 1256, 485)
    mark = raw.crop(mark_box).convert("RGBA")
    mark = knock_out_edge_non_dark(mark)
    mark = remove_bottom_non_dark(mark, 0.80)
    mark = normalize_mark_palette(mark)
    mark = crop_bbox(mark, (0, 0, mark.width, mark.height))
    mark.save(ASSETS / "logo-mark.png")

    # App / favicon assets.
    apple = pad_square(mark, 180)
    apple.save(ROOT / "apple-touch-icon.png")
    pad_square(mark, 512).save(ASSETS / "logo-mark-512.png")
    pad_square(mark, 192).save(ASSETS / "logo-mark-192.png")
    pad_square(mark, 32).save(ROOT / "favicon-32x32.png")
    pad_square(mark, 16).save(ROOT / "favicon-16x16.png")
    ico_img = pad_square(mark, 64)
    ico_img.save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    print("✓ Generated brand assets:")
    for p in [
        ASSETS / "logo-primary.png",
        ASSETS / "logo-mark.png",
        ASSETS / "logo-mark-512.png",
        ROOT / "apple-touch-icon.png",
        ROOT / "favicon-32x32.png",
        ROOT / "favicon-16x16.png",
        ROOT / "favicon.ico",
    ]:
        print(" -", p.relative_to(ROOT))


if __name__ == "__main__":
    main()
