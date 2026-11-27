import "~/styles/home.css";

import { Fragment, useCallback, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { HeroNetwork } from "~/components/HeroNetwork";
import { Highlighted } from "~/components/Highlighted";
import { PersonPhoto } from "~/components/PersonPhoto";
import { ThemeRail } from "~/components/ThemeRail";
import { loadContent } from "~/content/load.server";
import { type Person, displayName } from "~/content/model";
import { pageHead } from "~/content/head";

export async function loader() {
  const { site, people, themes, publications } = loadContent();
  const inGroup = (group: Person["groups"][number]) => people.filter((p) => p.groups.includes(group));
  const card = (p: Person, detail: string | undefined) => ({
    id: p.id,
    name: displayName(p),
    photo: p.photo,
    detail,
  });
  return {
    lab: site.lab,
    themes: themes.map((t) => ({
      id: t.id,
      title: t.title,
      summary: t.summary,
      scene: t.scene,
      // Names here are plain, without titles or nicknames in brackets.
      people: t.people.flatMap((id) => {
        const person = people.find((p) => p.id === id);
        return person ? [{ id, name: person.name.replace(/\s*\([^)]*\)/g, ""), photo: person.photo }] : [];
      }),
    })),
    leaders: inGroup("leader").map((p) => card(p, p.affiliations.join(", "))),
    members: inGroup("member").map((p) => card(p, p.position)),
    publications: publications.slice(0, 5).map((p) => ({
      key: p.key,
      year: p.year,
      title: p.title,
      href: p.href,
      authors: p.authors,
      venue: p.venue,
    })),
    welcome: site.join.welcome,
  };
}

export const meta: Route.MetaFunction = ({ matches }) => pageHead("/", matches);

type Card = Route.ComponentProps["loaderData"]["leaders"][number];

function PersonCard({ person, large }: { person: Card; large?: boolean }) {
  const className = large ? "pp lg" : "pp";
  const inner = (
    <>
      <PersonPhoto person={person} />
      <span>
        <b>{person.name}</b>
        {person.detail && <small>{person.detail}</small>}
      </span>
    </>
  );
  // Each card leads to that person's row on the People page, where their links are.
  return (
    <Link className={className} to={`/people#${person.id}`}>
      {inner}
    </Link>
  );
}

/** The first four authors, then how many more there are; lab people stand out. */
function AuthorLine({ authors }: { authors: { name: string; lab: boolean }[] }) {
  const shown = authors.length <= 5 ? authors : authors.slice(0, 4);
  const more = authors.length - shown.length;
  return (
    <>
      {shown.map((author, i) => (
        <Fragment key={author.name}>
          {i > 0 && ", "}
          {author.lab ? <b>{author.name}</b> : author.name}
        </Fragment>
      ))}
      {more > 0 && ` and ${more} more`}.
    </>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { lab, themes, leaders, members, publications, welcome } = loaderData;
  // The theme shown in the research themes section, and whether the themes still advance by themselves.
  const [theme, setTheme] = useState(0);
  const [auto, setAuto] = useState(true);
  const choose = (index: number) => {
    setAuto(false);
    setTheme(index);
  };
  const advance = useCallback(() => setTheme((index) => (index + 1) % themes.length), [themes.length]);

  return (
    <main id="content" tabIndex={-1} className="p-home">
      <HeroNetwork
        themes={themes}
        onSelect={(index) => {
          choose(index);
          const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          document.getElementById("research")?.scrollIntoView({ behavior: calm ? "auto" : "smooth" });
        }}
      >
        <img className="word" src="/brand/xami-long-navy.png" alt={lab.name} />
        <h1>
          <Highlighted text={lab.heading} highlight={lab.headingHighlight} />
        </h1>
        <p className="lead">{lab.intro}</p>
      </HeroNetwork>

      <ThemeRail themes={themes} current={theme} auto={auto} onChoose={choose} onAdvance={advance} />

      <section className="sec" id="publications" aria-label="Publications">
        <div className="wrap">
          <div className="sec-h">
            <h2>Publications</h2>
            <Link className="more" to="/publications">
              All publications
            </Link>
          </div>
          <ul className="rows2">
            {publications.map((publication) => (
              <li key={publication.key}>
                <time>{publication.year}</time>
                <div>
                  {publication.href ? (
                    <a className="t" href={publication.href}>
                      {publication.title}
                    </a>
                  ) : (
                    <span className="t">{publication.title}</span>
                  )}
                  <p>
                    <AuthorLine authors={publication.authors} /> <i>{publication.venue}</i>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec" id="people" aria-label="People">
        <div className="wrap">
          <div className="sec-h">
            <h2>People</h2>
            <Link className="more" to="/people">
              All people
            </Link>
          </div>
          <p className="grp">Leaders</p>
          <div className="lead2">
            {leaders.map((person) => (
              <PersonCard key={person.id} person={person} large />
            ))}
          </div>
          <p className="grp">Members</p>
          <div className="roster">
            {members.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="join" aria-label="Join us">
        <div className="wrap">
          <div className="join">
            <div>
              <h2>Join us</h2>
              <p className="lead">{welcome}</p>
            </div>
            <Link className="cta" to="/join">
              How to join
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
