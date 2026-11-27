// The pale moving network of the home page, drawn behind an inner page's title band.
// It stays clear of the title on the left and answers the pointer.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  Array.prototype.forEach.call(
    document.querySelectorAll("canvas[data-net]"),
    function (c) {
      var host = c.parentNode,
        ctx = c.getContext("2d"),
        dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w,
        h,
        dots = [],
        mouse = { x: -999, y: -999 },
        COL = "112,140,164";
      var clear = parseFloat(c.getAttribute("data-clear") || ".3"); // the share of the width, from the left, kept clear for words
      function size() {
        w = host.clientWidth;
        h = host.clientHeight;
        c.width = w * dpr;
        c.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var n = Math.round(Math.min(70, Math.max(18, (w * h) / 15000)));
        dots = [];
        for (var i = 0; i < n; i++)
          dots.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: 1.6 + Math.random() * 3,
            ring: Math.random() > 0.5,
          });
      }
      function fade(x) {
        var k = Math.max(0, Math.min(1, (x - w * clear) / (w * 0.3)));
        return 0.08 + 0.92 * k * k * (3 - 2 * k);
      }
      function draw() {
        ctx.clearRect(0, 0, w, h);
        var i, j, a, b, d;
        for (i = 0; i < dots.length; i++) {
          a = dots[i];
          var mx = a.x - mouse.x,
            my = a.y - mouse.y,
            md = Math.hypot(mx, my);
          if (md < 150 && md > 0.1) {
            a.vx += (mx / md) * 0.03;
            a.vy += (my / md) * 0.03;
          }
          a.vx *= 0.985;
          a.vy *= 0.985;
          if (Math.abs(a.vx) < 0.07) a.vx += (Math.random() - 0.5) * 0.03;
          if (Math.abs(a.vy) < 0.07) a.vy += (Math.random() - 0.5) * 0.03;
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < -20) a.x = w + 20;
          if (a.x > w + 20) a.x = -20;
          if (a.y < -20) a.y = h + 20;
          if (a.y > h + 20) a.y = -20;
        }
        for (i = 0; i < dots.length; i++)
          for (j = i + 1; j < dots.length; j++) {
            a = dots[i];
            b = dots[j];
            d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 150) {
              ctx.strokeStyle =
                "rgba(" +
                COL +
                "," +
                (0.38 * fade((a.x + b.x) / 2) * (1 - d / 150)).toFixed(3) +
                ")";
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        dots.forEach(function (a) {
          ctx.globalAlpha = fade(a.x);
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.r, 0, 6.283);
          if (a.ring) {
            ctx.fillStyle = "#F6F8F9";
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "rgba(" + COL + ",.7)";
            ctx.stroke();
          } else {
            ctx.fillStyle = "rgba(" + COL + ",.6)";
            ctx.fill();
          }
        });
        ctx.globalAlpha = 1;
        if (!reduce) requestAnimationFrame(draw);
      }
      host.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      });
      host.addEventListener("pointerleave", function () {
        mouse.x = mouse.y = -999;
      });
      window.addEventListener("resize", function () {
        size();
        if (reduce) draw();
      });
      size();
      draw();
    },
  );
})();
