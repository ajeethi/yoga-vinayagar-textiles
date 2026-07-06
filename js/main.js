/* ============================================================
   YOGA VINAYAGAR TEXTILES — MAIN JAVASCRIPT ENGINE
   Handles: Navbar, Hero Slider, Animations, Mobile Menu,
            Search, Scroll events, Newsletter, FAB, Carousel
   ============================================================ */

'use strict';

// ── DOM Ready ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initMegaMenu();
  initHeroSlider();
  initScrollAnimations();
  initMobileMenu();
  initSearch();
  initScrollTop();
  initBestSellersCarousel();
  initVideoSection();
  initWishlistButtons();
  loadCartCount();
});

/* ══════════════════════════════════════════════════════════════
   MEGA MENU — Dynamic Position Fix
   The mega-menu uses position:fixed so it always spans the full
   viewport width. We update its `top` to sit right below the
   navbar using getBoundingClientRect() on scroll.
══════════════════════════════════════════════════════════════ */
function initMegaMenu() {
  const navbar = document.getElementById('navbar');
  const megaMenus = document.querySelectorAll('.mega-menu');
  if (!navbar || !megaMenus.length) return;

  function updateMegaMenuTop() {
    const navBottom = navbar.getBoundingClientRect().bottom;
    megaMenus.forEach(menu => {
      menu.style.top = navBottom + 'px';
    });
  }

  // Update on scroll (throttled)
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateMegaMenuTop();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Update on resize
  window.addEventListener('resize', updateMegaMenuTop, { passive: true });

  // Initial position
  updateMegaMenuTop();
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR — Scroll & Sticky
══════════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;
  const SCROLL_THRESHOLD = 80;

  function handleScroll() {
    const currentScroll = window.scrollY;

    if (currentScroll > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }

  // Throttle scroll
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════════
   HERO SLIDER
══════════════════════════════════════════════════════════════ */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero__slide');
  const dots   = document.querySelectorAll('.hero__dot');
  const prev   = document.getElementById('heroPrev');
  const next   = document.getElementById('heroNext');
  const track  = document.getElementById('heroSlides');

  if (!slides.length) return;

  let current = 0;
  let autoTimer = null;
  const DURATION = 5000;

  function goTo(index) {
    // Bounds check
    index = ((index % slides.length) + slides.length) % slides.length;

    // Remove active from current
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');

    current = index;

    // Activate new slide
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');

    // Move track
    if (track) {
      track.style.transform = `translateX(-${current * 100}%)`;
    }
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), DURATION);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  // Dot controls
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      stopAuto();
      startAuto();
    });
  });

  // Arrow controls
  if (prev) {
    prev.addEventListener('click', () => {
      goTo(current - 1);
      stopAuto();
      startAuto();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      goTo(current + 1);
      stopAuto();
      startAuto();
    });
  }

  // Touch/Swipe support
  let touchStartX = 0;
  let touchEndX   = 0;

  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    hero.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goTo(current + 1);
        } else {
          goTo(current - 1);
        }
        stopAuto();
        startAuto();
      }
    }, { passive: true });
  }

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); stopAuto(); startAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); stopAuto(); startAuto(); }
  });

  // Pause on hover / focus
  if (hero) {
    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);
    hero.addEventListener('focusin', stopAuto);
    hero.addEventListener('focusout', startAuto);
  }

  // Pause when page is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });

  startAuto();
}

/* ══════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS (Intersection Observer)
══════════════════════════════════════════════════════════════ */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay    = document.getElementById('mobileOverlay');
  const closeBtn   = document.getElementById('closeMobile');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('open');
    overlay.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first element in menu
    const firstFocus = mobileMenu.querySelector('a, button');
    if (firstFocus) firstFocus.focus();
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay)  overlay.addEventListener('click', closeMenu);

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });
}

// Toggle mobile submenu
function toggleMobileSubmenu(id) {
  const submenu = document.getElementById(id);
  const chevron = document.getElementById(id + '-chevron');
  if (!submenu) return;

  const isOpen = submenu.classList.contains('open');
  // Close all submenus first
  document.querySelectorAll('.mobile-submenu').forEach(s => s.classList.remove('open'));
  document.querySelectorAll('[id$="-chevron"]').forEach(c => {
    c.style.transform = '';
  });

  if (!isOpen) {
    submenu.classList.add('open');
    if (chevron) chevron.style.transform = 'rotate(180deg)';
  }
}

/* ══════════════════════════════════════════════════════════════
   SEARCH OVERLAY
══════════════════════════════════════════════════════════════ */
function initSearch() {
  const searchBtn     = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const closeSearch   = document.getElementById('closeSearch');
  const searchInput   = document.getElementById('searchInput');

  if (!searchBtn || !searchOverlay) return;

  function openSearch() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }

  function closeSearchFn() {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
    searchBtn.focus();
  }

  searchBtn.addEventListener('click', openSearch);
  if (closeSearch) closeSearch.addEventListener('click', closeSearchFn);

  searchOverlay.addEventListener('click', e => {
    if (e.target === searchOverlay) closeSearchFn();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
      closeSearchFn();
    }
    // Global shortcut: Ctrl+K or / to open search
    if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
      e.preventDefault();
      openSearch();
    }
  });

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        const query = encodeURIComponent(searchInput.value.trim());
        window.location.href = `pages/search.html?q=${query}`;
      }
    });
  }
}

/* ══════════════════════════════════════════════════════════════
   SCROLL TO TOP
══════════════════════════════════════════════════════════════ */
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════════════════════════════
   BEST SELLERS CAROUSEL
