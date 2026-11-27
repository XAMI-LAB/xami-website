import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Person, SceneId } from "~/content/model";
import { Scene, sceneDuration } from "~/scenes/Scene";
import { PersonPhoto } from "./PersonPhoto";

export type RailTheme = {
  id: string;
  title: string;
  summary?: string;
  scene: SceneId;
  people: Pick<Person, "id" | "name" | "photo">[];
};

/**
 * The research themes on a line, with the chosen theme below: its words on the left and its animated
 * example on the right. The themes advance by themselves, each staying for one telling of its example,
 * until the visitor chooses one.
 */
export function ThemeRail({
  themes,
  current,
  auto,
  onChoose,
  onAdvance,
}: {
  themes: RailTheme[];
  current: number;
  /** whether the themes are still advancing by themselves */
  auto: boolean;
  onChoose: (index: number) => void;
  onAdvance: () => void;
}) {
  const stages = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const theme = themes[current];
  const duration = sceneDuration(theme.scene);

  // Examples play, and themes advance, only while the examples can be seen.
  useEffect(() => {
    const el = stages.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Visitors who ask for less motion get no changes by themselves: the first theme stays until they choose.
  useEffect(() => {
    if (!auto || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(onAdvance, duration);
    return () => window.clearTimeout(timer);
  }, [auto, inView, current, duration, onAdvance]);

  // Arrow keys move along the themes, as they do in any set of tabs.
  const onKeyDown = (event: React.KeyboardEvent<HTMLOListElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    const next = event.key === "Home" ? 0 : event.key === "End" ? themes.length - 1 : step ? current + step : undefined;
    if (next === undefined) return;
    event.preventDefault();
    const index = (next + themes.length) % themes.length;
    onChoose(index);
    event.currentTarget.querySelectorAll<HTMLElement>("[role=tab]")[index]?.focus();
  };

  return (
    <section
      className="rt"
      id="research"
      aria-labelledby="rt-h"
      style={{ "--dur": `${duration}ms` } as React.CSSProperties}
    >
      <div className="wrap">
        <h2 className="rt-title" id="rt-h">
          Research themes
        </h2>
        <ol
          className="rail"
          role="tablist"
          aria-label="Research themes"
          style={{ "--n": themes.length } as React.CSSProperties}
          onKeyDown={onKeyDown}
        >
          <li className="sig" role="presentation" aria-hidden="true" />
          {themes.map((t, index) => (
            <li key={t.id} role="presentation">
              <button
                type="button"
                role="tab"
                id={`rt-tab-${t.id}`}
                aria-selected={index === current}
                tabIndex={index === current ? 0 : -1}
                className={index === current && auto && inView ? "run" : undefined}
                onClick={() => onChoose(index)}
              >
                <i />
                <span data-title={t.title}>
                  <span>{t.title}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="body">
          {/* Every theme's name is laid out in the same place, and so are its words, so nothing moves as themes change. */}
          <div className="names">
            {themes.map((t, index) => (
              <h3 key={t.id} className={index === current ? "act" : undefined} aria-hidden={index !== current}>
                {t.title}
              </h3>
            ))}
          </div>
          <div className="read">
            {themes.map((t, index) => (
              <div
                key={t.id}
                role="tabpanel"
                aria-labelledby={`rt-tab-${t.id}`}
                className={index === current ? "act" : undefined}
                inert={index !== current}
              >
                {t.summary && <p>{t.summary}</p>}
                <div className="ppl">
                  {t.people.map((person) => (
                    <Link key={person.id} to={`/people#${person.id}`}>
                      <PersonPhoto person={person} />
                      {person.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="rt-stages" ref={stages}>
            {themes.map((t, index) => (
              <div key={t.id} className={index === current ? "act" : undefined}>
                <Scene id={t.scene} playing={inView && index === current} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
