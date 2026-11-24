// Theme toggle (dark by default, remembers your choice)
(function () {
  var root = document.documentElement;
  var btn = document.getElementById("theme-toggle");
  var icon = btn.querySelector("use");

  function isLight() {
    return root.dataset.theme === "light";
  }

  function render() {
    var light = isLight();
    icon.setAttribute("href", light ? "#i-moon" : "#i-sun");
    btn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    btn.dataset.tip = light ? "Dark mode" : "Light mode";
  }

  btn.addEventListener("click", function () {
    var next = isLight() ? "dark" : "light";
    root.dataset.theme = next;
    try { localStorage.setItem("portfolio-theme", next); } catch (e) {}
    render();
  });

  render();

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
