"""Remove cream/paper background from SD logo.

Strategy:
1. Flood-fill from edges using moderate color tolerance (kills the white paper).
2. Second pass: any remaining pixel that is *low chroma* (R/G/B are all close)
   AND bright is treated as paper/gray-curl background and made transparent.
   Gold stays because R is meaningfully higher than B (high chroma).
"""
import sys
from PIL import Image
from collections import deque


def remove_bg(in_path, out_path, flood_tol=42, chroma_thresh=22, brightness_min=150):
    img = Image.open(in_path).convert("RGBA")
    w, h = img.size
    px = img.load()

    # ---- pass 1: flood fill from edge seeds ----
    seeds = []
    step_x = max(1, w // 24)
    step_y = max(1, h // 24)
    for x in range(0, w, step_x):
        seeds.append((x, 0))
        seeds.append((x, h - 1))
    for y in range(0, h, step_y):
        seeds.append((0, y))
        seeds.append((w - 1, y))

    visited = bytearray(w * h)
    queue = deque()
    seed_colors = []
    for x, y in seeds:
        r, g, b, _ = px[x, y]
        seed_colors.append((r, g, b))
        i = y * w + x
        if not visited[i]:
            visited[i] = 1
            queue.append((x, y))

    def near_any_seed(c):
        for s in seed_colors:
            if abs(c[0] - s[0]) <= flood_tol and abs(c[1] - s[1]) <= flood_tol and abs(c[2] - s[2]) <= flood_tol:
                return True
        return False

    while queue:
        x, y = queue.popleft()
        r, g, b, _ = px[x, y]
        if not near_any_seed((r, g, b)):
            continue
        px[x, y] = (0, 0, 0, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                ni = ny * w + nx
                if not visited[ni]:
                    visited[ni] = 1
                    queue.append((nx, ny))

    # ---- pass 2: chroma + brightness gate (kills paper/curl gray inside the bbox) ----
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            mx, mn = max(r, g, b), min(r, g, b)
            chroma = mx - mn
            brightness = (r + g + b) // 3
            if chroma < chroma_thresh and brightness > brightness_min:
                px[x, y] = (0, 0, 0, 0)
            elif chroma < chroma_thresh + 10 and brightness > brightness_min + 20:
                # soften halo: partial transparency
                px[x, y] = (r, g, b, max(0, a - 180))

    # ---- pass 3: clear decorative curl on the far right of the source mockup ----
    cutoff_x = int(w * 0.66)
    for y in range(h):
        for x in range(cutoff_x, w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            px[x, y] = (0, 0, 0, 0)

    # ---- pass 4: crop to non-transparent bounding box with small padding ----
    bbox = img.getbbox()
    if bbox:
        pad = 40
        x0 = max(0, bbox[0] - pad)
        y0 = max(0, bbox[1] - pad)
        x1 = min(w, bbox[2] + pad)
        y1 = min(h, bbox[3] + pad)
        img = img.crop((x0, y0, x1, y1))

    img.save(out_path, "PNG", optimize=True)
    print(f"Saved {out_path} {img.size}")


if __name__ == "__main__":
    src = sys.argv[1]
    dst = sys.argv[2]
    flood_tol = int(sys.argv[3]) if len(sys.argv) > 3 else 42
    chroma = int(sys.argv[4]) if len(sys.argv) > 4 else 22
    bright = int(sys.argv[5]) if len(sys.argv) > 5 else 150
    remove_bg(src, dst, flood_tol, chroma, bright)
