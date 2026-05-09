/* ===================================================
   G.R. PORTFOLIO — JS
   Clean · Performant · Zero scroll-jacking
   =================================================== */

/* ====== PRELOADER ====== */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => preloader.classList.add('loaded'), 1600);
  }
});

// Failsafe
setTimeout(() => {
  const p = document.getElementById('preloader');
  if (p && !p.classList.contains('loaded')) p.classList.add('loaded');
}, 4000);

/* ====== CUSTOM CURSOR ====== */
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.transform = `translate(calc(${posX}px - 50%), calc(${posY}px - 50%))`;
    cursorOutline.style.transform = `translate(calc(${posX}px - 50%), calc(${posY}px - 50%))`;
  });

  const interactables = document.querySelectorAll('a, button, input, textarea, select, .hue-slider, [data-service-toggle]');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ====== MAGNETIC BUTTONS ====== */
const magneticElements = document.querySelectorAll('[data-magnetic]');
magneticElements.forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const position = el.getBoundingClientRect();
    const x = e.clientX - position.left - position.width / 2;
    const y = e.clientY - position.top - position.height / 2;
    
    el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    
    // Move the icon a bit more for parallax
    const icon = el.querySelector('.btn-icon');
    if (icon) icon.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = `translate(0px, 0px)`;
    const icon = el.querySelector('.btn-icon');
    if (icon) icon.style.transform = `translate(0px, 0px)`;
  });
});

/* ====== GSAP ORCHESTRATION ====== */
window.addEventListener('load', () => {
  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    gsap.set('.masthead, .lead-story, .feature-aside, .classifieds, .story', { autoAlpha: 0, y: 15 });
    
    tl.to('.masthead', { autoAlpha: 1, y: 0, duration: 1, delay: 0.2 })
      .to('.lead-story', { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.6")
      .to('.feature-aside', { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.6")
      .to('.classifieds', { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.6")
      .to('.story', { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.4");
  }

  // Set Current Date dynamically for the Masthead
  const dateEl = document.getElementById('current-date');
  if(dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.innerText = new Date().toLocaleDateString('en-US', options).toUpperCase();
  }
});

/* ====== MOBILE NAV ====== */
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle-btn');
const navClose = document.getElementById('nav-close');

if (navToggle) navToggle.addEventListener('click', () => navMenu.classList.add('show-menu'));
if (navClose) navClose.addEventListener('click', () => navMenu.classList.remove('show-menu'));
document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => navMenu.classList.remove('show-menu')));

/* ====== PAGE TURNING ROUTER (Event Delegation) ====== */
const sections = document.querySelectorAll('.section');
let isAnimating = false;

// Set default active page
const landingPage = document.getElementById('landing');
if(landingPage) landingPage.classList.add('active-page');

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  
  // If no link, or if it's a download/external link, let the browser handle it
  if(!link || link.hasAttribute('download') || link.target === '_blank') return;
  
  const href = link.getAttribute('href');
  if(href === '#') return; // Skip empty anchors
  
  e.preventDefault();
  if(isAnimating) return;
  
  const targetId = href.substring(1);
  const targetSection = document.getElementById(targetId);
  const currentSection = document.querySelector('.section.active-page');
  
  if(!targetSection || targetSection === currentSection) return;
  
  // Close mobile menu if open
  const navMenu = document.getElementById('nav-menu');
  if(navMenu) navMenu.classList.remove('show-menu');
  
  navigateToSection(currentSection, targetSection, href);
});

// Page Turn Arrow
const pageTurnBtn = document.createElement('div');
pageTurnBtn.className = 'page-turn-btn';
pageTurnBtn.innerHTML = '<i class="ri-arrow-right-line"></i>';
document.body.appendChild(pageTurnBtn);

pageTurnBtn.addEventListener('click', () => {
  if(isAnimating) return;
  const sections = Array.from(document.querySelectorAll('.section'));
  const currentSection = document.querySelector('.section.active-page');
  const currentIndex = sections.indexOf(currentSection);
  const nextIndex = (currentIndex + 1) % sections.length;
  const targetSection = sections[nextIndex];
  const href = '#' + targetSection.id;
  
  navigateToSection(currentSection, targetSection, href);
});

function navigateToSection(currentSection, targetSection, href) {
  isAnimating = true;
  
  // UX fix: Scroll to top immediately so transition is visible in the frame
  window.scrollTo({ top: 0, behavior: 'instant' });
  
  // Update Nav
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active-link'));
  const matchedNavLink = document.querySelector(`.nav-link[href="${href}"]`);
  if(matchedNavLink) matchedNavLink.classList.add('active-link');
  
  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline({ 
      onComplete: () => {
        currentSection.classList.remove('active-page');
        targetSection.classList.add('active-page');
        gsap.set([currentSection, targetSection], { clearProps: "all" });
        window.scrollTo({ top: 0, behavior: 'instant' });
        isAnimating = false;
      } 
    });
    
    // UX-First Editorial Shuffle (Optimized for Single Scroll)
    gsap.set(targetSection, { 
      display: 'block', 
      position: 'relative',
      zIndex: 5, 
      opacity: 0, 
      scale: 0.98,
      x: 0 
    });
    gsap.set(currentSection, { 
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 10 
    });
    
    tl.to(currentSection, { 
        x: '-105%', 
        opacity: 0,
        duration: 0.5, 
        ease: "power2.inOut" 
      })
      .to(targetSection, { 
        opacity: 1, 
        scale: 1,
        duration: 0.4, 
        ease: "power3.out" 
      }, "-=0.3");
      
  } else {
    currentSection.classList.remove('active-page');
    targetSection.classList.add('active-page');
    window.scrollTo(0, 0);
    isAnimating = false;
  }
}

/* ====== THEME ====== */
const themeBtn = document.getElementById('theme-button');
if (themeBtn) {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    themeBtn.classList.replace('ri-moon-line', 'ri-sun-line');
  }
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeBtn.classList.toggle('ri-moon-line', !isDark);
    themeBtn.classList.toggle('ri-sun-line', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

/* ====== HUE SLIDER ====== */
const hueSlider = document.getElementById('hue-slider');
if(hueSlider) {
  hueSlider.addEventListener('input', () => {
    document.documentElement.style.setProperty('--hue', hueSlider.value);
  });
}

/* ====== SERVICES TOGGLE ====== */
document.querySelectorAll('[data-service-toggle]').forEach(header => {
  header.addEventListener('click', () => {
    const card = header.parentElement;
    const body = card.querySelector('.service-body');
    const isActive = card.classList.contains('active');

    // Close all
    document.querySelectorAll('.service-card').forEach(c => {
      c.classList.remove('active');
      c.querySelector('.service-body').style.maxHeight = null;
    });

    if (!isActive) {
      card.classList.add('active');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  });
});

/* ====== FAQ ACCORDION ====== */
document.querySelectorAll('.faq-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isActive = item.classList.contains('active');

    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('active');
      i.querySelector('.faq-answer').style.maxHeight = null;
    });

    if (!isActive) {
      item.classList.add('active');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

/* ====== CONTACT TABS ====== */
document.querySelectorAll('.contact-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active from all tabs and content
    document.querySelectorAll('.contact-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.contact-tab-content').forEach(c => c.classList.remove('active'));

    // Activate clicked tab and matching content
    tab.classList.add('active');
    const target = tab.dataset.tab;
    document.getElementById(`tab-${target}`).classList.add('active');
  });
});

/* ====== CONTACT FORM ====== */
const contactForm = document.getElementById('contact-form');
const formMsg = document.getElementById('message');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (typeof emailjs !== 'undefined') {
      emailjs.sendForm('service_8bt8akq', 'template_bbuikbr', '#contact-form', 'UAD5a48rFPLgFavcC')
        .then(() => {
          formMsg.textContent = 'Message sent successfully!';
          formMsg.style.color = '#22c55e';
          contactForm.reset();
          setTimeout(() => formMsg.textContent = '', 5000);
        }, () => {
          formMsg.textContent = 'Something went wrong. Try again.';
          formMsg.style.color = '#ef4444';
        });
    }
  });
}

