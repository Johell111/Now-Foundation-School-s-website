"""Publish reviewed wall-only edits while retaining previous photos and originals."""
from pathlib import Path
from shutil import copy2
from PIL import Image

ROOT = Path(__file__).parent
GENERATED = Path(r'C:\Users\PC\.codex\generated_images\01a0f31f-b7d6-7411-95d1-68d891d81bb7')
MASTERS = ROOT / 'media-originals/retouched-masters'
BEFORE = ROOT / 'media-originals/before-wall-retouch'
MASTERS.mkdir(parents=True, exist_ok=True)
BEFORE.mkdir(parents=True, exist_ok=True)
for name, output_id, size in [
    ('pupils-playing-board-game', '6ea690bb-374a-495f-bcd3-07f659afbd80', (1020, 768)),
    ('children-in-school-uniform', '660b1d4d-23ef-4b69-813b-86715d7c5743', (960, 1280)),
]:
    target = ROOT / 'public/media/images/students' / f'{name}.webp'
    if not (BEFORE / target.name).exists():
        copy2(target, BEFORE / target.name)
    master = MASTERS / f'{name}.png'
    copy2(GENERATED / f'exec-{output_id}.png', master)
    with Image.open(master) as source:
        image = source.convert('RGB').resize(size, Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=88, method=6)
        for width in (640, 960):
            if width < image.width:
                small = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
                small.save(target.with_name(f'{name}-{width}.webp'), 'WEBP', quality=85, method=6)
    print(name, size, target.stat().st_size)
