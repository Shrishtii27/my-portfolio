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

      // Skill bars (old bar style)
      const fill = entry.target.querySelector(".skill-fill");
      if (fill && !fill.dataset.animated) {
        fill.dataset.animated = "true";
        setTimeout(() => { fill.style.width = fill.dataset.width + "%"; }, 100);
      }

      // Circular ring animation
      const ring = entry.target.querySelector(".ring-fill");
      if (ring && !ring.dataset.animated) {
        ring.dataset.animated = "true";
        const pct = parseInt(ring.dataset.pct) || 0;
        const circumference = 314;
        const offset = circumference - (pct / 100) * circumference;
        setTimeout(() => { ring.style.strokeDashoffset = offset; }, 150);
      }

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -10px 0px" });

  // Observe everything with fade-up-trigger EXCEPT stat-items (handled above)
  document.querySelectorAll(".fade-up-trigger:not(.stat-item)").forEach(el => observer.observe(el));

  // Force show anything already visible on load
  setTimeout(() => {
    document.querySelectorAll(".fade-up-trigger:not(.stat-item)").forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("fade-up");
        const fill = el.querySelector(".skill-fill");
        if (fill && !fill.dataset.animated) {
          fill.dataset.animated = "true";
          setTimeout(() => { fill.style.width = fill.dataset.width + "%"; }, 200);
        }
      }
    });
  }, 150);

  /* =====================
     VIDEO FILTER
  ===================== */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const videoCards = document.querySelectorAll(".video-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      videoCards.forEach(card => {
        card.classList.toggle("hidden", filter !== "all" && card.dataset.type !== filter);
      });
    });
  });

  /* =====================
     LIGHTBOX / VIDEO MODAL
  ===================== */
  const lightbox = document.getElementById("lightbox");
  const lightboxIframe = document.getElementById("lightbox-iframe");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxOverlay = document.getElementById("lightbox-overlay");
  const lightboxContent = document.querySelector(".lightbox-content");

  document.querySelectorAll(".video-thumb").forEach(thumb => {
    thumb.addEventListener("click", () => {
      let src = thumb.dataset.src;
      if (!src) return;

      // Force autoplay on both YouTube and Instagram
      if (src.includes("youtube.com") && !src.includes("autoplay=1")) {
        src += (src.includes("?") ? "&" : "?") + "autoplay=1&mute=0";
      }
      if (src.includes("instagram.com")) {
        src += (src.includes("?") ? "&" : "?") + "autoplay=1";
      }

      // Portrait ratio for Instagram reels, landscape for YouTube
      const isInstagram = thumb.classList.contains("insta-thumb");
      lightboxContent.style.aspectRatio = isInstagram ? "9/16" : "16/9";
      lightboxContent.style.maxHeight = isInstagram ? "85vh" : "";
      lightboxContent.style.width = isInstagram ? "auto" : "";

      lightboxIframe.src = src;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightboxIframe.src = "";
    document.body.style.overflow = "";
    lightboxContent.style.aspectRatio = "";
    lightboxContent.style.maxHeight = "";
    lightboxContent.style.width = "";
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxOverlay.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

  /* =====================
     DYNAMIC TESTIMONIALS
     FROM GOOGLE SHEETS
  ===================== */
  const SHEET_ID = "15MbBznAgI-2xlY7xWE6VFMIt8bHaDgMha-Mji2hjGtI";
  const SHEET_URL = `https://opensheet.elk.sh/${SHEET_ID}/Form%20responses%201`;

  function getInitials(name) {
    if (!name || name.trim() === "") return "??";
    return name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
  }

  const gradients = [
    "linear-gradient(135deg,#a855f7,#ec4899)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
    "linear-gradient(135deg,#06b6d4,#3b82f6)",
    "linear-gradient(135deg,#10b981,#3b82f6)",
    "linear-gradient(135deg,#f97316,#ec4899)",
  ];

  fetch(SHEET_URL)
    .then(res => {
      if (!res.ok) throw new Error("Sheet fetch failed: " + res.status);
      return res.json();
    })
    .then(data => {
      console.log("Sheet data received:", data.length, "rows");
      console.log("First row keys:", data[0] ? Object.keys(data[0]) : "empty");

      const container = document.getElementById("dynamic-testimonials");
      const validEntries = data.filter(entry => {
        // Try all possible key variations
        const name = entry["Your Good Name?"] || entry["Full Name"] || entry["Name"] || "";
        const feedback = entry["Please Give your feedback ."] || entry["Give your feedback"] || entry["Feedback"] || "";
        return name.trim() !== "" && feedback.trim() !== "";
      });

      console.log("Valid entries:", validEntries.length);

      validEntries.forEach((entry, i) => {
        // Handle all possible column name variations
        const name = entry["Your Good Name?"] || entry["Full Name"] || entry["Name"] || "Anonymous";
        const feedback = entry["Please Give your feedback ."] || entry["Give your feedback"] || entry["Feedback"] || "";
        const role = entry["What do you do? (Eg. Content creator, Business owner, Musician)"] || entry["What do you do?"] || "";
        const ratingRaw = entry["Rate Me also"] || entry["Ratings"] || entry["Rating"] || "5";
        const rating = Math.min(5, Math.max(1, parseInt(ratingRaw) || 5));
        const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
        const initials = getInitials(name);
        const gradient = gradients[i % gradients.length];

        const card = document.createElement("div");
        card.className = "t-card fade-up-trigger";
        card.innerHTML = `
          <div class="t-stars">${stars}</div>
          <p class="t-text">"${feedback}"</p>
          <div class="t-profile">
            <div class="t-avatar" style="background:${gradient}">${initials}</div>
            <div>
              <h4>${name}</h4>
              <p>${role}</p>
            </div>
          </div>
        `;
        container.appendChild(card);
        observer.observe(card);
      });
    })
    .catch(err => {
      console.error("Testimonials fetch error:", err);
    });

  /* =====================
     INSTAGRAM THUMBNAILS
     via Microlink API
  ===================== */
  const instaThumbs = document.querySelectorAll(".insta-thumb");

  instaThumbs.forEach((thumb, index) => {
    // Stagger requests so we don't hammer the API
    setTimeout(() => {
      const reelUrl = thumb.dataset.src
        ? thumb.dataset.src.replace("/embed", "")
        : null;

      if (!reelUrl) return;

      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(reelUrl)}&screenshot=true&meta=false&embed=screenshot.url`;

      fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success" && data.data && data.data.screenshot && data.data.screenshot.url) {
            const imgUrl = data.data.screenshot.url;

            // Create img element and inject into the preview
            const preview = thumb.querySelector(".insta-preview");
            if (!preview) return;

            // Build a real thumbnail overlay
            const img = document.createElement("img");
            img.src = imgUrl;
            img.alt = "Reel thumbnail";
            img.style.cssText = `
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 0;
              z-index: 0;
              opacity: 0;
              transition: opacity 0.5s ease;
            `;

            img.onload = () => {
              img.style.opacity = "1";
              // Dim the play icon slightly so it's visible over the image
              const playBig = preview.querySelector(".insta-play-big");
              if (playBig) {
                playBig.style.textShadow = "0 2px 16px rgba(0,0,0,0.9)";
                playBig.style.zIndex = "2";
              }
              const label = preview.querySelector(".insta-label");
              if (label) label.style.zIndex = "2";
              const watermark = preview.querySelector(".insta-watermark");
              if (watermark) watermark.style.zIndex = "2";
            };

            img.onerror = () => {
              // Silently fail — keep the dark gradient fallback
            };

            preview.style.position = "relative";
            preview.insertBefore(img, preview.firstChild);
          }
        })
        .catch(() => {
          // Microlink failed — dark gradient fallback stays, no error shown
        });
    }, index * 300); // 300ms stagger between each request
  });

});