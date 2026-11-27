import { useEffect, useRef } from "react";

const DOT = "112,140,164";
const TEAL = "10,107,124";

type ThemeLabel = { id: string; title: string };

/**
 * The opening screen's network: pale drifting dots behind the words, and on the right the research
 * themes as ring nodes linked in one chain, each with its name beside it. Pointing at a theme lights
 * up the dots around it; choosing one hands its position in the list to `onSelect`.
 */
export function HeroNetwork({
  themes,
  onSelect,
  children,
}: {
  themes: ThemeLabel[];
  onSelect: (index: number) => void;
  children: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    const labels = Array.from(listRef.current?.querySelectorAll("a") ?? []);
    if (!canvas || !host || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -999, y: -999 };
    type Node = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      ring: boolean;
      anchor?: { x: number; y: number; phase: number; el: HTMLElement };
    };
    let nodes: Node[] = [];
    let themeNodes: Node[] = [];
    let w = 0;
    let h = 0;
    let wide = true;
    let textEdge = 0;
    let tick = 0;
    let frame = 0;

    const size = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wide = w > 1020;
      const count = Math.round(Math.min(110, Math.max(34, (w * h) / 15000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: 2 + Math.random() * 4.5,
        ring: Math.random() > 0.5,
      }));
      // The theme nodes are held near fixed spots in the right part of the content column, staggered like a network.
      const wrapWidth = Math.min(1240, w);
      const left = (w - wrapWidth) / 2 + 28;
      const right = left + wrapWidth - 56;
      const x0 = left + (right - left) * 0.62;
      const span = right - 250 - x0;
      textEdge = left + (right - left) * 0.56;
      const xs = [0.25, 0.85, 0.05, 0.65, 0.3];
      const ys = [0.2, 0.34, 0.5, 0.64, 0.8];
      themeNodes = labels.map((el, k) => {
        const ax = x0 + span * xs[k % xs.length];
        const ay = h * ys[k % ys.length];
        return {
          x: ax,
          y: ay,
          vx: 0,
          vy: 0,
          r: 8,
          ring: true,
          anchor: { x: ax, y: ay, phase: Math.random() * 6.28, el },
        };
      });
      nodes = nodes.concat(themeNodes);
    };
    // How strongly the background shows at x: faint over the words, full on the right.
    const fade = (x: number) => {
      if (!wide) return 0.5;
      const k = Math.max(0, Math.min(1, (x - (textEdge - 260)) / 300));
      return 0.1 + 0.9 * k * k * (3 - 2 * k);
    };
    const line = (a: { x: number; y: number }, b: { x: number; y: number }, style: string, width: number) => {
      ctx.strokeStyle = style;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };

    const draw = () => {
      tick += 1;
      ctx.clearRect(0, 0, w, h);
      for (const a of nodes) {
        if (a.anchor) {
          // A theme node drifts gently round its spot so its name stays readable.
          a.x = a.anchor.x + Math.sin(tick / 160 + a.anchor.phase) * 10;
          a.y = a.anchor.y + Math.cos(tick / 190 + a.anchor.phase) * 8;
          continue;
        }
        const mx = a.x - mouse.x;
        const my = a.y - mouse.y;
        const md = Math.hypot(mx, my);
        if (md < 170 && md > 0.1) {
          a.vx += (mx / md) * 0.035;
          a.vy += (my / md) * 0.035;
        }
        a.vx *= 0.985;
        a.vy *= 0.985;
        if (Math.abs(a.vx) < 0.08) a.vx += (Math.random() - 0.5) * 0.03;
        if (Math.abs(a.vy) < 0.08) a.vy += (Math.random() - 0.5) * 0.03;
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < -20) a.x = w + 20;
        if (a.x > w + 20) a.x = -20;
        if (a.y < -20) a.y = h + 20;
        if (a.y > h + 20) a.y = -20;
      }

      // The active theme: its name under the pointer, or the pointer near its node.
      let active: Node | null = null;
      if (wide)
        for (const t of themeNodes)
          if (t.anchor!.el.matches(":hover") || Math.hypot(t.x - mouse.x, t.y - mouse.y) < 40) active = t;
      const near = (n: Node) => active !== null && Math.hypot(n.x - active.x, n.y - active.y) < 200;

      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d >= 150) continue;
          const lit = active !== null && (a === active || b === active || (near(a) && near(b)));
          const strength = active ? (lit ? 2.2 : 0.35) : 1;
          const alpha = Math.min(0.9, 0.38 * strength * fade((a.x + b.x) / 2) * (1 - d / 150)).toFixed(3);
          line(a, b, `rgba(${lit ? TEAL : DOT},${alpha})`, lit ? 1.6 : 1.3);
        }
      if (active)
        for (const n of nodes) {
          if (n === active || n.anchor) continue;
          const d = Math.hypot(n.x - active.x, n.y - active.y);
          if (d < 200) line(active, n, `rgba(${TEAL},${(0.5 * (1 - d / 200)).toFixed(3)})`, 1.2);
        }
      // The themes are linked as one group, a small signal running along each link.
      if (wide)
        for (let i = 0; i < themeNodes.length - 1; i++) {
          const a = themeNodes[i];
          const b = themeNodes[i + 1];
          line(a, b, `rgba(${TEAL},.25)`, 1.2);
          if (still) continue;
          const f = ((tick + i * 70) % 220) / 220;
          if (f >= 0.8) continue;
          const q = f / 0.8;
          ctx.fillStyle = `rgba(${TEAL},${(0.75 * Math.sin(q * Math.PI)).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(a.x + (b.x - a.x) * q, a.y + (b.y - a.y) * q, 3, 0, 6.283);
          ctx.fill();
        }
      for (const a of nodes) {
        if (a.anchor && !wide) continue;
        const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (d < 190) line(a, mouse, `rgba(${DOT},${(0.5 * fade(a.x) * (1 - d / 190)).toFixed(3)})`, 1.2);
        if (a.anchor) {
          const on = a === active;
          ctx.beginPath();
          ctx.arc(a.x, a.y, on ? 7.5 : 6.5, 0, 6.283);
          ctx.fillStyle = on ? "#0A6B7C" : "#F6F8F9";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#0A6B7C";
          ctx.stroke();
          a.anchor.el.style.transform = `translate(${a.x}px,${a.y - 12}px)`;
          a.anchor.el.classList.toggle("on", on);
          continue;
        }
        ctx.globalAlpha = (active && !near(a) ? 0.45 : 1) * fade(a.x);
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r * 0.75, 0, 6.283);
        if (a.ring) {
          ctx.fillStyle = "#F6F8F9";
          ctx.fill();
          ctx.lineWidth = 1.6;
          ctx.strokeStyle = `rgba(${DOT},.7)`;
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${DOT},.6)`;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
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
  }, [themes.length]);

  return (
    <section className="hero">
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="wrap">
        {children}
        <ul className="themes" ref={listRef} aria-label="Research themes">
          {themes.map((theme, index) => (
            <li key={theme.id}>
              <a
                href="#research"
                onClick={(event) => {
                  event.preventDefault();
                  onSelect(index);
                }}
              >
                {theme.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
