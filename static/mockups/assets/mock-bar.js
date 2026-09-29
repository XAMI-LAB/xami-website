// Switcher bar shown at the bottom of every design mockup.
// It is part of the review tool, not part of any design.
(function () {
  var designs = [
    { file: "explain.html", name: "Try an explanation" },
    { file: "map.html", name: "Research map" },
    { file: "paper.html", name: "Working paper" },
    { file: "timeline.html", name: "Lab timeline" },
    { file: "poster.html", name: "Four themes" },
    { file: "finder.html", name: "Search first" },
  ];
  window.XAMI_DESIGNS = designs;

  var page = location.pathname
    .split("/")
    .pop()
    .replace(/\.html$/, "");
  var index = designs.findIndex(function (d) {
    return d.file.replace(/\.html$/, "") === page;
  });
  if (index < 0) return;

  var previous = designs[(index + designs.length - 1) % designs.length];
  var next = designs[(index + 1) % designs.length];

  var style = document.createElement("style");
  style.textContent =
    ".mockbar{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147483000;" +
    "display:flex;align-items:center;gap:4px;padding:5px;border-radius:999px;background:#16202b;color:#fff;" +
    "font:500 13px/1 system-ui,-apple-system,'Segoe UI',sans-serif;box-shadow:0 6px 24px rgba(8,20,32,.35);max-width:calc(100vw - 24px)}" +
    ".mockbar a{color:#fff;text-decoration:none;padding:9px 13px;border-radius:999px;white-space:nowrap}" +
    ".mockbar a:hover,.mockbar a:focus-visible{background:#2c3b4b;outline:none}" +
    ".mockbar span{padding:9px 13px;border-radius:999px;background:#fff;color:#16202b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    "@media (max-width:560px){.mockbar .mockbar-all{display:none}}" +
    "@media print{.mockbar{display:none}}";
  document.head.appendChild(style);

  var bar = document.createElement("nav");
  bar.className = "mockbar";
  bar.setAttribute("aria-label", "Design mockups");
  bar.innerHTML =
    '<a class="mockbar-all" href="index.html">All designs</a>' +
    '<a href="' +
    previous.file +
    '" aria-label="Previous design: ' +
    previous.name +
    '">Previous</a>' +
    "<span>" +
    (index + 1) +
    " of " +
    designs.length +
    ": " +
    designs[index].name +
    "</span>" +
    '<a href="' +
    next.file +
    '" aria-label="Next design: ' +
    next.name +
    '">Next</a>';
  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(bar);
    document.body.style.paddingBottom = "72px";
  });
})();
