import { useEffect, useRef } from "react";

const DOT = "112,140,164";

/**
 * The pale moving network drawn behind a block. It fills its parent, stays clear of the words
 * on the left (`clear` is the share of the width kept clear) and drifts away from the pointer.
 */
export function Network({ clear = 0.3 }: { clear?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -999, y: -999 };
    type Dot = { x: number; y: number; vx: number; vy: number; r: number; ring: boolean };
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let frame = 0;

    const size = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, Math.max(18, (w * h) / 15000)));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1.6 + Math.random() * 3,
        ring: Math.random() > 0.5,
      }));
    };
    const fade = (x: number) => {
      const k = Math.max(0, Math.min(1, (x - w * clear) / (w * 0.3)));
      return 0.08 + 0.92 * k * k * (3 - 2 * k);
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const a of dots) {
        const mx = a.x - mouse.x;
        const my = a.y - mouse.y;
        const md = Math.hypot(mx, my);
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
      for (let i = 0; i < dots.length; i++)
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i];
          const b = dots[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d >= 150) continue;
          ctx.strokeStyle = `rgba(${DOT},${(0.38 * fade((a.x + b.x) / 2) * (1 - d / 150)).toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      for (const a of dots) {
        ctx.globalAlpha = fade(a.x);
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, 6.283);
        if (a.ring) {
          ctx.fillStyle = "#F6F8F9";
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = `rgba(${DOT},.7)`;
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${DOT},.6)`;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (!still) frame = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -999;
    };
    const onResize = () => {
      size();
      if (still) draw();
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    size();
    draw();
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [clear]);

  return <canvas ref={ref} aria-hidden="true" />;
}
