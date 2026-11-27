import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    if (!auto || !inView) return;
    const timer = window.setTimeout(onAdvance, duration);
    return () => window.clearTimeout(timer);
  }, [auto, inView, current, duration, onAdvance]);

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
        >
          <span className="sig" aria-hidden="true" />
          {themes.map((t, index) => (
            <li key={t.id}>
              <button
                type="button"
                role="tab"
                aria-selected={index === current}
                className={index === current && auto && inView ? "run" : undefined}
                onClick={() => onChoose(index)}
              >
                <i />
                <span>{t.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="body">
          <div className="read" role="tabpanel">
            <div key={theme.id}>
              <h3>{theme.title}</h3>
              {theme.summary && <p>{theme.summary}</p>}
              <div className="ppl">
                {theme.people.map((person) => (
                  <span key={person.id}>
                    <PersonPhoto person={person} />
                    {person.name}
                  </span>
                ))}
              </div>
            </div>
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
