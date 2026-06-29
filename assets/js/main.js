/**
 * PHOTOGRAPHY PORTFOLIO — MAIN JS
 * Features: loading screen, hero slideshow, masonry gallery,
 * lightbox with keyboard/swipe, scroll animations, theme toggle,
 * mobile nav, filter bar, scroll progress, contact form
 */

/* ── THEME ──────────────────────────────────────── */
(function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.body.className = saved;
})();

/* ── LOADING SCREEN ─────────────────────────────── */
(function initLoading() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  const bar = screen.querySelector('.loading-bar');
  const count = document.getElementById('loading-count');

  let progress = 0;
  const target = 100;
  const tick = setInterval(() => {
    progress = Math.min(progress + Math.random() * 18, target);
    const pct = Math.floor(progress);
    if (bar) bar.style.width = pct + '%';
    if (count) count.textContent = pct + '%';
    if (pct >= target) {
      clearInterval(tick);
      setTimeout(() => {
        screen.classList.add('hidden');
        setTimeout(() => { screen.remove(); }, 700);
      }, 300);
    }
  }, 60);
})();

/* ── NAV SCROLL ─────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    updateScrollProgress();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

function updateScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
}

/* ── MOBILE NAV TOGGLE ──────────────────────────── */
(function initMobileNav() {
  const btn = document.getElementById('btn-menu');
  const mobileNav = document.getElementById('mobile-nav');
  if (!btn || !mobileNav) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
    mobileNav.setAttribute('aria-hidden', String(!open));
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();

/* ── THEME TOGGLE ───────────────────────────────── */
(function initThemeToggle() {
  const btn = document.getElementById('btn-theme');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    document.body.classList.toggle('light', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // Ensure only one class
    if (isDark) document.body.classList.remove('light');
    else document.body.classList.remove('dark');
    document.body.classList.add(isDark ? 'dark' : 'light');
  });
})();

/* ── HERO SLIDESHOW ─────────────────────────────── */
(function initHero() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (slides.length === 0) return;

  let current = 0;
  let timer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      timer = setInterval(next, 5500);
    });
  });

  timer = setInterval(next, 5500);
})();

/* ── SCROLL ANIMATIONS (Intersection Observer) ─── */
(function initScrollAnim() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => obs.observe(el));
})();

/* ── MASONRY GALLERY BUILDER ────────────────────── */
(function initGallery() {
  if (typeof GALLERY_DATA === 'undefined') return;

  const categories = ['fashion', 'lifestyle', 'events', 'interior', 'street', 'product', 'calvados'];

  categories.forEach(cat => {
    const grid = document.getElementById('grid-' + cat);
    if (!grid) return;

    const images = GALLERY_DATA[cat];
    if (!images || !images.length) return;

    images.forEach((filename, idx) => {
      const item = document.createElement('div');
      item.className = 'masonry-item';
      item.setAttribute('data-category', cat);
      item.setAttribute('data-index', idx);
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `Open ${cat} image ${idx + 1}`);

      const img = document.createElement('img');
      img.src = `assets/images/${cat}/${encodeURIPathComponent(filename)}`;
      img.alt = generateAlt(cat, idx, filename);
      img.loading = 'lazy';
      img.decoding = 'async';

      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => {
        item.style.display = 'none'; // hide broken images
      });

      item.appendChild(img);

      // Open lightbox on click or Enter
      item.addEventListener('click', () => openLightbox(cat, idx));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(cat, idx);
        }
      });

      grid.appendChild(item);
    });
  });
})();

