/* ==========================================================================
   IDEAONE — main.js
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;

  document.addEventListener('DOMContentLoaded', function () {

    /* -------------------------------------------------------------------
       Header scroll state
       ----------------------------------------------------------------- */
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* -------------------------------------------------------------------
       Mobile nav
       ----------------------------------------------------------------- */
    var menuToggle = document.querySelector('.menu-toggle');
    var navLinks = document.querySelector('.nav__links');
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', function () {
        var isOpen = navLinks.classList.toggle('is-open');
        menuToggle.classList.toggle('is-active', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      navLinks.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          navLinks.classList.remove('is-open');
          menuToggle.classList.remove('is-active');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }

    /* -------------------------------------------------------------------
       Hero load-in animation trigger
       ----------------------------------------------------------------- */
    requestAnimationFrame(function () {
      document.body.classList.add('is-loaded');
    });

    /* -------------------------------------------------------------------
       Scroll reveal
       ----------------------------------------------------------------- */
    var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
    if ('IntersectionObserver' in window && revealEls.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* -------------------------------------------------------------------
       Animated stat counters
       ----------------------------------------------------------------- */
    var counters = document.querySelectorAll('[data-counter]');
    if (counters.length) {
      var animateCounter = function (el) {
        var target = parseFloat(el.dataset.counter);
        var decimals = el.dataset.counter.indexOf('.') !== -1 ? el.dataset.counter.split('.')[1].length : 0;
        var duration = 1400;
        var start = null;
        var step = function (ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var value = target * eased;
          el.textContent = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString();
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString();
        };
        requestAnimationFrame(step);
      };
      if ('IntersectionObserver' in window) {
        var counterIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterIo.unobserve(entry.target);
            }
          });
        }, { threshold: 0.4 });
        counters.forEach(function (el) { counterIo.observe(el); });
      } else {
        counters.forEach(function (el) { el.textContent = el.dataset.counter; });
      }
    }

    /* -------------------------------------------------------------------
       Marquee — duplicate track for seamless infinite scroll
       ----------------------------------------------------------------- */
    document.querySelectorAll('.marquee__track').forEach(function (track) {
      if (track.dataset.duplicated) return;
      var clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.parentNode.appendChild(clone);
      track.dataset.duplicated = 'true';
      clone.dataset.duplicated = 'true';
    });

    /* -------------------------------------------------------------------
       Case study cards — expand / collapse (Work page)
       ----------------------------------------------------------------- */
    document.querySelectorAll('.case-card__toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.case-card');
        var isOpen = card.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });

    /* -------------------------------------------------------------------
       Blog category filter
       ----------------------------------------------------------------- */
    var filterButtons = document.querySelectorAll('.blog-filter button');
    var blogCards = document.querySelectorAll('[data-category]');
    if (filterButtons.length) {
      filterButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          filterButtons.forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          var cat = btn.dataset.filter;
          blogCards.forEach(function (card) {
            var show = cat === 'all' || card.dataset.category === cat;
            card.style.display = show ? '' : 'none';
          });
        });
      });
    }

    /* -------------------------------------------------------------------
       Footer year
       ----------------------------------------------------------------- */
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* -------------------------------------------------------------------
       Contact form — client-side validation + submission
       (Replace the form's action endpoint with your Formspree / API URL)
       ----------------------------------------------------------------- */
    var form = document.querySelector('#contact-form');
    if (form) {
      var status = form.querySelector('.form-status');
      var showStatus = function (type, msg) {
        status.className = 'form-status is-visible is-' + type;
        status.querySelector('.msg').textContent = msg;
      };

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Honeypot spam check
        var honey = form.querySelector('input[name="_gotcha"]');
        if (honey && honey.value) { return; }

        // Basic validation
        var required = form.querySelectorAll('[required]');
        var valid = true;
        required.forEach(function (field) {
          if (!field.value.trim()) {
            valid = false;
            field.style.borderColor = 'var(--danger)';
          } else {
            field.style.borderColor = '';
          }
        });
        var email = form.querySelector('input[type="email"]');
        if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
          valid = false;
          email.style.borderColor = 'var(--danger)';
        }
        if (!valid) {
          showStatus('error', 'Please fill in all required fields with a valid email address.');
          return;
        }

        var replyto = form.querySelector('input[name="_replyto"]');
        if (replyto && email) {
          replyto.value = email.value.trim();
        }

        var submitBtn = form.querySelector('button[type="submit"]');
        var originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';

        var endpoint = form.getAttribute('action');
        var isPlaceholder = !endpoint || endpoint.indexOf('your-form-id') !== -1 || endpoint === '#';

        if (isPlaceholder) {
          // No live endpoint configured yet — simulate success so the UI is demonstrable.
          setTimeout(function () {
            showStatus('success', 'Thanks — your message has been received. We\'ll reply within one business day.');
            form.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }, 700);
          return;
        }

        var payload = {
          first_name: form.querySelector('input[name="first_name"]').value.trim(),
          last_name: form.querySelector('input[name="last_name"]').value.trim(),
          email: email.value.trim(),
          handle: form.querySelector('input[name="handle"]').value.trim(),
          company: form.querySelector('input[name="company"]').value.trim(),
          interest: form.querySelector('select[name="interest"]').value,
          message: form.querySelector('textarea[name="message"]').value.trim(),
          whatsapp_ok: form.querySelector('input[name="whatsapp_ok"]').checked ? 'yes' : 'no'
        };

        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }).then(function (res) {
          return res.json().then(function (data) {
            if (res.ok) {
              showStatus('success', 'Thanks — your message has been received. We\'ll reply within one business day.');
              form.reset();
            } else {
              showStatus('error', data && data.error ? data.error : 'Something went wrong sending your message. Please email us directly.');
            }
          }).catch(function () {
            if (res.ok) {
              showStatus('success', 'Thanks — your message has been received. We\'ll reply within one business day.');
              form.reset();
            } else {
              showStatus('error', 'Something went wrong sending your message. Please email us directly.');
            }
          });
        }).catch(function () {
          showStatus('error', 'Something went wrong sending your message. Please email us directly.');
        }).finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
      });
    }

    /* -------------------------------------------------------------------
       Newsletter form (footer)
       ----------------------------------------------------------------- */
    document.querySelectorAll('.newsletter-form').forEach(function (nf) {
      nf.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = nf.querySelector('input');
        if (!input.value.trim()) return;
        input.value = '';
        input.placeholder = 'Thanks — you\u2019re on the list!';
        setTimeout(function () { input.placeholder = 'Your email address'; }, 3000);
      });
    });
  });
})();

