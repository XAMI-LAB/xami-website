import "~/styles/research.css";

import { type CSSProperties, Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/research";
import { PageTitle } from "~/components/PageTitle";
import { PersonPhoto } from "~/components/PersonPhoto";
import { loadContent } from "~/content/load.server";
import { displayName } from "~/content/model";
import { Scene, type SceneHandle, type SceneId, sceneSteps } from "~/scenes/Scene";
import { WALKTHROUGHS } from "~/scenes/steps";
import { pageHead } from "~/content/head";

/** How many of a theme's papers the page shows. */
const RECENT_PER_THEME = 5;

export async function loader() {
  const { themes, people, publications } = loadContent();
  return {
    themes: themes.map((theme) => {
      return {
        id: theme.id,
        title: theme.title,
        description: theme.description,
        scene: theme.scene,
        people: theme.people.flatMap((id) => {
          const person = people.find((p) => p.id === id);
          return person ? [{ id, name: person.name, title: person.title, photo: person.photo }] : [];
        }),
        // The theme's newest papers; the full list is already ordered newest first.
        publications: publications
          .filter((p) => theme.publications.includes(p.key))
          .slice(0, RECENT_PER_THEME)
          .map(({ key, title, authors, venue, year, href }) => ({ key, title, authors, venue, year, href })),
      };
    }),
  };
}

export const meta: Route.MetaFunction = ({ matches }) => pageHead("/research", matches);

type Theme = Route.ComponentProps["loaderData"]["themes"][number];

/** How many authors a publication names before the rest are counted. */
const AUTHORS_SHOWN = 4;

export default function Research({ loaderData }: Route.ComponentProps) {
  const { themes } = loaderData;
  const page = useRef<HTMLElement>(null);
  const [reading, setReading] = useState<string>();

  // The rail marks the theme that is crossing a band a little above the middle of the window.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setReading(entry.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    page.current?.querySelectorAll(".chap").forEach((chapter) => observer.observe(chapter));
    return () => observer.disconnect();
  }, []);

  return (
    <main id="content" tabIndex={-1} className="p-research" ref={page}>
      <PageTitle>Research themes</PageTitle>
      <nav className="subnav" aria-label="Research themes">
        <div className="wrap">
          <ol style={{ "--n": themes.length } as CSSProperties}>
            {themes.map((theme) => (
              <li key={theme.id}>
                <a href={`#${theme.id}`} className={theme.id === reading ? "cur" : undefined}>
                  <i />
                  <span>{theme.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>
      {themes.map((theme, i) => (
        <article className="chap" id={theme.id} key={theme.id}>
          <div className="wrap">
            <div className="chap-h">
              <span className="chap-no" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2>{theme.title}</h2>
            </div>
            <div className="chap-top">
              <div className="desc">
                {theme.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div>
                <p className="lbl">People</p>
                <div className="wgrid">
                  {theme.people.map((person) => (
                    <Link className="w" key={person.id} to={`/people#${person.id}`}>
                      <PersonPhoto person={person} />
                      <b>{displayName(person)}</b>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="ex">
              <p className="lbl">Example</p>
              <Example scene={theme.scene} />
            </div>
            <div className="pubs">
              <div className="pubs-h">
                <p className="lbl">Recent publications</p>
                <Link className="more" to="/publications">
                  All publications
                </Link>
              </div>
              {theme.publications.length ? (
                <ul className="plist">
                  {theme.publications.map((publication) => (
                    <PublicationRow key={publication.key} publication={publication} />
                  ))}
                </ul>
              ) : (
                <p className="todo">Publications to come.</p>
              )}
            </div>
          </div>
        </article>
      ))}
    </main>
  );
}

/** A theme's scene beside its walkthrough. The walkthrough follows the story, and clicking a line shows that moment. */
function Example({ scene }: { scene: SceneId }) {
  const stage = useRef<HTMLDivElement>(null);
  const player = useRef<SceneHandle>(null);
  const [inView, setInView] = useState(false);
  const [current, setCurrent] = useState(-1);
  const walkthrough = WALKTHROUGHS[scene];

  // The story runs only while most of the scene can be seen, and starts over each time it comes back.
  useEffect(() => {
    if (!stage.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.45 });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  // The line being told is the last one whose step the story has reached.
  const follow = (step: string) => {
    const order = sceneSteps(scene);
    const reached = order.indexOf(step);
    setCurrent(walkthrough.findLastIndex((line) => order.indexOf(line.step) <= reached));
  };

  return (
    <div className="ex-row">
      <div ref={stage}>
        <Scene id={scene} playing={inView} onStep={follow} ref={player} />
      </div>
      <div className="walk">
        {walkthrough.map((line, k) => (
          <button
            type="button"
            key={line.step}
            className={k === current ? "on" : k < current ? "done" : undefined}
            onClick={() => player.current?.show(line.step)}
          >
            <em>{k + 1}</em>
            <span>{line.caption}</span>
          </button>
        ))}
        <button type="button" className="replay" onClick={() => player.current?.play()}>
          Play again
        </button>
      </div>
    </div>
  );
}

function PublicationRow({ publication }: { publication: Theme["publications"][number] }) {
  const { title, authors, venue, year, href } = publication;
  const more = authors.length - AUTHORS_SHOWN;
  return (
    <li>
      <time>{year}</time>
      <div>
        {href ? (
          <a className="t" href={href}>
            {title}
          </a>
        ) : (
          <span className="t">{title}</span>
        )}
        <p>
          {authors.slice(0, AUTHORS_SHOWN).map((author, i) => (
            <Fragment key={i}>
              {i > 0 && ", "}
              {author.lab ? <b>{author.name}</b> : author.name}
            </Fragment>
          ))}
          {more > 0 && ` and ${more} more`}. <i>{venue}</i>
        </p>
      </div>
    </li>
  );
}
