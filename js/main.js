/* ═══════════════════════════════════════════
   PCFIXPRO — Shared JavaScript
   Nav, Hamburger, Theme, FAQ, Reveal, Counter
═══════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Cookie helpers ── */
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days || 365) * 86400000);
    document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/';
  }
  function getCookie(name) {
    var m = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : null;
  }

  /* ── Theme ── */
  var html = document.documentElement;
  var themeBtn  = document.getElementById('themeToggle');
  var themeKnob = document.getElementById('themeKnob');

  function applyTheme(theme) {
    if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
      if (themeKnob) themeKnob.textContent = '☀️';
    } else {
      html.removeAttribute('data-theme');
      if (themeKnob) themeKnob.textContent = '🌙';
    }
    setCookie('pcfixpro-theme', theme);
  }

  var saved = getCookie('pcfixpro-theme');
  if (!saved) saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  html.style.transition = 'none';
  applyTheme(saved);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { html.style.transition = ''; });
  });

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  }

  /* ── Navbar scroll ── */
  var mainNav = document.getElementById('mainNav');
  if (mainNav) {
    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY > 40;
      mainNav.classList.toggle('scrolled', scrolled);
      mainNav.classList.toggle('pinned', scrolled);
    }, { passive: true });
  }

  /* ── Hamburger menu ── */
  var hamburger  = document.getElementById('hamburger') || document.querySelector('.hamburger');
  var mobileMenu = document.getElementById('mobileMenu') || document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    function toggleMenu(forceOpen) {
      var isOpen = forceOpen !== undefined ? forceOpen : !mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    }
    hamburger.addEventListener('click', function () { toggleMenu(); });
    hamburger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
    });
    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        toggleMenu(false);
      }
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { toggleMenu(false); });
    });
  }

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-grid, .faq-list, .faq-wrap').forEach(function (container) {
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.faq-q');
      if (!btn) return;
      e.stopPropagation();
      var item   = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      container.querySelectorAll('.faq-item.open').forEach(function (i) {
        i.classList.remove('open');
        var q = i.querySelector('.faq-q');
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    container.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var btn = e.target.closest('.faq-q');
      if (!btn) return;
      e.preventDefault();
      btn.click();
    });
  });

  // Legacy inline toggleFaq support
  window.toggleFaq = function (btn) {
    var item   = btn.closest('.faq-item');
    var isOpen = item.classList.contains('open');
    var container = item.closest('.faq-list, .faq-wrap, .faq-grid');
    if (container) {
      container.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
    }
    if (!isOpen) item.classList.add('open');
  };

  /* ── Scroll reveal ── */
  var selectors = '.reveal,.rev,.rv,.rev-l,.rv-l,.rev-r,.rv-r,.stag,.stagger';
  var revealEls = document.querySelectorAll(selectors);
  if ('IntersectionObserver' in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.add('in');
          revObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    revealEls.forEach(function (el) { revObs.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
      el.classList.add('in');
    });
  }

  /* ── Counter animation ── */
  function animateCounter(el, target) {
    var start = null;
    var duration = 1800;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(e * target).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cntObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.sc-num,.stat-num,.micro-num,.sstat-n,.vc-stat-n').forEach(function (num) {
            if (!num.dataset.count) return;
            var val = parseInt(num.dataset.count, 10);
            if (!isNaN(val) && val > 0) animateCounter(num, val);
          });
          cntObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.stats-grid,.hero-stats,.vc-stats,.stats-bar,.stats-inner,.hero-micro,.hero-visual-card').forEach(function (el) {
      cntObs.observe(el);
    });
  }

  /* ── Smooth anchor scrolling ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ── WhatsApp booking form ── */
  window.submitBook = function (e, serviceType) {
    if (e && e.preventDefault) e.preventDefault();
    var brand   = (document.getElementById('pb') || {}).value || 'Not specified';
    var model   = (document.getElementById('pm') || {}).value || 'Not specified';
    var issue   = (document.getElementById('pi') || {}).value || 'Not specified';
    var name    = (document.getElementById('pn') || {}).value || 'Customer';
    var phone   = (document.getElementById('pp') || {}).value || 'Not provided';
    var svc     = serviceType || 'repair';
    var msg = 'Hi PCFixPro, I need ' + svc + ' in Ranchi.%0A%0ABrand: ' + encodeURIComponent(brand) +
              '%0AModel: ' + encodeURIComponent(model) +
              '%0AIssue: ' + encodeURIComponent(issue) +
              '%0AName: '  + encodeURIComponent(name)  +
              '%0APhone: ' + encodeURIComponent(phone);
    window.open('https://wa.me/918709004521?text=' + msg, '_blank');
  };

})();

/* ── Homepage stat counter (text-based, .stat-num without data-count) ── */
(function () {
  function animateStatText(el) {
    var txt = el.textContent || '';
    var hasStar = txt.indexOf('+') !== -1;
    var hasPct  = txt.indexOf('%') !== -1;
    var val = parseInt(txt.replace(/[^0-9]/g, ''), 10);
    if (isNaN(val) || val <= 0 || el.dataset.count) return;
    var suffix = hasPct ? '%' : hasStar ? '+' : '';
    var start = null, duration = 1800;
    (function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * val).toLocaleString('en-IN') + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-num, .sc-num').forEach(animateStatText);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.hero-stats, .stats-grid').forEach(function (el) { obs.observe(el); });
  }
})();

