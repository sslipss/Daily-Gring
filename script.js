/* ============================================================
   THE DAILY GRIND — SCRIPT
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. SMOOTH SCROLL — nav links
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerH = document.querySelector('.header').offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerH;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      // Close mobile menu if open
      closeMobileNav();
    });
  });

  /* ----------------------------------------------------------
     2. MOBILE NAV TOGGLE
  ---------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav   = document.getElementById('mainNav');

  navToggle.addEventListener('click', function () {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    toggleMobileNav(!expanded);
  });

  function toggleMobileNav(open) {
    mainNav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function closeMobileNav() {
    toggleMobileNav(false);
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
      closeMobileNav();
      navToggle.focus();
    }
  });

  // Close when clicking outside nav
  document.addEventListener('click', function (e) {
    if (
      mainNav.classList.contains('is-open') &&
      !mainNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeMobileNav();
    }
  });

  /* ----------------------------------------------------------
     3. HEADER — add shadow on scroll + active nav link
  ---------------------------------------------------------- */
  const header   = document.querySelector('.header');
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

  function onScroll() {
    // Shadow
    header.classList.toggle('scrolled', window.scrollY > 20);

    // Active link highlight
    const scrollMid = window.scrollY + header.offsetHeight + 60;

    let currentId = '';
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollMid) {
        currentId = sec.id;
      }
    });

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === currentId);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ----------------------------------------------------------
     4. CONTACT FORM VALIDATION
  ---------------------------------------------------------- */
  const form        = document.getElementById('contactForm');
  const nameInput   = document.getElementById('name');
  const emailInput  = document.getElementById('email');
  const msgInput    = document.getElementById('message');
  const nameError   = document.getElementById('nameError');
  const emailError  = document.getElementById('emailError');
  const msgError    = document.getElementById('messageError');
  const formSuccess = document.getElementById('formSuccess');

  // --- Helpers ---
  function setError(input, errorEl, msg) {
    errorEl.textContent = msg;
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input, errorEl) {
    errorEl.textContent = '';
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  // --- Live validation (on blur) ---
  nameInput.addEventListener('blur', function () {
    if (this.value.trim().length < 2) {
      setError(this, nameError, 'Введите имя (минимум 2 символа).');
    } else {
      clearError(this, nameError);
    }
  });

  emailInput.addEventListener('blur', function () {
    if (!this.value.trim()) {
      setError(this, emailError, 'Введите email.');
    } else if (!isValidEmail(this.value)) {
      setError(this, emailError, 'Введите корректный email.');
    } else {
      clearError(this, emailError);
    }
  });

  msgInput.addEventListener('blur', function () {
    if (this.value.trim().length < 10) {
      setError(this, msgError, 'Сообщение должно содержать минимум 10 символов.');
    } else {
      clearError(this, msgError);
    }
  });

  // --- Submit validation ---
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    formSuccess.textContent = '';

    let valid = true;

    // Name
    if (nameInput.value.trim().length < 2) {
      setError(nameInput, nameError, 'Введите имя (минимум 2 символа).');
      valid = false;
    } else {
      clearError(nameInput, nameError);
    }

    // Email
    if (!emailInput.value.trim()) {
      setError(emailInput, emailError, 'Введите email.');
      valid = false;
    } else if (!isValidEmail(emailInput.value)) {
      setError(emailInput, emailError, 'Введите корректный email.');
      valid = false;
    } else {
      clearError(emailInput, emailError);
    }

    // Message
    if (msgInput.value.trim().length < 10) {
      setError(msgInput, msgError, 'Сообщение должно содержать минимум 10 символов.');
      valid = false;
    } else {
      clearError(msgInput, msgError);
    }

    if (!valid) {
      // Focus first invalid field
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // --- Success simulation ---
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем...';

    setTimeout(function () {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить сообщение';
      formSuccess.textContent = 'Спасибо! Ваше сообщение отправлено. Мы ответим в течение 24 часов.';

      // Clear success message after 6 seconds
      setTimeout(function () {
        formSuccess.textContent = '';
      }, 6000);
    }, 1200);
  });

  /* ----------------------------------------------------------
     5. SCROLL-IN ANIMATIONS (Intersection Observer)
  ---------------------------------------------------------- */
  const animateEls = document.querySelectorAll('.card, .about__image-wrap, .about__content, .contact__form, .contact__info');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    animateEls.forEach(function (el) {
      el.classList.add('will-animate');
      observer.observe(el);
    });
  }

})();
