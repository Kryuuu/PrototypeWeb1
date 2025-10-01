// Navigation toggle
const navToggle = document.querySelector('.nav__toggle');
const navMenu = document.querySelector('#nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navMenu.classList.remove('is-open'));
  });
}

// iOS hero fallback
const heroSection = document.querySelector('.hero');
const heroVideo = document.querySelector('.hero__video');
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

if (isIOS && heroSection && heroVideo) {
  heroSection.classList.add('hero--static');
  heroVideo.removeAttribute('autoplay');
  heroVideo.pause();
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Intersection reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Year in footer
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Stats counter
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat__num').forEach((num) => {
        const targetValue = Number(num.dataset.count || 0);
        let current = 0;
        const step = Math.max(1, Math.floor(targetValue / 60));
        const tick = () => {
          current += step;
          if (current >= targetValue) {
            current = targetValue;
          }
          num.textContent = current.toString();
          if (current < targetValue) {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      });
      counterIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const statsEl = document.querySelector('.stats');
if (statsEl) {
  counterIO.observe(statsEl.closest('.about') || statsEl);
}

// Filter portfolio
const filterBtns = document.querySelectorAll('.filter__btn');
const items = document.querySelectorAll('.work-item');
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const filterKey = btn.dataset.filter;
    items.forEach((item) => {
      const show = filterKey === 'all' || item.dataset.category === filterKey;
      item.style.display = show ? '' : 'none';
    });
  });
});

// Lightbox
const lb = document.querySelector('.lightbox');
const lbImg = document.querySelector('.lightbox__img');
const lbClose = document.querySelector('.lightbox__close');

document.querySelectorAll('.work-item__open').forEach((btn) => {
  btn.addEventListener('click', () => {
    const src = btn.dataset.src || btn.closest('.work-item')?.querySelector('img')?.src;
    if (!lb || !lbImg || !src) {
      return;
    }
    lbImg.src = src;
    lb.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  });
});

lbClose?.addEventListener('click', () => {
  if (!lb || !lbImg) {
    return;
  }
  lb.setAttribute('hidden', '');
  lbImg.removeAttribute('src');
  document.body.style.overflow = '';
});

lb?.addEventListener('click', (event) => {
  if (event.target === lb) {
    lbClose?.click();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !lb?.hasAttribute('hidden')) {
    lbClose?.click();
  }
});

// Contact form -> EmailJS
const EMAILJS_SERVICE_ID = 'service_z525eb2';
const EMAILJS_TEMPLATE_ID = 'ttemplate_pq8okdo';
const EMAILJS_PUBLIC_KEY = '88M0dHhSmm_l9tCS9';
const EMAILJS_TARGET_EMAIL = 'rumahbumnbanjarmasinkalsel@gmail.com';

const form = document.querySelector('.form');
const note = document.getElementById('formNote');
const submitBtn = document.getElementById('sendBtn');

const setSubmittingState = (isSubmitting) => {
  if (!submitBtn) {
    return;
  }
  submitBtn.disabled = isSubmitting;
  if (!submitBtn.dataset.originalText) {
    submitBtn.dataset.originalText = submitBtn.textContent || 'Kirim';
  }
  submitBtn.textContent = isSubmitting ? 'Mengirim...' : submitBtn.dataset.originalText;
};

const showNote = (message, isError = false) => {
  if (!note) {
    return;
  }
  note.textContent = message;
  note.style.color = isError ? '#ff7676' : 'var(--muted)';
};

const ensureEmailJSLoaded = () => {
  if (window.emailjs?.init) {
    return true;
  }
  console.error('EmailJS belum dimuat. Pastikan skrip CDN disertakan.');
  showNote('Gagal memuat layanan email. Coba lagi nanti.', true);
  return false;
};

const buildEmailPayload = (name, email, message) => {
  const submittedAt = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    hour12: false,
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return {
    from_name: name,
    from_email: email,
    message,
    submitted_at: submittedAt,
    subject: `[Hubungi Rumah BUMN] Pesan Baru dari ${name} (${email})`,
    to_email: EMAILJS_TARGET_EMAIL,
  };
};

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form) {
    return;
  }

  const name = form.querySelector('#name')?.value.trim();
  const email = form.querySelector('#email')?.value.trim();
  const message = form.querySelector('#message')?.value.trim();

  if (!name || !email || !message) {
    showNote('Lengkapi semua kolom sebelum mengirim.', true);
    return;
  }

  if (!ensureEmailJSLoaded()) {
    return;
  }

  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } catch (err) {
    console.error(err);
    showNote('Konfigurasi EmailJS belum lengkap.', true);
    return;
  }

  setSubmittingState(true);
  showNote('Mengirim pesan...');

  try {
    const payload = buildEmailPayload(name, email, message);
    const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload);

    if (response.status === 200 || response.text === 'OK') {
      showNote('Terima kasih! Pesan kamu sudah kami terima.');
      form.reset();
    } else {
      showNote('Terjadi kendala saat mengirim pesan.', true);
    }
  } catch (error) {
    console.error(error);
    showNote(error.message || 'Tidak dapat mengirim pesan. Coba lagi nanti.', true);
  } finally {
    setSubmittingState(false);
  }
});
