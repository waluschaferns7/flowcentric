const menuBtn = document.getElementById("menu-btn");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");

function setMenu(open) {
  sidebar.classList.toggle("open", open);
  overlay.classList.toggle("show", open);
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("no-scroll", open);
}

menuBtn.addEventListener("click", () => {
  setMenu(!sidebar.classList.contains("open"));
});

overlay.addEventListener("click", () => setMenu(false));

// Close after choosing a page
sidebar.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

// Close with the Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

// If the window is widened (for example rotating a tablet), reset the menu
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) setMenu(false);
});