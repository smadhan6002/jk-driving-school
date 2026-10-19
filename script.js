/**
 * JK DRIVING SCHOOL — Interaction, Gallery & Lead Controller
 * Minimal, High-Performance, Accessible Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  try { localStorage.removeItem('jk-selected-theme'); } catch(e) {}

  // ============================================================
  // 0. PREMIUM BRAND LOADING SCREEN CONTROLLER
  // ============================================================
  const loader = document.getElementById('premium-loader');
  const progressBar = document.getElementById('loader-progress-bar');

  if (loader) {
    const startTime = performance.now();
    const MINIMUM_DURATION_MS = 1800; // Target 1.8s - 2.2s for smooth luxury pacing
    let isPageLoaded = false;
    let isLoaderDismissed = false;

    // Simulate natural progressive loading
    const progressTimeline = [
      { time: 150, percent: 30 },
      { time: 500, percent: 65 },
      { time: 1000, percent: 88 },
      { time: 1400, percent: 94 }
    ];

    const timeouts = [];

    progressTimeline.forEach(({ time, percent }) => {
      const t = setTimeout(() => {
        if (!isLoaderDismissed && progressBar) {
          progressBar.style.width = `${percent}%`;
        }
      }, time);
      timeouts.push(t);
    });

    function completeLoadingSequence() {
      if (isLoaderDismissed) return;
      isLoaderDismissed = true;

      // Clear pending timeline ticks
      timeouts.forEach(t => clearTimeout(t));

      // Fill progress bar to 100%
      if (progressBar) {
        progressBar.style.width = '100%';
      }

      // Small pause at 100% so the user perceives completion
      setTimeout(() => {
        // Trigger smooth luxury exit transition
        loader.classList.add('loader-finished');

        // Allow transition to complete before removing from interaction flow
        setTimeout(() => {
          document.body.classList.remove('loading-locked');
          loader.style.display = 'none';
          loader.setAttribute('aria-hidden', 'true');
        }, 650);
      }, 250);
    }

    function checkReady() {
      if (!isPageLoaded) return;
      const elapsedTime = performance.now() - startTime;
      const remainingTime = Math.max(0, MINIMUM_DURATION_MS - elapsedTime);

      setTimeout(completeLoadingSequence, remainingTime);
    }

    if (document.readyState === 'complete') {
      isPageLoaded = true;
      checkReady();
    } else {
      window.addEventListener('load', () => {
        isPageLoaded = true;
        checkReady();
      });
    }

    // Safety fallback: dismiss after 4.5 seconds under any network contingency
    setTimeout(() => {
      if (!isLoaderDismissed) {
        completeLoadingSequence();
      }
    }, 4500);
  }

  // ============================================================
  // 1. NAVBAR SCROLL EFFECT & 5-SECTION ACTIVE SPY
  // ============================================================
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Update active nav link based on scroll position
    const scrollPos = window.scrollY + 220;
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ============================================================
  // 2. MOBILE DRAWER NAVIGATION
  // ============================================================
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-drawer-btn');

  function openDrawer() {
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    drawerBackdrop.classList.add('active');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    drawerBackdrop.classList.remove('active');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeDrawer);
  }

  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // ============================================================
  // 3. HERO ENTRANCE & SCROLL REVEAL OBSERVER
  // ============================================================
  const heroRevealItems = document.querySelectorAll('.hero-section .reveal-item');
  heroRevealItems.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('revealed');
    }, 120 + index * 100);
  });

  const scrollElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    scrollElements.forEach((el) => observer.observe(el));
  } else {
    scrollElements.forEach((el) => el.classList.add('revealed'));
  }

  // ============================================================
  // 4. HIGHLIGHT TODAY IN BUSINESS HOURS
  // ============================================================
  const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, ...
  const hourRows = document.querySelectorAll('.hours-timetable .hours-row');
  hourRows.forEach((row) => {
    const dayAttr = row.getAttribute('data-day');
    if (dayAttr !== null && parseInt(dayAttr, 10) === currentDay) {
      row.classList.add('today');
      const dayName = row.querySelector('.day-name');
      if (dayName) {
        dayName.innerHTML += ' <em>(Today)</em>';
      }
    }
  });

    // ============================================================
  // 5. GALLERY CATEGORY FILTER TABS
  // ============================================================
  const filterTabs = document.querySelectorAll('.gallery-tab');
  const gridItems = document.querySelectorAll('.gallery-grid-item');

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      gridItems.forEach((item) => {
        const itemCat = item.getAttribute('data-category');
        if (filter === 'all' || itemCat === filter) {
          item.style.display = 'block';
          // Re-trigger smooth subtle animation
          item.style.animation = 'none';
          void item.offsetHeight;
          item.style.animation = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // ============================================================
  // 6. LIGHTBOX MODAL VIEWER (Clean image preview, no browsing arrows)
  // ============================================================
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  function openLightbox(item) {
    if (!item) return;
    const src = item.getAttribute('data-src');
    const title = item.getAttribute('data-title');
    const desc = item.getAttribute('data-desc');

    if (lightboxImg) lightboxImg.src = src;
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxDesc) lightboxDesc.textContent = desc;

    if (lightboxModal) {
      lightboxModal.classList.add('open');
      lightboxModal.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('open');
      lightboxModal.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  gridItems.forEach((item) => {
    item.addEventListener('click', () => {
      openLightbox(item);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
  });

  // ============================================================
  // 8. PRE-SELECT SERVICE ON CTA CLICK
  // ============================================================
  const preselectBtns = document.querySelectorAll('[data-preselect]');
  const serviceSelect = document.getElementById('serviceRequired');

  preselectBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetService = btn.getAttribute('data-preselect');
      if (targetService && serviceSelect) {
        serviceSelect.value = targetService;
        serviceSelect.classList.remove('invalid');
        const parentGroup = serviceSelect.closest('.form-group');
        if (parentGroup) parentGroup.classList.remove('has-error');
      }
    });
  });

  // ============================================================
  // 9. LEAD ENQUIRY FORM VALIDATION & WHATSAPP CONNECTION
  // ============================================================
  const leadForm = document.getElementById('lead-form');
  const nameInput = document.getElementById('fullName');
  const phoneInput = document.getElementById('phoneNumber');
  const messageInput = document.getElementById('userMessage');
  const formFeedback = document.getElementById('formFeedback');

  if (leadForm) {
    // Clear validation error on user input / change
    [nameInput, phoneInput, serviceSelect].forEach((input) => {
      if (!input) return;
      const clearError = () => {
        input.classList.remove('invalid');
        const group = input.closest('.form-group');
        if (group) group.classList.remove('has-error');
      };
      input.addEventListener('input', clearError);
      input.addEventListener('change', clearError);
    });

    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate Name
      const nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal || nameVal.length < 2) {
        if (nameInput) {
          nameInput.classList.add('invalid');
          const group = nameInput.closest('.form-group');
          if (group) group.classList.add('has-error');
        }
        isValid = false;
      } else if (nameInput) {
        nameInput.classList.remove('invalid');
        const group = nameInput.closest('.form-group');
        if (group) group.classList.remove('has-error');
      }

      // Validate Phone (10 digits approx)
      const rawPhone = phoneInput ? phoneInput.value.trim() : '';
      const phoneVal = rawPhone.replace(/\D/g, '');
      if (phoneVal.length < 10) {
        if (phoneInput) {
          phoneInput.classList.add('invalid');
          const group = phoneInput.closest('.form-group');
          if (group) group.classList.add('has-error');
        }
        isValid = false;
      } else if (phoneInput) {
        phoneInput.classList.remove('invalid');
        const group = phoneInput.closest('.form-group');
        if (group) group.classList.remove('has-error');
      }

      // Validate Service Dropdown
      const serviceVal = serviceSelect ? serviceSelect.value : '';
      if (!serviceVal) {
        if (serviceSelect) {
          serviceSelect.classList.add('invalid');
          const group = serviceSelect.closest('.form-group');
          if (group) group.classList.add('has-error');
        }
        isValid = false;
      } else if (serviceSelect) {
        serviceSelect.classList.remove('invalid');
        const group = serviceSelect.closest('.form-group');
        if (group) group.classList.remove('has-error');
      }

      if (!isValid) return;

      // Form is valid — Format pre-filled WhatsApp message & auto-open WhatsApp
      const userMsg = (messageInput && messageInput.value.trim()) ? messageInput.value.trim() : 'N/A';

      const submitBtn = document.getElementById('submitBtn');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>OPENING WHATSAPP...</span>';
      }

      const whatsappText = `Hello JK Driving School! 👋\n\nI would like to make an enquiry:\n\n👤 *Name:* ${nameVal}\n📞 *Phone:* ${phoneVal}\n🚘 *Service Needed:* ${serviceVal}\n💬 *Message/Notes:* ${userMsg}\n\nPlease get in touch with me. Thank you!`;

      const whatsappUrl = `https://wa.me/919841589252?text=${encodeURIComponent(whatsappText)}`;

      // Automatically open WhatsApp in a new tab/app
      window.open(whatsappUrl, '_blank');

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        formFeedback.className = 'form-feedback success';
        formFeedback.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <strong style="font-size: 0.98rem; color: #15803D; display: flex; align-items: center; gap: 6px;">
              <span>✅ Connecting to WhatsApp...</span>
            </strong>
            <p style="margin: 0; color: var(--text-body); font-size: 0.85rem;">
              Thank you, <strong>${escapeHtml(nameVal)}</strong>! Your enquiry details have been pre-filled into WhatsApp.
            </p>
            <div style="margin-top: 6px;">
              <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp-solid" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; padding: 10px 18px; font-weight: 700; font-size: 0.85rem; width: 100%; border-radius: var(--radius-sm);">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.031 2c-5.514 0-9.997 4.484-9.997 9.998 0 1.764.459 3.488 1.332 5.006l-1.366 4.992 5.111-1.34c1.467.8 3.13 1.222 4.92 1.222 5.514 0 9.998-4.484 9.998-9.998 0-5.514-4.484-9.998-9.998-9.998zm0 18.252c-1.547 0-3.056-.414-4.37-1.198l-.313-.186-3.033.795.809-2.955-.205-.326c-.859-1.365-1.314-2.946-1.314-4.582 0-4.551 3.703-8.254 8.256-8.254 4.551 0 8.254 3.703 8.254 8.254 0 4.552-3.703 8.256-8.254 8.256zm4.526-6.183c-.248-.124-1.467-.724-1.694-.807-.228-.083-.393-.124-.559.124-.165.248-.642.807-.787.973-.145.165-.29.186-.538.062-.248-.124-1.048-.386-1.996-1.232-.738-.658-1.236-1.47-1.381-1.718-.145-.248-.015-.383.109-.506.111-.111.248-.29.372-.435.124-.145.165-.248.248-.414.083-.165.041-.311-.021-.435-.062-.124-.559-1.346-.765-1.843-.201-.486-.406-.42-.559-.427h-.476c-.165 0-.435.062-.663.311-.228.248-.87.85-.87 2.073 0 1.222.89 2.401 1.014 2.567.124.165 1.752 2.675 4.244 3.751.593.256 1.056.409 1.417.524.595.189 1.136.162 1.564.098.477-.071 1.467-.6 1.674-1.18.207-.58.207-1.076.145-1.18-.062-.104-.228-.166-.476-.29z"/>
                </svg>
                <span>Click here if WhatsApp did not open automatically &rarr;</span>
              </a>
            </div>
          </div>
        `;

        leadForm.reset();
      }, 400);
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, (tag) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[tag] || tag));
  }

  // ============================================================
  // 10. SERVICE ENQUIRY MODAL — One reusable form for all cards
  // ============================================================
  const svcEnquiryOverlay = document.getElementById('svcEnquiryOverlay');
  const svcEnquiryModal   = document.getElementById('svcEnquiryModal');
  const svcEnquiryClose   = document.getElementById('svcEnquiryClose');
  const svcEnquiryForm    = document.getElementById('svcEnquiryForm');
  const svcEqName         = document.getElementById('svcEqName');
  const svcEqPhone        = document.getElementById('svcEqPhone');
  const svcEqService      = document.getElementById('svcEqService');
  const svcEqSubmit       = document.getElementById('svcEqSubmit');

  // Groups (for error state)
  const svcEqGroupName    = document.getElementById('svcEqGroupName');
  const svcEqGroupPhone   = document.getElementById('svcEqGroupPhone');
  const svcEqGroupService = document.getElementById('svcEqGroupService');

  // WhatsApp business number — reads from existing site config (919841589252)
  const WA_NUMBER = '919841589252';

  /**
   * openServiceEnquiry(serviceName)
   * Called from onclick on every service card's ENQUIRE NOW button.
   * Auto-selects the correct service in the dropdown.
   */
  window.openServiceEnquiry = function(serviceName) {
    if (!svcEnquiryOverlay || !svcEqService) return;

    // Pre-select the service
    svcEqService.value = serviceName;

    // Clear any previous error states
    [svcEqGroupName, svcEqGroupPhone, svcEqGroupService].forEach(g => {
      if (g) g.classList.remove('has-error');
    });
    [svcEqName, svcEqPhone, svcEqService].forEach(inp => {
      if (inp) inp.classList.remove('invalid');
    });

    // Open modal
    svcEnquiryOverlay.classList.add('is-open');
    svcEnquiryOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus the name field for accessibility & UX
    setTimeout(() => {
      if (svcEqName) svcEqName.focus();
    }, 300);
  };

  function closeSvcEnquiry() {
    if (!svcEnquiryOverlay) return;
    svcEnquiryOverlay.classList.remove('is-open');
    svcEnquiryOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function resetSvcEnquiry() {
    if (svcEnquiryForm) svcEnquiryForm.reset();
    [svcEqGroupName, svcEqGroupPhone, svcEqGroupService].forEach(g => {
      if (g) g.classList.remove('has-error');
    });
    [svcEqName, svcEqPhone, svcEqService].forEach(inp => {
      if (inp) inp.classList.remove('invalid');
    });
  }

  // Close via X button
  if (svcEnquiryClose) {
    svcEnquiryClose.addEventListener('click', () => {
      closeSvcEnquiry();
    });
  }

  // Close via backdrop click (outside modal box)
  if (svcEnquiryOverlay) {
    svcEnquiryOverlay.addEventListener('click', (e) => {
      if (e.target === svcEnquiryOverlay) {
        closeSvcEnquiry();
      }
    });
  }

  // Close via Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && svcEnquiryOverlay && svcEnquiryOverlay.classList.contains('is-open')) {
      closeSvcEnquiry();
    }
  });

  // Clear error on user interaction
  if (svcEqName) {
    svcEqName.addEventListener('input', () => {
      svcEqName.classList.remove('invalid');
      if (svcEqGroupName) svcEqGroupName.classList.remove('has-error');
    });
  }
  if (svcEqPhone) {
    svcEqPhone.addEventListener('input', () => {
      // Strip non-digits as user types
      svcEqPhone.value = svcEqPhone.value.replace(/\D/g, '').slice(0, 10);
      svcEqPhone.classList.remove('invalid');
      if (svcEqGroupPhone) svcEqGroupPhone.classList.remove('has-error');
    });
  }
  if (svcEqService) {
    svcEqService.addEventListener('change', () => {
      svcEqService.classList.remove('invalid');
      if (svcEqGroupService) svcEqGroupService.classList.remove('has-error');
    });
  }

  // Form submission
  if (svcEnquiryForm) {
    svcEnquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // — Validate Name —
      const nameVal = svcEqName ? svcEqName.value.trim() : '';
      if (!nameVal || nameVal.length < 2) {
        if (svcEqName) svcEqName.classList.add('invalid');
        if (svcEqGroupName) svcEqGroupName.classList.add('has-error');
        isValid = false;
      }

      // — Validate Mobile Number (10-digit Indian number starting with 6–9) —
      const rawPhone  = svcEqPhone ? svcEqPhone.value.trim() : '';
      const phoneVal  = rawPhone.replace(/\D/g, '');
      const phoneValid = /^[6-9]\d{9}$/.test(phoneVal);
      if (!phoneValid) {
        if (svcEqPhone) svcEqPhone.classList.add('invalid');
        if (svcEqGroupPhone) svcEqGroupPhone.classList.add('has-error');
        isValid = false;
      }

      // — Validate Service —
      const serviceVal = svcEqService ? svcEqService.value.trim() : '';
      if (!serviceVal) {
        if (svcEqService) svcEqService.classList.add('invalid');
        if (svcEqGroupService) svcEqGroupService.classList.add('has-error');
        isValid = false;
      }

      if (!isValid) return;

      // — Build WhatsApp message —
      const waMessage =
`Hello JK Driving School,

I would like to enquire about one of your services.

Name: ${nameVal}
Mobile Number: ${phoneVal}
Service Required: ${serviceVal}

Please share more details.

Thank you.`;

      const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;

      // Disable button to prevent double-submit
      if (svcEqSubmit) {
        svcEqSubmit.disabled = true;
        const originalHTML = svcEqSubmit.innerHTML;
        svcEqSubmit.innerHTML = '<span>OPENING WHATSAPP...</span>';

        // Open WhatsApp
        window.open(waUrl, '_blank');

        setTimeout(() => {
          svcEqSubmit.disabled = false;
          svcEqSubmit.innerHTML = originalHTML;
          closeSvcEnquiry();
          resetSvcEnquiry();
        }, 1500);
      } else {
        window.open(waUrl, '_blank');
        closeSvcEnquiry();
        resetSvcEnquiry();
      }
    });
  }

});
