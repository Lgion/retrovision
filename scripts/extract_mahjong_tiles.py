#!/usr/bin/env python3
"""
Extracts and generates high-resolution, anti-aliased individual Mahjong tile PNGs
for the 3 new tilesets:
1. Onyx & Gold (Marbre Noir & Or Impérial) - Source: Gemini Image 1
2. Mythic Cloisonné (Créatures Célestes Émail & Or) - Source: Gemini Image 2
3. Botanical Folk-Art (Art Graphique & Botanique) - Source: Mosaics Image 3
And fixes individual tiles for luxury_marble_2 to eliminate sprite-sheet pixelation.
"""

import os
from PIL import Image, ImageDraw, ImageFilter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public', 'tales')

def make_rounded_mask(size, radius):
    w, h = size
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rectangle([(radius, 0), (w - radius, h)], fill=255)
    draw.rectangle([(0, radius), (w, h - radius)], fill=255)
    draw.pieslice([(0, 0), (2*radius, 2*radius)], 180, 270, fill=255)
    draw.pieslice([(w-2*radius, 0), (w, 2*radius)], 270, 360, fill=255)
    draw.pieslice([(0, h-2*radius), (2*radius, h)], 90, 180, fill=255)
    draw.pieslice([(w-2*radius, h-2*radius), (w, h)], 0, 90, fill=255)
    return mask

def process_onyx_gold():
    """
    Extracts 12 tiles from Gemini_Generated_Image_966x9k966x9k966x.png
    """
    src_path = os.path.join(PUBLIC_DIR, 'gemini', 'Gemini_Generated_Image_966x9k966x9k966x.png')
    out_dir = os.path.join(PUBLIC_DIR, 'onyx_gold')
    os.makedirs(out_dir, exist_ok=True)
    img = Image.open(src_path).convert('RGB')

    mapping = {
        'fa': (0, 6),             # Green Dragon 發
        'flower': (0, 5),         # Red Dragon 中
        'leaf': (1, 4),           # White Dragon Frame
        'xi': (1, 6),             # East Wind 東
        'two': (0, 3),            # 2 Wan 二万
        'eight_dots': (0, 4),     # 4 Wan 四万
        'one_circle': (1, 0),     # 1 Dot (Large Circle)
        'circles': (1, 1),        # 3 Dots
        'six': (1, 2),            # 6 Dots
        'bamboo_red_3': (0, 0),   # 1 Bamboo Stalk
        'bamboo_green_3': (0, 1), # 3 Bamboo
        'bamboo_green_4': (0, 2), # 9 Bamboo
    }

    tile_w = 170
    tile_h = 214
    radius = 18
    target_size = (170, 214)

    for name, (row, col) in mapping.items():
        x1 = 48 + col * 192
        y1 = 124 if row == 0 else 416
        x2 = x1 + tile_w
        y2 = y1 + tile_h

        crop = img.crop((x1, y1, x2, y2)).convert('RGBA')
        mask = make_rounded_mask(target_size, radius)
        crop.putalpha(mask)

        # Subtle unsharp mask to ensure razor-sharp engraving at small display scale
        crop_sharp = crop.filter(ImageFilter.UnsharpMask(radius=1.2, percent=130, threshold=2))
        crop_sharp.putalpha(mask)

        # Scale to standard 170x220
        final_tile = crop_sharp.resize((170, 220), Image.LANCZOS)
        out_path = os.path.join(out_dir, f'{name}.png')
        final_tile.save(out_path, 'PNG', optimize=True)
        print(f'[Onyx & Gold] Saved: {name}.png ({final_tile.size})')

def process_mythic_cloisonne():
    """
    Extracts 12 tiles from Gemini_Generated_Image_fj6y3cfj6y3cfj6y.png
    """
    src_path = os.path.join(PUBLIC_DIR, 'gemini', 'Gemini_Generated_Image_fj6y3cfj6y3cfj6y.png')
    out_dir = os.path.join(PUBLIC_DIR, 'mythic_cloisonne')
    os.makedirs(out_dir, exist_ok=True)
    img = Image.open(src_path).convert('RGB')

    mapping = {
        'fa': (0, 0),             # Qilin (Jade Unicorn)
        'xi': (0, 1),             # Fenghuang (Golden Phoenix)
        'six': (0, 2),            # Qinglong (Azure Dragon)
        'two': (0, 3),            # Xuanwu (Tortoise & Serpent)
        'circles': (0, 4),        # Zhuque (Vermilion Firebird)
        'eight_dots': (0, 5),     # Baihu (White Tiger)
        'one_circle': (0, 6),     # Feilong (Winged Dragon)
        'bamboo_green_3': (1, 0), # Hulu (Golden Gourd)
        'bamboo_red_3': (1, 1),   # Pixiu (Guardian Foo Dog)
        'bamboo_green_4': (1, 2), # Baize (Celestial Lion)
        'flower': (1, 3),         # Taotie (Enamel Mask)
        'leaf': (1, 6),           # Yutu (Moon Rabbit & Crescent)
    }

    tile_w = 170
    tile_h = 214
    radius = 18
    target_size = (170, 214)

    for name, (row, col) in mapping.items():
        x1 = 48 + col * 192
        y1 = 124 if row == 0 else 416
        x2 = x1 + tile_w
        y2 = y1 + tile_h

        crop = img.crop((x1, y1, x2, y2)).convert('RGBA')
        mask = make_rounded_mask(target_size, radius)
        crop.putalpha(mask)

        crop_sharp = crop.filter(ImageFilter.UnsharpMask(radius=1.2, percent=130, threshold=2))
        crop_sharp.putalpha(mask)

        final_tile = crop_sharp.resize((170, 220), Image.LANCZOS)
        out_path = os.path.join(out_dir, f'{name}.png')
        final_tile.save(out_path, 'PNG', optimize=True)
        print(f'[Mythic Cloisonne] Saved: {name}.png ({final_tile.size})')

