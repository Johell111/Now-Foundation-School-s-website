const button = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-main-nav]');

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
