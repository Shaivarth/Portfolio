/**
 * Permanently enforce dark appearance
 */
document.documentElement.classList.add("dark");
try {
  localStorage.setItem("appearance", "dark");
} catch (e) {}

function setThemeColor() {
  var metaThemeColor = document.querySelector("meta[name=theme-color]");
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", "#120f17");
  }
}

function add_to_top_elem() {
  var elem = document.getElementById("to-top");
  if (elem) elem.hidden = true;
}

window.addEventListener("DOMContentLoaded", function () {
  document.documentElement.classList.add("dark");
  setThemeColor();
  add_to_top_elem();
});