def process_botanical():
    """
    Extracts 12 tiles from images (2).jpeg (Scandinavian Folk Art / Botanical)
    Isolates foreground illustration on transparent canvas with pristine clean background.
    """
    src_path = os.path.join(PUBLIC_DIR, 'mosaics', 'images (2).jpeg')
    out_dir = os.path.join(PUBLIC_DIR, 'botanical')
    os.makedirs(out_dir, exist_ok=True)
    img = Image.open(src_path).convert('RGB')

    cw = 456 / 4.0
    ch = 420 / 4.0

    mapping = {
        'one_circle': (0, 0),     # Sun / Rosette Medallion
        'bamboo_green_3': (0, 1), # Bird perched on bamboo
        'circles': (0, 2),        # 9 Coins / Rings
        'eight_dots': (0, 3),     # 9 Bamboo Stems
        'six': (1, 0),            # Fruit Tree
        'xi': (2, 0),             # Flower Vase
        'bamboo_green_4': (2, 2), # Peony Bloom
        'bamboo_red_3': (2, 3),   # Swallows in bamboo
        'flower': (3, 0),         # Red Dragon 中
        'fa': (3, 1),             # Green Dragon 發
        'leaf': (3, 2),           # White Dragon Geometric Frame
        'two': (3, 3),            # Two Coins / Circles
    }

    target_w, target_h = 170, 220

    for name, (row, col) in mapping.items():
        x0 = int(col * cw)
        y0 = int(row * ch)
        cell = img.crop((x0, y0, x0 + int(cw), y0 + int(ch)))

        # Key out cream/off-white background and any subtle compression noise
        cell_rgba = cell.convert('RGBA')
        datas = cell_rgba.getdata()
        new_data = []
        for p in datas:
            dist = abs(p[0]-248) + abs(p[1]-247) + abs(p[2]-243)
            is_noise = (p[0] > 208 and p[1] > 200 and p[2] > 190 and (max(p[:3]) - min(p[:3]) < 38))
            if dist < 42 or is_noise:
                new_data.append((0, 0, 0, 0))
            else:
                new_data.append(p)
        cell_rgba.putdata(new_data)

        # Remove 7px border to discard corner dots
        inner = cell_rgba.crop((7, 7, cell_rgba.size[0] - 7, cell_rgba.size[1] - 7))
        bbox = inner.getbbox()

        if bbox:
            cropped_symbol = inner.crop(bbox)
        else:
            cropped_symbol = inner

        # Scale symbol to fill ~84% of target dimensions
        max_target_w = int(target_w * 0.84)
        max_target_h = int(target_h * 0.84)
        scale = min(max_target_w / cropped_symbol.width, max_target_h / cropped_symbol.height)
        new_w = max(1, int(cropped_symbol.width * scale))
        new_h = max(1, int(cropped_symbol.height * scale))

        scaled_symbol = cropped_symbol.resize((new_w, new_h), Image.LANCZOS)

        # Center in 170x220 transparent canvas
        canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        px = (target_w - new_w) // 2
        py = (target_h - new_h) // 2
        canvas.paste(scaled_symbol, (px, py), scaled_symbol)

        out_path = os.path.join(out_dir, f'{name}.png')
        canvas.save(out_path, 'PNG', optimize=True)
        print(f'[Botanical] Saved: {name}.png ({canvas.size})')

def fix_luxury_marble_2():
    """
    Ensure luxury_marble_2 has clean individual PNG tiles (614x614 resized cleanly to 170x220)
    so MahjongIcon can load them as individual images rather than a bugged sprite sheet.
    """
    src_dir = os.path.join(PUBLIC_DIR, 'luxury_marble_2')
    if not os.path.exists(src_dir):
        return

    tile_names = [
        'fa', 'xi', 'six', 'two', 'circles', 'eight_dots',
        'one_circle', 'bamboo_green_3', 'bamboo_red_3', 'bamboo_green_4',
        'flower', 'leaf'
    ]

    target_size = (170, 220)
    radius = 18

    for name in tile_names:
        p = os.path.join(src_dir, f'{name}.png')
        if os.path.exists(p):
            im = Image.open(p).convert('RGBA')
            # Fit into 170x220
            # Center crop or fit
            w, h = im.size
            crop_size = min(w, h)
            left = (w - crop_size) // 2
            top = (h - crop_size) // 2
            sq = im.crop((left, top, left + crop_size, top + crop_size))
            resized = sq.resize(target_size, Image.LANCZOS)
            mask = make_rounded_mask(target_size, radius)
            resized.putalpha(mask)
            resized.save(os.path.join(src_dir, f'clean_{name}.png'), 'PNG', optimize=True)
            print(f'[Luxury Marble 2] Cleaned: clean_{name}.png')

if __name__ == '__main__':
    print('Starting Mahjong tiles extraction and processing...')
    process_onyx_gold()
    process_mythic_cloisonne()
    process_botanical()
    fix_luxury_marble_2()
    print('\nAll Mahjong tiles successfully generated!')
