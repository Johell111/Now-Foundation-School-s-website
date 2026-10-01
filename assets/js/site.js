const button = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-main-nav]');

const photo = (folder, name, width, height, alt) => ({
  type: 'image', src: `public/media/images/${folder}/${name}.webp`, width, height, alt
});

const schoolMedia = {
  home_hero: photo('facilities', 'school-entrance', 1280, 720, 'Entrance to NOW Foundation School'),
  creche_card: photo('students', 'children-in-school-uniform', 960, 1280, 'Young pupils wearing NOW Foundation School uniforms'),
  nursery_card: photo('classrooms', 'pupils-making-paper-crafts', 1280, 640, 'Pupils making colourful paper crafts together'),
  primary_card: photo('students', 'pupils-playing-board-game', 1020, 768, 'Two pupils playing a board game'),
  home_day: photo('classrooms', 'pupil-making-paper-craft', 1198, 1281, 'Pupil working on a paper craft at a table'),
  home_gallery_1: photo('events', 'prize-giving-group', 1280, 720, 'Pupils and staff at the school prize-giving event'),
  home_gallery_2: photo('events', 'cultural-day-portrait', 960, 1280, 'Pupil wearing traditional dress for cultural day'),
  home_gallery_3: photo('events', 'prize-giving-certificate', 720, 1280, 'Pupil receiving a certificate with two adults'),
  home_gallery_4: photo('events', 'prize-giving-activities', 1280, 720, 'Children taking part in prize-giving day activities'),
  home_gallery_5: photo('events', 'cultural-day-costume', 960, 1280, 'Pupil in costume at the school cultural day'),
  about_hero: photo('facilities', 'school-entrance', 1280, 720, 'Exterior and entrance of NOW Foundation School'),
  about_environment: photo('classrooms', 'pupils-making-paper-crafts', 1280, 640, 'Pupils making crafts in a school classroom'),
  creche_hero: photo('students', 'children-in-school-uniform', 960, 1280, 'Young pupils together in school uniform'),
  nursery_hero: photo('classrooms', 'pupils-making-paper-crafts', 1280, 640, 'Young pupils making paper crafts'),
  nursery_learning: photo('classrooms', 'pupil-making-paper-craft', 1198, 1281, 'Pupil creating a paper craft at a classroom table'),
  primary_hero: photo('students', 'pupils-playing-board-game', 1020, 768, 'Pupils playing a board game outdoors'),
  primary_leadership: photo('events', 'prize-giving-certificate', 720, 1280, 'Pupil receiving a school achievement certificate'),
  student_life_hero: photo('events', 'prize-giving-activities', 1280, 720, 'Pupils participating in school prize-giving activities'),
  student_gallery_1: photo('events', 'prize-giving-group', 1280, 720, 'Pupils and staff celebrating prize-giving day'),
  student_gallery_2: photo('classrooms', 'pupils-making-paper-crafts', 1280, 640, 'Three pupils showing their paper crafts'),
  student_gallery_3: photo('events', 'cultural-day-portrait', 960, 1280, 'Pupil dressed for cultural day'),
  student_gallery_4: photo('students', 'pupils-playing-board-game', 1020, 768, 'Two pupils playing a board game together'),
  student_gallery_5: photo('events', 'cultural-day-costume', 960, 1280, 'Pupil in costume before the cultural-day banner'),
  admissions_hero: photo('facilities', 'school-entrance', 1280, 720, 'Entrance of NOW Foundation School'),
  contact_hero: photo('facilities', 'school-entrance', 1280, 720, 'Front entrance of NOW Foundation School')
};

document.querySelectorAll('[data-media-key]').forEach(slot => {
  const entry = schoolMedia[slot.dataset.mediaKey];
  if (!entry || !entry.src || !entry.src.startsWith('public/media/')) return;

  const isVideo = entry.type === 'video';
  if (!isVideo && (!entry.alt || entry.type !== 'image')) return;
  if (isVideo && !entry.label) return;

  const media = document.createElement(isVideo ? 'video' : 'img');
  media.src = entry.src;
  if (isVideo) {
    media.controls = true;
    media.preload = 'metadata';
    media.playsInline = true;
    media.setAttribute('aria-label', entry.label);
    media.addEventListener('loadedmetadata', () => slot.removeAttribute('aria-hidden'), { once: true });
  } else {
    media.alt = entry.alt;
    media.width = entry.width;
    media.height = entry.height;
    const base = entry.src.slice(0, -5);
    media.srcset = [640, 960].filter(width => width < entry.width)
      .map(width => `${base}-${width}.webp ${width}w`)
      .concat(`${entry.src} ${entry.width}w`).join(', ');
    media.sizes = slot.closest('.program-card, .gallery-grid')
      ? '(max-width: 640px) 100vw, (max-width: 1040px) 50vw, 33vw'
      : slot.closest('.hero') ? '100vw' : '(max-width: 1040px) 100vw, 50vw';
    media.decoding = 'async';
    media.loading = slot.closest('.hero, .page-hero') ? 'eager' : 'lazy';
    if (slot.dataset.mediaKey === 'home_hero') media.fetchPriority = 'high';
    media.addEventListener('load', () => slot.removeAttribute('aria-hidden'), { once: true });
  }
  media.addEventListener('error', () => media.remove(), { once: true });
  slot.appendChild(media);
});

if (button && nav) {
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    button.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }));
}

const page = document.body.dataset.page;
document.querySelectorAll('[data-nav]').forEach(link => {
  if (link.dataset.nav === page) link.setAttribute('aria-current', 'page');
});

const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 }) : null;

document.querySelectorAll('.reveal').forEach(el => {
  if (observer) observer.observe(el);
  else el.classList.add('is-visible');
});

document.querySelectorAll('form[data-formspree]').forEach(form => {
  form.addEventListener('submit', async event => {
    if (!window.fetch) return;
    event.preventDefault();
    const status = form.querySelector('[data-status]');
    const submit = form.querySelector('button[type="submit"]');
    const originalText = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Sending';
    status.textContent = '';
    status.className = 'form-status';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('Submission failed');
      form.reset();
      status.textContent = form.dataset.success || 'Thank you. Your message has been received.';
      status.classList.add('is-success');
    } catch (error) {
      status.textContent = 'Your submission could not be confirmed. Please check your connection and try again.';
      status.classList.add('is-error');
    } finally {
      submit.disabled = false;
      submit.textContent = originalText;
    }
  });
});

const floatingActions = document.createElement('div');
floatingActions.className = 'floating-actions';
floatingActions.innerHTML = `
  <a class="float-button whatsapp" href="https://wa.me/2348090903335" target="_blank" rel="noopener" aria-label="Chat with NOW Foundation School on WhatsApp">WhatsApp</a>
  <a class="float-button" href="tel:+2348090903335" aria-label="Call NOW Foundation School">Call</a>
  <button class="float-button top" type="button" aria-label="Back to top">↑</button>
`;
document.body.appendChild(floatingActions);

const topButton = floatingActions.querySelector('.top');
if (topButton) {
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  const toggleTopButton = () => {
    topButton.classList.toggle('is-visible', window.scrollY > 420);
  };
  toggleTopButton();
  window.addEventListener('scroll', toggleTopButton, { passive: true });
}