/* ── Printer page: .stats-inner / .stat-n counter ── */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.stat-n').forEach(function (el) {
        var txt = el.textContent || '';
        var isPlus = txt.indexOf('+') !== -1;
        var isPct  = txt.indexOf('%') !== -1;
        var isYr   = txt.toLowerCase().indexOf('yr') !== -1;
        var val    = parseInt(txt.replace(/[^0-9]/g, ''), 10);
        if (isNaN(val) || val <= 0) return;
        var suffix = isYr ? '+yr' : isPct ? '%' : isPlus ? '+' : '';
        var em = el.querySelector('em');
        if (em) {
          var numNode = document.createTextNode('0');
          el.textContent = ''; el.appendChild(numNode); el.appendChild(em);
          var start = null;
          (function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / 1800, 1);
            numNode.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * val).toLocaleString('en-IN');
            if (p < 1) requestAnimationFrame(step);
          })(performance.now());
        } else {
          var start = null;
          (function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / 1800, 1);
            el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * val).toLocaleString('en-IN') + suffix;
            if (p < 1) requestAnimationFrame(step);
          })(performance.now());
        }
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.stats-inner').forEach(function (el) { obs.observe(el); });
})();

/* ── Printer page: submitBook with #pt (printer type) field ── */
(function () {
  var _orig = window.submitBook;
  window.submitBook = function (e, serviceType) {
    if (e && e.preventDefault) e.preventDefault();
    var ptEl = document.getElementById('pt');
    if (ptEl) {
      var brand = (document.getElementById('pb') || {}).value || 'Not specified';
      var type  = ptEl.value || 'Not specified';
      var issue = (document.getElementById('pi') || {}).value || 'Not specified';
      var name  = (document.getElementById('pn') || {}).value || 'Customer';
      var phone = (document.getElementById('pp') || {}).value || 'Not provided';
      var msg = 'Hi PCFixPro, I need printer repair in Ranchi.%0A%0ABrand: ' + encodeURIComponent(brand) +
                '%0AType: '  + encodeURIComponent(type)  +
                '%0AIssue: ' + encodeURIComponent(issue) +
                '%0AName: '  + encodeURIComponent(name)  +
                '%0APhone: ' + encodeURIComponent(phone);
      window.open('https://wa.me/918709004521?text=' + msg, '_blank');
    } else if (_orig) {
      _orig(e, serviceType);
    }
  };
})();

/* ── Laptop page: sync .faq-item.active → .open on page load ── */
(function () {
  document.querySelectorAll('.faq-item.active').forEach(function (item) {
    item.classList.add('open');
    var btn = item.querySelector('.faq-q');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  });
})();

/* ── Contact page: business hours status ── */
(function () {
  var el = document.getElementById('hours-status');
  if (!el) return;
  var now  = new Date();
  var day  = now.getDay();       // 0=Sun … 6=Sat
  var hour = now.getHours() + now.getMinutes() / 60;
  var isOpen = (day >= 1 && day <= 6) ? (hour >= 9 && hour < 20)
                                       : (hour >= 10 && hour < 17);
  el.textContent = isOpen ? '🟢 Open Now' : '🔴 Closed Now';
  el.style.color  = isOpen ? 'var(--green)' : '#ef4444';
})();

/* ── Contact page: contact form → WhatsApp ── */
window.submitContactForm = function (e) {
  if (e && e.preventDefault) e.preventDefault();
  var name    = (document.getElementById('cf-name')    || document.querySelector('[name="name"]')    || {}).value || 'Customer';
  var phone   = (document.getElementById('cf-phone')   || document.querySelector('[name="phone"]')   || {}).value || 'Not provided';
  var service = (document.getElementById('cf-service') || document.querySelector('[name="service"]') || {}).value || 'Not specified';
  var msg_    = (document.getElementById('cf-msg')     || document.querySelector('[name="message"]') || {}).value || '';
  var wa = 'Hi PCFixPro, I want to get in touch.%0A%0AName: '  + encodeURIComponent(name)    +
           '%0APhone: '   + encodeURIComponent(phone)   +
           '%0AService: ' + encodeURIComponent(service) +
           (msg_ ? '%0AMessage: ' + encodeURIComponent(msg_) : '');
  window.open('https://wa.me/918709004521?text=' + wa, '_blank');
};

/* ── Contact page: bind form submit event ── */
(function () {
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      window.submitContactForm(e);
    });
  }
})();

/* ── Computer repair page: handleBooking form → WhatsApp ── */
window.handleBooking = function (e) {
  if (e && e.preventDefault) e.preventDefault();
  var device = (document.getElementById('device-type') || {}).value || '';
  var issue  = (document.getElementById('issue-type')  || {}).value || '';
  var name   = (document.getElementById('cust-name')   || {}).value || '';
  var phone  = (document.getElementById('cust-phone')  || {}).value || '';
  if (!device || !issue || !name || !phone) {
    alert('Please fill in all fields before submitting.');
    return;
  }
  var msg = 'Hi PCFixPro, I need computer repair in Ranchi.%0A%0ADevice: ' + encodeURIComponent(device) +
            '%0AIssue: '  + encodeURIComponent(issue)  +
            '%0AName: '   + encodeURIComponent(name)   +
            '%0APhone: '  + encodeURIComponent(phone);
  window.open('https://wa.me/918709004521?text=' + msg, '_blank');
};

/* ── Computer repair page: stat counter for .stat-num (data-count attribute) ── */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.stat-num[data-count]').forEach(function (el) {
        var val = parseInt(el.dataset.count, 10);
        if (isNaN(val) || val <= 0) return;
        var start = null;
        (function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / 1800, 1);
          el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * val).toLocaleString('en-IN');
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.stats-inner, .stats-bar').forEach(function (el) { obs.observe(el); });
})();
