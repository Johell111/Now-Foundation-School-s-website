"""Prepare authentic school footage for review and web delivery."""
from pathlib import Path
from shutil import copy2
import subprocess
from imageio_ffmpeg import get_ffmpeg_exe
from PIL import Image

ROOT = Path(__file__).parent
SOURCE = Path(r'C:\Users\PC\Downloads\WhatsApp Unknown 2026-09-30 at 5.32.18 PM')
BACKUP = ROOT / 'media-originals' / 'videos'
STAGED = ROOT / 'media-originals' / 'processed-videos'
THUMBS = ROOT / 'media-originals' / 'video-thumbnails'
for directory in (BACKUP, STAGED, THUMBS):
    directory.mkdir(parents=True, exist_ok=True)

FFMPEG = get_ffmpeg_exe()
# Source, descriptive output, opening point, length, representative thumbnail moment.
VIDEOS = [
    ('WhatsApp Video 2026-09-30 at 4.46.58 PM.mp4', 'prize-giving-stage', 0.2, 4.0, 1.5),
    ('WhatsApp Video 2026-09-30 at 4.47.00 PM.mp4', 'prize-giving-performance', 0.2, 3.8, 1.5),
    ('WhatsApp Video 2026-09-30 at 4.48.03 PM.mp4', 'pupils-writing-at-prize-giving', 0.0, 50.0, 15.0),
    ('WhatsApp Video 2026-09-30 at 4.48.04 PM (1).mp4', 'classroom-presentation', 0.0, 60.0, 20.0),
    ('WhatsApp Video 2026-09-30 at 4.48.04 PM (2).mp4', 'practical-learning', 0.0, 65.0, 35.0),
    ('WhatsApp Video 2026-09-30 at 4.48.04 PM (3).mp4', 'cultural-day-presentation', 0.0, 60.0, 20.0),
    ('WhatsApp Video 2026-09-30 at 4.48.04 PM.mp4', 'young-pupil-at-school', 0.0, 16.0, 8.0),
    ('WhatsApp Video 2026-09-30 at 4.48.11 PM.mp4', 'pupils-playing-board-game', 0.0, 45.0, 5.0),
]

for filename, name, start, length, frame_time in VIDEOS:
    original = SOURCE / filename
    archived = BACKUP / filename
    if not archived.exists():
        copy2(original, archived)
    output = STAGED / f'{name}.mp4'
    command = [
        FFMPEG, '-y', '-hide_banner', '-loglevel', 'error', '-ss', str(start), '-i', str(archived),
        '-t', str(length), '-vf', 'hqdn3d=1.2:1.2:5:5,eq=brightness=0.012:contrast=1.025:saturation=1.025',
        '-map', '0:v:0', '-map', '0:a:0?', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', str(output)
    ]
    subprocess.run(command, check=True)
    poster = THUMBS / f'{name}.webp'
    frame = subprocess.run([
        FFMPEG, '-hide_banner', '-loglevel', 'error', '-ss', str(frame_time), '-i', str(archived),
        '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-'
    ], capture_output=True, check=True)
    from io import BytesIO
    with Image.open(BytesIO(frame.stdout)) as image:
        image.convert('RGB').save(poster, 'WEBP', quality=80, method=6)
    print(name, output.stat().st_size, poster.stat().st_size, flush=True)
