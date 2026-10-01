const gallery = window.schoolGallery;
const photoGrid = document.querySelector('[data-photo-grid]');
const videoGrid = document.querySelector('[data-video-grid]');
const filters = document.querySelector('[data-photo-filters]');
const empty = document.querySelector('[data-gallery-empty]');
const dialog = document.querySelector('[data-media-dialog]');
const stage = document.querySelector('[data-dialog-stage]');
const caption = document.querySelector('[data-dialog-caption]');
const previous = document.querySelector('[data-dialog-prev]');
const next = document.querySelector('[data-dialog-next]');
let visiblePhotos = gallery.photos;
let photoIndex = 0;
let opener = null;
let touchStartX = null;

function makePhotoCard(photo, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gallery-card';
  button.setAttribute('aria-label', `View photograph: ${photo.title}`);
  const image = document.createElement('img');
  image.src = photo.thumb;
  image.alt = photo.alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  const text = document.createElement('span');
  text.className = 'gallery-card-copy';
  const category = document.createElement('small');
  category.textContent = photo.category;
  const title = document.createElement('strong');
  title.textContent = photo.title;
  text.append(category, title);
  button.append(image, text);
  button.addEventListener('click', () => {
    opener = button;
    photoIndex = index;
    showPhoto();
    dialog.showModal();
  });
  return button;
}

function renderPhotos(category = 'All photographs') {
  visiblePhotos = category === 'All photographs' ? gallery.photos : gallery.photos.filter(photo => photo.category === category);
  photoGrid.replaceChildren(...visiblePhotos.map(makePhotoCard));
  empty.hidden = visiblePhotos.length > 0;
  filters.querySelectorAll('button').forEach(button => {
    const active = button.dataset.category === category;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function makeVideoCard(video) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gallery-card gallery-video-card';
  button.setAttribute('aria-label', `Play video: ${video.title}`);
  const image = document.createElement('img');
  image.src = video.poster;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  const play = document.createElement('span');
  play.className = 'gallery-play';
  play.setAttribute('aria-hidden', 'true');
  play.textContent = '▶';
  const text = document.createElement('span');
  text.className = 'gallery-card-copy';
  const category = document.createElement('small');
  category.textContent = `${video.category} · ${video.duration}`;
  const title = document.createElement('strong');
  title.textContent = video.title;
  text.append(category, title);
  button.append(image, play, text);
  button.addEventListener('click', () => {
    opener = button;
    showVideo(video);
    dialog.showModal();
  });
  return button;
}

function showPhoto() {
  const photo = visiblePhotos[photoIndex];
  const image = document.createElement('img');
  image.src = photo.src;
  image.alt = photo.alt;
  image.decoding = 'async';
  stage.replaceChildren(image);
  caption.textContent = `${photo.title} · ${photo.category}`;
  previous.hidden = next.hidden = visiblePhotos.length < 2;
}

function showVideo(item) {
  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.poster = item.poster;
  video.src = item.src;
  video.setAttribute('aria-label', item.title);
  video.addEventListener('error', () => {
    caption.textContent = 'This video could not be loaded. Please try again later.';
  });
  stage.replaceChildren(video);
  caption.textContent = `${item.title} · ${item.description}`;
  previous.hidden = next.hidden = true;
}

function changePhoto(direction) {
  if (!stage.querySelector('img') || visiblePhotos.length < 2) return;
  photoIndex = (photoIndex + direction + visiblePhotos.length) % visiblePhotos.length;
  showPhoto();
}

function setTab(name) {
  const photos = name !== 'videos';
  document.querySelector('[data-gallery-panel="photos"]').hidden = !photos;
  document.querySelector('[data-gallery-panel="videos"]').hidden = photos;
  document.querySelectorAll('[data-gallery-tab]').forEach(button => {
    const active = button.dataset.galleryTab === (photos ? 'photos' : 'videos');
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  empty.hidden = !photos || visiblePhotos.length > 0;
  history.replaceState(null, '', photos ? '#photographs' : '#videos');
}

const categories = ['All photographs', ...new Set(gallery.photos.map(photo => photo.category))];
categories.forEach(category => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'gallery-filter';
  button.dataset.category = category;
  button.textContent = category;
  button.addEventListener('click', () => renderPhotos(category));
  filters.appendChild(button);
});
videoGrid.replaceChildren(...gallery.videos.map(makeVideoCard));
renderPhotos();
setTab(location.hash === '#videos' ? 'videos' : 'photos');
document.querySelectorAll('[data-gallery-tab]').forEach(button => button.addEventListener('click', () => setTab(button.dataset.galleryTab)));
previous.addEventListener('click', () => changePhoto(-1));
next.addEventListener('click', () => changePhoto(1));
document.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => {
  const video = stage.querySelector('video');
  if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
  stage.replaceChildren();
  opener?.focus();
});
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); changePhoto(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); changePhoto(1); }
});
stage.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
stage.addEventListener('touchend', event => {
  if (touchStartX === null) return;
  const distance = event.changedTouches[0].screenX - touchStartX;
  if (Math.abs(distance) > 60) changePhoto(distance > 0 ? -1 : 1);
  touchStartX = null;
}, { passive: true });
