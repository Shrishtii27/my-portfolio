document.addEventListener("DOMContentLoaded", () => {

  /* =====================
     NAVBAR SCROLL
  ===================== */
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  });

  /* =====================
     HAMBURGER MENU
  ===================== */
  const hamburger = document.getElementById("hamburger");
  const mobDrawer = document.getElementById("mob-drawer");
  const mobOverlay = document.getElementById("mob-overlay");
  const mobClose = document.getElementById("mob-close");

  function openDrawer() {
    mobDrawer.classList.add("open");
    mobOverlay.classList.add("open");
    hamburger.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    mobDrawer.classList.remove("open");
    mobOverlay.classList.remove("open");
    hamburger.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (hamburger) hamburger.addEventListener("click", openDrawer);
  if (mobClose) mobClose.addEventListener("click", closeDrawer);
  if (mobOverlay) mobOverlay.addEventListener("click", closeDrawer);

  // Close on nav link click
  if (mobDrawer) {
    mobDrawer.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeDrawer);
    });
  }

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeDrawer();
  });

  /* =====================
     PARTICLE CANVAS
  ===================== */
  const canvas = document.getElementById("particles-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let W, H;

  function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function createParticle() {
    const colors = ["rgba(232,201,126,", "rgba(155,93,229,", "rgba(199,125,255,"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.3 + 0.1),
      alpha: Math.random() * 0.6 + 0.2,
      color,
      flicker: Math.random() * 0.012 + 0.004,
      flickerDir: 1,
    };
  }

  for (let i = 0; i < 120; i++) particles.push(createParticle());

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += p.flicker * p.flickerDir;
      if (p.alpha > 0.85 || p.alpha < 0.15) p.flickerDir *= -1;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ")";
      ctx.fill();
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* =====================
     TYPING EFFECT
  ===================== */
  const roles = ["Video Editor", "Reel Creator", "Color Grader", "Motion Designer", "Content Architect"];
  let roleIndex = 0, charIndex = 0, isDeleting = false;
  const typedEl = document.getElementById("typed-text");

  function typeEffect() {
    const current = roles[roleIndex];
    typedEl.textContent = isDeleting ? current.slice(0, charIndex--) : current.slice(0, charIndex++);
    let delay = isDeleting ? 50 : 90;
    if (!isDeleting && charIndex === current.length + 1) { delay = 1800; isDeleting = true; }
    else if (isDeleting && charIndex === -1) { isDeleting = false; charIndex = 0; roleIndex = (roleIndex + 1) % roles.length; delay = 400; }
    setTimeout(typeEffect, delay);
  }
  typeEffect();

  /* =====================
     STAT COUNTERS
     (run independently, not tied to observer)
  ===================== */
  function runCounter(numEl) {
    if (numEl.dataset.counted) return;
    numEl.dataset.counted = "true";
    const target = parseInt(numEl.dataset.count);
    if (isNaN(target)) return;
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      numEl.textContent = current;
    }, 20);
  }

  // Watch each stat item individually
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const numEl = entry.target.querySelector(".stat-num");
      if (numEl) runCounter(numEl);
      entry.target.classList.add("fade-up");
      statObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".stat-item").forEach(el => statObserver.observe(el));

  // Also fire counters if already in view on load
  setTimeout(() => {
    document.querySelectorAll(".stat-item").forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const numEl = el.querySelector(".stat-num");
        if (numEl) runCounter(numEl);
        el.classList.add("fade-up");
      }
    });
  }, 300);


  /* =====================
     FADE-UP OBSERVER
     (for all other elements)
  ===================== */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("fade-up");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -10px 0px" });

  document.querySelectorAll(".fade-up-trigger:not(.stat-item)").forEach(el => observer.observe(el));

  setTimeout(() => {
    document.querySelectorAll(".fade-up-trigger:not(.stat-item)").forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("fade-up");
      }
    });
  }, 150);

  /* ==========================================================
     INLINE VIDEO CAROUSEL (SWIPER)
  ========================================================== */
  const slides = document.querySelectorAll('.swiper-slide');
  const videoModal = document.getElementById("video-modal");
  const videoModalOverlay = document.getElementById("video-modal-overlay");
  const videoModalClose = document.getElementById("video-modal-close");
  const videoModalContent = document.getElementById("video-modal-content");
  const videoModalVideo = document.getElementById("video-modal-video");

  // Initialize Swiper
  const swiper = new Swiper('.works-carousel', {
    effect: 'creative',
    creativeEffect: {
      prev: {
        shadow: true,
        translate: ['-125%', 0, -800],
        rotate: [0, 0, -5],
      },
      next: {
        shadow: true,
        translate: ['125%', 0, -800],
        rotate: [0, 0, 5],
      },
    },
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    spaceBetween: 0,
    rewind: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    },
    navigation: {
      nextEl: '.carousel-nav-next',
      prevEl: '.carousel-nav-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    keyboard: {
      enabled: true,
    },
    mousewheel: {
      forceToAxis: true,
    },
    on: {
      slideChangeTransitionEnd: function () {
        loadActiveSlideIframe();
      },
      init: function () {
        setTimeout(loadActiveSlideIframe, 0);
      },
      click: function (s, e) {
        if (typeof s.clickedIndex === 'undefined') return;

        const slide = s.slides[s.clickedIndex];
        
        if (slide.classList.contains('swiper-slide-active')) {
          const src = slide.dataset.src;
          const isLandscape = slide.classList.contains('landscape-slide');

          if (isLandscape) {
            videoModalContent.classList.add('landscape-ratio');
            videoModalContent.classList.remove('portrait-ratio');
          } else {
            videoModalContent.classList.add('portrait-ratio');
            videoModalContent.classList.remove('landscape-ratio');
          }

          videoModalVideo.src = src;
          videoModal.classList.add("active");
          document.body.style.overflow = 'hidden';
          
          // Pause all background carousel videos to prevent mobile lag
          document.querySelectorAll('.swiper-slide video').forEach(v => v.pause());

          videoModalVideo.play().catch(e => console.error("Autoplay failed:", e));
        } else {
          s.slideTo(s.clickedIndex);
        }
      }
    }
  });

  function loadActiveSlideIframe() {
    const currentSlides = document.querySelectorAll('.swiper-slide');
    currentSlides.forEach(slide => {
      const video = slide.querySelector('video');
      if (!video) return;

      if (slide.classList.contains('swiper-slide-active') && !slide.classList.contains('hidden-slide')) {
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
           playPromise.catch(error => {});
        }
      } else {
        video.pause();
        video.currentTime = 0.5; 
      }
    });
  }

  // Filter Logic for Swiper
  const filterBtns = document.querySelectorAll(".filter-btn");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;

      const wrapper = document.querySelector('.swiper-wrapper');
      wrapper.innerHTML = '';

      slides.forEach(slide => {
        const match = filter === "all" || slide.dataset.type === filter;
        if (match) {
          slide.classList.remove("hidden-slide");
          wrapper.appendChild(slide);
        } else {
          slide.classList.add("hidden-slide");
        }
      });

      swiper.update();
      swiper.slideTo(0, 0); // Slide to 0 with 0ms duration
      loadActiveSlideIframe();
    });
  });

  /* ==========================================================
     FULLSCREEN VIDEO MODAL (On Click)
  ========================================================== */

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove("active");
    if(videoModalVideo) videoModalVideo.pause();
    setTimeout(() => {
      if(videoModalVideo) videoModalVideo.src = "";
      // Resume background video
      loadActiveSlideIframe();
    }, 400);
    document.body.style.overflow = '';
  }

  if(videoModalClose) videoModalClose.addEventListener("click", closeVideoModal);
  if(videoModalOverlay) videoModalOverlay.addEventListener("click", closeVideoModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && videoModal && videoModal.classList.contains("active")) closeVideoModal();
  });

  /* ==========================================================
     DYNAMIC TESTIMONIALS
  ========================================================== */
  const SHEET_ID = "15MbBznAgI-2xlY7xWE6VFMIt8bHaDgMha-Mji2hjGtI";
  const SHEET_URL = `https://opensheet.elk.sh/${SHEET_ID}/Form%20responses%201`;

  fetch(SHEET_URL)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("testimonials-grid");
      if(!container) return;
      const validEntries = data.filter(e => (e["Your Good Name?"] || e["Full Name"] || e["Name"] || "").trim() !== "" && (e["Please Give your feedback ."] || e["Give your feedback"] || e["Feedback"] || "").trim() !== "");

      validEntries.forEach((entry, i) => {
        const name = entry["Your Good Name?"] || entry["Full Name"] || entry["Name"] || "Anonymous";
        const feedback = entry["Please Give your feedback ."] || entry["Give your feedback"] || entry["Feedback"] || "";
        const role = entry["What do you do? (Eg. Content creator, Business owner, Musician)"] || entry["What do you do?"] || "";
        const rating = Math.min(5, Math.max(1, parseInt(entry["Rate Me also"] || entry["Ratings"] || entry["Rating"] || "5")));
        const stars = "&#9733;".repeat(rating) + "&#9734;".repeat(5 - rating);

        const card = document.createElement("div");
        card.className = "t-card fade-up-trigger";
        card.style.animationDelay = `${i * 0.15}s`;
        card.innerHTML = `
          <div class="t-stars">${stars}</div>
          <p class="t-text">"${feedback}"</p>
          <div class="t-profile">
            <div class="t-avatar">${name.charAt(0).toUpperCase()}</div>
            <div>
              <h4>${name}</h4>
              <p>${role}</p>
            </div>
          </div>
        `;
        // Insert right before the dynamic-testimonials anchor if it exists, otherwise append
        const anchor = document.getElementById("dynamic-testimonials");
        if(anchor) {
          container.insertBefore(card, anchor);
        } else {
          container.appendChild(card);
        }
      });
    }).catch(err => console.error("Error fetching testimonials:", err));

});

  /* ==========================================================
     SKILL RING ANIMATION
  ========================================================== */
  const ringObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const ring = entry.target.querySelector('.ring-fill');
        if (ring) {
          const pct = parseFloat(ring.dataset.pct);
          const circumference = 314.159;
          const offset = circumference - (pct / 100) * circumference;
          ring.style.strokeDashoffset = offset;
        }
        ringObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skill-card').forEach(card => {
    ringObserver.observe(card);
  });