/* Encode only special chars in filename, preserving spaces and parens */
function encodeURIPathComponent(str) {
  return str
    .replace(/#/g, '%23')
    .replace(/\?/g, '%3F');
}

function generateAlt(category, index, filename) {
  const labels = {
    fashion: 'Fashion editorial photograph',
    lifestyle: 'Lifestyle photography',
    events: 'Event photography',
    interior: 'Interior and architectural photography',
    street: 'Street photography',
    product: 'Product photography',
    calvados: 'Calvados documentary photography'
  };
  return `${labels[category] || 'Photography'} — ${index + 1}`;
}

/* ── LIGHTBOX ───────────────────────────────────── */
let lbCat = null;
let lbIdx = 0;
let lbImages = [];
let touchStartX = 0;
let touchStartY = 0;

function openLightbox(category, index) {
  if (typeof GALLERY_DATA === 'undefined') return;

  lbCat = category;
  lbIdx = index;
  lbImages = GALLERY_DATA[category] || [];

  const lb = document.getElementById('lightbox');
  if (!lb) return;

  lb.hidden = false;
  document.body.style.overflow = 'hidden';
  lb.focus();

  renderLbImage();
}

function renderLbImage() {
  const img = document.getElementById('lb-img');
  const counter = document.getElementById('lb-counter');
  const catLabel = document.getElementById('lb-category');
  const spinner = document.querySelector('.lb-spinner');

  if (!img || !lbImages.length) return;

  const filename = lbImages[lbIdx];
  const src = `assets/images/${lbCat}/${encodeURIPathComponent(filename)}`;

  img.classList.add('loading');
  if (spinner) spinner.classList.add('spinning');

  img.onload = () => {
    img.classList.remove('loading');
    if (spinner) spinner.classList.remove('spinning');
  };
  img.onerror = () => {
    img.classList.remove('loading');
    if (spinner) spinner.classList.remove('spinning');
  };

  img.src = src;
  img.alt = generateAlt(lbCat, lbIdx, filename);

  if (counter) counter.textContent = `${lbIdx + 1} / ${lbImages.length}`;
  if (catLabel) catLabel.textContent = lbCat.charAt(0).toUpperCase() + lbCat.slice(1);
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.hidden = true;
  document.body.style.overflow = '';
  lbCat = null; lbImages = [];
}

function lbNext() {
  lbIdx = (lbIdx + 1) % lbImages.length;
  renderLbImage();
}

function lbPrev() {
  lbIdx = (lbIdx - 1 + lbImages.length) % lbImages.length;
  renderLbImage();
}

(function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lb-next')?.addEventListener('click', lbNext);
  document.getElementById('lb-prev')?.addEventListener('click', lbPrev);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lb || lb.hidden) return;
    if (e.key === 'ArrowRight') lbNext();
    else if (e.key === 'ArrowLeft') lbPrev();
    else if (e.key === 'Escape') closeLightbox();
  });

  // Click outside image to close
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  // Touch swipe support
  lb.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) lbNext();
      else lbPrev();
    }
  }, { passive: true });
})();

/* ── FILTER BAR ─────────────────────────────────── */
(function initFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const sections = document.querySelectorAll('.gallery-section');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      sections.forEach(section => {
        if (filter === 'all') {
          section.classList.remove('hidden-section');
        } else {
          const match = section.id === filter;
          section.classList.toggle('hidden-section', !match);
          if (match) {
            // Smooth scroll to section with offset for sticky bars
            const offset = 68 + 48; // nav + filter bar
            const top = section.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
      });
    });
  });

  // Hash-based category opening (for links from homepage)
  if (window.location.hash) {
    const target = window.location.hash.slice(1);
    const btn = document.querySelector(`.filter-btn[data-filter="${target}"]`);
    if (btn) {
      setTimeout(() => btn.click(), 300);
    }
  }
})();

/* ── CONTACT FORM ───────────────────────────────── */
(function initContact() {
  const submitBtn = document.getElementById('form-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', () => {
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();
    const status = document.getElementById('form-status');

    if (!name || !email || !message) {
      if (status) {
        status.textContent = 'Please fill in all required fields.';
        status.hidden = false;
      }
      return;
    }

    // Simulate send (replace with your backend/Formspree endpoint)
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = 'Message Sent ✓';
      if (status) {
        status.textContent = 'Thank you. I\'ll be in touch within 48 hours.';
        status.hidden = false;
      }
    }, 1200);
  });
})();