══════════════════════════════════════════════════════════════ */
function initBestSellersCarousel() {
  const track     = document.getElementById('bsTrack');
  const prevBtn   = document.getElementById('bsPrev');
  const nextBtn   = document.getElementById('bsNext');

  if (!track || !prevBtn || !nextBtn) return;

  let position = 0;
  const cardWidth = 260 + 20; // card width + gap
  let maxPosition = 0;

  function updateButtons() {
    prevBtn.disabled = position === 0;
    nextBtn.disabled = position >= maxPosition;
  }

  function getMaxPosition() {
    const trackWidth = track.scrollWidth;
    const wrapperWidth = track.parentElement.offsetWidth;
    return Math.max(0, trackWidth - wrapperWidth);
  }

  function scrollTo(newPos) {
    maxPosition = getMaxPosition();
    position = Math.max(0, Math.min(newPos, maxPosition));
    track.style.transform = `translateX(-${position}px)`;
    updateButtons();
  }

  prevBtn.addEventListener('click', () => scrollTo(position - cardWidth));
  nextBtn.addEventListener('click', () => scrollTo(position + cardWidth));

  // Touch support
  let touchStart = 0;
  track.addEventListener('touchstart', e => {
    touchStart = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) scrollTo(position + cardWidth);
      else scrollTo(position - cardWidth);
    }
  }, { passive: true });

  // Init
  setTimeout(() => {
    maxPosition = getMaxPosition();
    updateButtons();
  }, 100);

  window.addEventListener('resize', () => {
    maxPosition = getMaxPosition();
    position = Math.min(position, maxPosition);
    track.style.transform = `translateX(-${position}px)`;
    updateButtons();
  });
}

/* ══════════════════════════════════════════════════════════════
   VIDEO SECTION
══════════════════════════════════════════════════════════════ */
function initVideoSection() {
  const thumb = document.getElementById('videoThumb');
  if (!thumb) return;

  thumb.addEventListener('click', () => {
    // Replace with YouTube embed or actual video
    showToast('Video feature coming soon! Visit our store or WhatsApp us for video consultations.', 'info');
  });

  thumb.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      thumb.click();
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   WISHLIST BUTTONS
══════════════════════════════════════════════════════════════ */
function initWishlistButtons() {
  document.querySelectorAll('.product-card__wishlist').forEach(btn => {
    const productId = btn.dataset.productId;
    const wishlist  = getWishlist();

    if (wishlist.includes(productId)) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(productId, this);
    });
  });

  updateWishlistCount();
}

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('yv_wishlist') || '[]');
  } catch {
    return [];
  }
}

function toggleWishlist(productId, btn) {
  let wishlist = getWishlist();
  const index  = wishlist.indexOf(productId);

  if (index === -1) {
    wishlist.push(productId);
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    showToast('Added to wishlist! ❤️', 'success');
  } else {
    wishlist.splice(index, 1);
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
    showToast('Removed from wishlist', 'info');
  }

  localStorage.setItem('yv_wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
}

function updateWishlistCount() {
  const count = getWishlist().length;
  const el = document.getElementById('wishlistCount');
  if (el) {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  }
}

/* ══════════════════════════════════════════════════════════════
   NEWSLETTER
══════════════════════════════════════════════════════════════ */
function handleNewsletter(event) {
  event.preventDefault();
  const form  = document.getElementById('newsletterForm');
  const email = document.getElementById('newsletterEmail');
  const btn   = document.getElementById('newsletterSubmit');

  if (!email || !email.value.trim()) return;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
    showToast('Please enter a valid email address.', 'error');
    email.focus();
    return;
  }

  // Simulate subscription
  btn.textContent = 'Subscribing…';
  btn.disabled = true;

  setTimeout(() => {
    // Save to localStorage
    const subscribers = JSON.parse(localStorage.getItem('yv_subscribers') || '[]');
    if (!subscribers.includes(email.value.trim())) {
      subscribers.push(email.value.trim());
      localStorage.setItem('yv_subscribers', JSON.stringify(subscribers));
    }

    email.value = '';
    btn.textContent = '✓ Subscribed!';
    showToast('🎉 You\'re subscribed! Watch for exclusive offers and new arrivals.', 'success');

    setTimeout(() => {
      btn.textContent = 'Subscribe';
      btn.disabled = false;
    }, 3000);
  }, 1000);
}

/* ══════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
══════════════════════════════════════════════════════════════ */
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const colorMap = {
    success: 'toast-success',
    error:   'toast-error',
    info:    'toast-gold',
    gold:    'toast-gold'
  };

  toast.className = `toast ${colorMap[type] || ''}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span style="font-size:1.1rem;" aria-hidden="true">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span style="flex:1;font-size:var(--fs-sm);">${escapeHtml(message)}</span>
    <button onclick="this.parentElement.remove()" style="color:var(--clr-charcoal-400);flex-shrink:0;" aria-label="Dismiss notification">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  `;

  container.appendChild(toast);

  // Auto remove
  const timer = setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);

  // Remove on click
  toast.addEventListener('click', () => {
    clearTimeout(timer);
    toast.remove();
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/* ══════════════════════════════════════════════════════════════
   UTILITY
══════════════════════════════════════════════════════════════ */
function loadCartCount() {
  try {
    const cart  = JSON.parse(localStorage.getItem('yv_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const el    = document.getElementById('cartCount');
    if (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    }
  } catch (e) {
    console.warn('Cart load error:', e);
  }
}

// Format price in INR
function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Debounce helper
function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}
