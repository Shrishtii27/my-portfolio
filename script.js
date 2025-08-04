document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-up");
  
          const h2 = entry.target.querySelector("h2");
          if (h2 && h2.hasAttribute("data-count")) {
            const rawTarget = parseInt(h2.getAttribute("data-count"));
            if (!h2.classList.contains("counted") && !isNaN(rawTarget)) {
              let current = 0;
              const step = Math.ceil(rawTarget / 60);
              const interval = setInterval(() => {
                current += step;
                if (current >= rawTarget) {
                  clearInterval(interval);
                  if (h2.innerText.includes('+')) h2.innerText = `${rawTarget}+`;
                  else if (h2.innerText.includes('%')) h2.innerText = `${rawTarget}%`;
                  else h2.innerText = `${rawTarget}`;
                } else {
                  if (h2.innerText.includes('+')) h2.innerText = `${current}+`;
                  else if (h2.innerText.includes('%')) h2.innerText = `${current}%`;
                  else h2.innerText = `${current}`;
                }
              }, 20);
              h2.classList.add("counted");
            }
          }
  
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.4,
    });
  
    // Observe all elements with fade-up animation
    document.querySelectorAll(".fade-up-trigger").forEach(el => {
      observer.observe(el);
    });
  });
  