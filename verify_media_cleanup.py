from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from PIL import Image
import re
import hashlib

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
        self.slots = []
        self.media = []
        self.forms = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for name in ('src', 'href'):
            if values.get(name):
                self.refs.append(values[name])
        if values.get('data-media-key'):
            self.slots.append(values['data-media-key'])
        if tag in ('img', 'video', 'source'):
            self.media.append((tag, values.get('src', '')))
        if tag == 'form':
            self.forms.append(values.get('action'))

root = Path(__file__).parent
pages = list(root.glob('*.html'))
errors = []
slots = 0
slot_keys = set()
for page in pages:
    parsed = Page()
    parsed.feed(page.read_text(encoding='utf-8'))
    slots += len(parsed.slots)
    slot_keys.update(parsed.slots)
    for ref in parsed.refs:
        parts = urlsplit(ref)
        if not parts.scheme and not ref.startswith('#') and not (root / parts.path).exists():
            errors.append(f'{page.name}: missing {ref}')
    for tag, src in parsed.media:
        if src.startswith(('http:', 'https:')):
            errors.append(f'{page.name}: external {tag} {src}')
    if page.name in ('admissions.html', 'contact.html') and parsed.forms != ['https://formspree.io/f/mzdayydn']:
        errors.append(f'{page.name}: Formspree action changed')

expected = [
    'images/homepage', 'images/classrooms', 'images/facilities',
    'images/students', 'images/events', 'images/gallery',
    'videos/homepage', 'videos/school-events', 'videos/school-tour',
]
for folder in expected:
    if not (root / 'public/media' / folder / '.gitkeep').exists():
        errors.append(f'{folder}: missing tracked directory')

script = (root / 'assets/js/site.js').read_text(encoding='utf-8')
entries = re.findall(r"^\s*(\w+): photo\('([^']+)', '([^']+)', (\d+), (\d+), '([^']+)'\)", script, re.M)
mapped_keys = set()
for key, folder, name, width, height, alt in entries:
    mapped_keys.add(key)
    target = root / 'public/media/images' / folder / f'{name}.webp'
    if not target.exists():
        errors.append(f'{key}: missing {target}')
        continue
    with Image.open(target) as image:
        if image.size != (int(width), int(height)):
            errors.append(f'{key}: dimension mismatch')
    for responsive_width in (640, 960):
        if responsive_width < int(width) and not target.with_name(f'{name}-{responsive_width}.webp').exists():
            errors.append(f'{key}: missing responsive width {responsive_width}')
    if not alt.strip():
        errors.append(f'{key}: missing alt text')

if slot_keys != mapped_keys:
    errors.append(f'Unmapped slots: {slot_keys - mapped_keys}; unused mappings: {mapped_keys - slot_keys}')

for path in (root / 'public/media/images').rglob('*.webp'):
    with Image.open(path) as image:
        image.verify()

for name in ('proprietor-caleb', 'proprietress-eunice'):
    portrait = root / 'public/media/images/leadership' / f'{name}.webp'
    if not portrait.exists():
        errors.append(f'Missing leadership portrait: {portrait}')
    else:
        with Image.open(portrait) as image:
            if image.size != (760, 760):
                errors.append(f'Leadership portrait dimension mismatch: {name}')

source = Path(r'C:\Users\PC\Downloads\WhatsApp Unknown 2026-09-30 at 5.32.18 PM')
backup = root / 'media-originals'
for original in source.glob('*.jpeg'):
    archived = backup / original.name
    if not archived.exists() or hashlib.sha256(original.read_bytes()).digest() != hashlib.sha256(archived.read_bytes()).digest():
        errors.append(f'Original backup missing or changed: {original.name}')
gallery_data = (root / 'assets/js/gallery-data.js').read_text(encoding='utf-8')
video_refs = re.findall(r"src: '(public/media/videos/[^']+)'", gallery_data)
poster_refs = re.findall(r"poster: '(public/media/images/gallery/[^']+)'", gallery_data)
if len(video_refs) != 8 or len(poster_refs) != 8:
    errors.append('Gallery must contain eight video entries and posters')
for ref in video_refs + poster_refs:
    if not (root / ref).exists():
        errors.append(f'Missing gallery media: {ref}')
for original in source.glob('*.mp4'):
    archived = backup / 'videos' / original.name
    if not archived.exists() or hashlib.sha256(original.read_bytes()).digest() != hashlib.sha256(archived.read_bytes()).digest():
        errors.append(f'Video backup missing or changed: {original.name}')

for page in pages:
    if 'href="gallery.html" data-nav="gallery"' not in page.read_text(encoding='utf-8'):
        errors.append(f'{page.name}: missing Gallery navigation')

print(f'Checked {len(pages)} pages, {slots} photo slots, {len(entries)} mappings, {len(video_refs)} videos and all media files.')
print('Errors:', errors)
assert not errors