/* ====== GSAP (Progressive) ====== */
window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero
  gsap.from('.hero-tagline', { opacity: 0, y: 40, duration: 1, delay: 1.8, ease: 'power3.out' });
  gsap.from('.hero-meta', { opacity: 0, y: 30, duration: 0.8, delay: 2.1, ease: 'power3.out' });
  gsap.from('.hero-cta-btn', { opacity: 0, y: 20, duration: 0.7, delay: 2.3, ease: 'power3.out' });
  gsap.from('.hero-slider', { opacity: 0, y: 20, duration: 0.7, delay: 2.5, ease: 'power3.out' });

  // Sections
  document.querySelectorAll('.section-header').forEach(h => {
    gsap.from(h, { scrollTrigger: { trigger: h, start: 'top 85%' }, opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' });
  });

  // Services
  gsap.from('.service-card', {
    scrollTrigger: { trigger: '.service-card', start: 'top 85%' },
    opacity: 0, y: 25, duration: 0.7, stagger: 0.12, ease: 'power3.out'
  });

  // Projects carousel fade in
  gsap.from('.projects-carousel', {
    scrollTrigger: { trigger: '.projects-carousel', start: 'top 85%' },
    opacity: 0, y: 30, duration: 0.8, ease: 'power3.out'
  });

  // Values
  gsap.from('.value-card', {
    scrollTrigger: { trigger: '.values-grid', start: 'top 85%' },
    opacity: 0, y: 30, duration: 0.7, stagger: 0.12, ease: 'power3.out'
  });

  // Tools
  gsap.from('.tool-group', {
    scrollTrigger: { trigger: '.tools-grid', start: 'top 85%' },
    opacity: 0, y: 25, duration: 0.7, stagger: 0.1, ease: 'power3.out'
  });

  // Testimonials
  gsap.from('.testimonial-card', {
    scrollTrigger: { trigger: '.testimonials-grid', start: 'top 85%' },
    opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: 'power3.out'
  });
});