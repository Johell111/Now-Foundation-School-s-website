"""Archive supplied originals and optimise approved enhanced photographs for the site."""
from pathlib import Path
from shutil import copy2
from PIL import Image, ImageOps

ROOT = Path(__file__).parent
SOURCE = Path(r'C:\Users\PC\Downloads\WhatsApp Unknown 2026-09-30 at 5.32.18 PM')
GENERATED = Path(r'C:\Users\PC\.codex\generated_images\01a0f31f-b7d6-7411-95d1-68d891d81bb7')
BACKUP = ROOT / 'media-originals'
MASTERS = BACKUP / 'enhanced-masters'
MASTERS.mkdir(parents=True, exist_ok=True)

for original in SOURCE.glob('*.jpeg'):
    destination = BACKUP / original.name
    if not destination.exists():
        copy2(original, destination)

# Descriptive name, supplied photograph, approved AI edit output, destination category.
PHOTOS = [
    ('school-entrance', 'WhatsApp Image 2026-09-30 at 4.46.57 PM.jpeg', '2d06d485-ffa1-481e-9ac3-b2de40a8aa8f', 'facilities'),
    ('pupils-making-paper-crafts', 'WhatsApp Image 2026-09-30 at 4.48.13 PM.jpeg', '6b2fd990-2488-4c77-aa3f-8315c6f3b609', 'classrooms'),
    ('prize-giving-group', 'WhatsApp Image 2026-09-30 at 4.47.00 PM.jpeg', '5e6a7f77-49bd-4e96-89ed-aae50737a652', 'events'),
    ('prize-giving-activities', 'WhatsApp Image 2026-09-30 at 4.48.04 PM.jpeg', '5fbed7a6-7b2d-4763-8c49-5183a50ebfb7', 'events'),
    ('children-in-school-uniform', 'WhatsApp Image 2026-09-30 at 4.48.05 PM (2).jpeg', '20daa240-316b-4e37-8fc2-b521c516473d', 'students'),
    ('pupil-making-paper-craft', 'WhatsApp Image 2026-09-30 at 4.48.13 PM (1).jpeg', 'e98f015c-0331-4677-af8c-7ca9b3536bc3', 'classrooms'),
    ('pupils-playing-board-game', 'WhatsApp Image 2026-09-30 at 4.48.12 PM (1).jpeg', '0d310076-6307-4457-a088-afcc2f07db01', 'students'),
    ('cultural-day-portrait', 'WhatsApp Image 2026-09-30 at 4.48.05 PM (1).jpeg', '63f56012-b075-4b1f-8962-85ba992e9d8a', 'events'),
    ('prize-giving-certificate', 'WhatsApp Image 2026-09-30 at 4.47.01 PM (1).jpeg', '72e1ecfc-257b-48b8-ac97-f1eecd16faae', 'events'),
    ('cultural-day-costume', 'WhatsApp Image 2026-09-30 at 4.48.05 PM.jpeg', '8ef32618-8361-424d-99c9-072918104df8', 'events'),
]

for name, original_name, generated_id, category in PHOTOS:
    generated = GENERATED / f'exec-{generated_id}.png'
    master = MASTERS / f'{name}.png'
    if not master.exists():
        copy2(generated, master)
    with Image.open(BACKUP / original_name) as original:
        original_long_edge = max(original.size)
    with Image.open(master) as enhanced:
        image = ImageOps.exif_transpose(enhanced).convert('RGB')
        if max(image.size) > original_long_edge:
            image.thumbnail((original_long_edge, original_long_edge), Image.Resampling.LANCZOS)
        target = ROOT / 'public/media/images' / category / f'{name}.webp'
        target.parent.mkdir(parents=True, exist_ok=True)
        image.save(target, 'WEBP', quality=82, method=6)
        for width in (640, 960):
            if width < image.width:
                small = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
                small.save(target.with_name(f'{name}-{width}.webp'), 'WEBP', quality=80, method=6)
        print(name, image.size, target.stat().st_size)
