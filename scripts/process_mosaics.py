#!/usr/bin/env python3
import os
from PIL import Image

def process_mosaics():
    """
    Slices the mosaic tiles sheet in public/tales/mosaics/
    and extracts individual transparent tile PNGs for the Mahjong Zen game engine.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    mosaics_dir = os.path.join(base_dir, 'public', 'tales', 'mosaics')
    out_dir = os.path.join(mosaics_dir, 'tiles')
    os.makedirs(out_dir, exist_ok=True)

    img_path = os.path.join(mosaics_dir, '42144ce59f1c2565aad236b94978ee3c.jpg')
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return

    img = Image.open(img_path).convert('RGB')

    # Grid active bounds in 42144ce59f1c2565aad236b94978ee3c.jpg
    min_x, max_x = 177, 1203
    min_y, max_y = 126, 1215
    cols, rows = 4, 4

    cell_w = (max_x - min_x) / cols
    cell_h = (max_y - min_y) / rows

    tile_names = [
        'fa', 'xi', 'six', 'two',
        'circles', 'eight_dots', 'one_circle', 'bamboo_green_3',
        'bamboo_red_3', 'bamboo_green_4', 'flower', 'leaf',
        'extra_1', 'extra_2', 'extra_3', 'extra_4'
    ]

    for r in range(rows):
        for c in range(cols):
            idx = r * cols + c
            tname = tile_names[idx]

            x1 = int(min_x + c * cell_w)
            y1 = int(min_y + r * cell_h)
            x2 = int(min_x + (c + 1) * cell_w)
            y2 = int(min_y + (r + 1) * cell_h)

            crop = img.crop((x1, y1, x2, y2))
            crop_rgba = crop.convert('RGBA')
            datas = crop_rgba.getdata()
            bg_sample = crop.getpixel((5, 5))

            new_data = []
            for p in datas:
                dist = abs(p[0]-bg_sample[0]) + abs(p[1]-bg_sample[1]) + abs(p[2]-bg_sample[2])
                is_bg = dist < 45 or (p[0] > 235 and p[1] > 230 and p[2] > 220)
                if is_bg:
                    new_data.append((0, 0, 0, 0))  # Transparent
                else:
                    new_data.append(p)

            crop_rgba.putdata(new_data)
            out_file = os.path.join(out_dir, f'{tname}.png')
            crop_rgba.save(out_file)
            print(f"Extracted tile: {out_file}")

    print(f"\nAll mosaic tiles successfully processed in: {out_dir}")

if __name__ == '__main__':
    process_mosaics()
