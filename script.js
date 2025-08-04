document.addEventListener("DOMContentLoaded", () => {
  // Counter animation and fade-up effect
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
            const hasPlus = h2.innerText.includes('+');
            const hasPercent = h2.innerText.includes('%');

            const interval = setInterval(() => {
              current += step;
              if (current >= rawTarget) {
                clearInterval(interval);
                if (hasPlus) h2.innerText = rawTarget + '+';
                else if (hasPercent) h2.innerText = rawTarget + '%';
                else h2.innerText = rawTarget;
              } else {
                if (hasPlus) h2.innerText = current + '+';
                else if (hasPercent) h2.innerText = current + '%';
                else h2.innerText = current;
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

  document.querySelectorAll(".fade-up-trigger").forEach(el => {
    observer.observe(el);
  });

  // 🔤 Helper: Get initials from name
  function getInitials(name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // 📝 Fetch testimonials from Google Sheets
  fetch("https://opensheet.elk.sh/1Zx3rPDY5yxSPcNwG0UViH7zDe-S1_BLx1l0mOfdOQX0/Form%20responses%201")
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch data");
      return res.json();
    })
    .then(data => {
      const container = document.getElementById("dynamic-testimonials");
      data.forEach(entry => {
        const card = document.createElement("div");
        card.className = "testimonial-card fade-up-trigger";
        card.innerHTML = `
          <p class="testimonial-text">"${entry['Give your feedback']}"</p>
          <div class="testimonial-profile">
            <div class="avatar-initials">${getInitials(entry['Full Name'])}</div>
            <div>
              <h4>${entry['Full Name']}</h4>
              <p>${entry['What do you do? (Eg. Content creator, Business owner, Musician)']}</p>
              <p class="testimonial-rating">⭐ ${entry['Ratings']}/5</p>
            </div>
          </div>
        `;
        container.appendChild(card);
        observer.observe(card);
      });
    })
    .catch(error => console.error("Error fetching testimonials:", error));
});
