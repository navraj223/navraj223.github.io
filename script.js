const revealItems = document.querySelectorAll(".reveal");
const resumePanel = document.querySelector(".resume-panel");
const resumeLinks = document.querySelectorAll('a[href="#resume"]');
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function showReveals() {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  showReveals();
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealItems.forEach((item) => observer.observe(item));
}

function openResumePanel() {
  if (!resumePanel) return;
  resumePanel.open = true;
}

resumeLinks.forEach((link) => {
  link.addEventListener("click", () => {
    openResumePanel();
  });
});

if (window.location.hash === "#resume") {
  openResumePanel();
}
