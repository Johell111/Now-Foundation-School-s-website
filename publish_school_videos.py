"""Publish visually cleared school videos with original audio and real-frame posters."""
from pathlib import Path
from shutil import copy2

root = Path(__file__).parent
staged = root / 'media-originals' / 'processed-videos'
posters = root / 'media-originals' / 'video-thumbnails'
destinations = {
    'prize-giving-stage': 'school-events',
    'prize-giving-performance': 'school-events',
    'pupils-writing-at-prize-giving': 'school-events',
    'classroom-presentation': 'classrooms',
    'practical-learning': 'classrooms',
    'cultural-day-presentation': 'school-events',
    'young-pupil-at-school': 'student-activities',
    'pupils-playing-board-game': 'student-activities',
}
for name, folder in destinations.items():
    video = root / 'public/media/videos' / folder / f'{name}.mp4'
    poster = root / 'public/media/images/gallery' / f'{name}.webp'
    video.parent.mkdir(parents=True, exist_ok=True)
    poster.parent.mkdir(parents=True, exist_ok=True)
    copy2(staged / video.name, video)
    copy2(posters / poster.name, poster)
