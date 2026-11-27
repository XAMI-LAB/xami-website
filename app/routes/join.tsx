import "~/styles/join.css";

import type { CSSProperties } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/join";
import { JOIN_SCENES } from "~/components/JoinScenes";
import { PageTitle } from "~/components/PageTitle";
import { PersonPhoto } from "~/components/PersonPhoto";
import { loadContent } from "~/content/load.server";
import { displayName } from "~/content/model";
import { pageHead } from "~/content/head";

export async function loader() {
  const { site, people, themes } = loadContent();
  // The content check guarantees that the contact id names a person.
  const contact = people.find((person) => person.id === site.lab.contact)!;
  return {
    ...site.join,
    lab: { name: site.lab.name, universityShort: site.lab.universityShort },
    contactPerson: {
      name: contact.name,
      displayName: displayName(contact),
      photo: contact.photo,
      affiliation: contact.affiliations[0],
      email: contact.links.email,
    },
    themes: themes.map((theme) => ({ id: theme.id, title: theme.title })),
  };
}

export const meta: Route.MetaFunction = ({ matches }) => pageHead("/join", matches);

export default function Join({ loaderData }: Route.ComponentProps) {
  const { lab, welcome, welcomeHighlight, ways, contact, contactPerson, themes } = loaderData;
  // The highlighted phrase is part of the sentence, so the sentence is cut around it.
  const highlightAt = welcome.indexOf(welcomeHighlight);
  return (
    <main className="p-join">
      <PageTitle>Join us</PageTitle>
      <section className="mh">
        <div className="wrap">
          <p className="vision">
            {welcome.slice(0, highlightAt)}
            <span className="grad">{welcomeHighlight}</span>
            {welcome.slice(highlightAt + welcomeHighlight.length)}
          </p>
        </div>
      </section>

      <section className="sec" aria-labelledby="ways-h">
        <div className="wrap">
          <h2 id="ways-h">Ways to join</h2>
          <ol className="trio">
            {ways.map((way, i) => {
              const Scene = JOIN_SCENES[i];
              return (
                <li className="pt" key={way.title}>
                  <div className="viz" aria-hidden="true">
                    {Scene && <Scene lab={lab} />}
                  </div>
                  <div className="txt">
                    <h3>{way.title}</h3>
                    <p>{way.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="sec" aria-labelledby="touch-h">
        <div className="wrap touch">
          <div className="prose">
            <h2 id="touch-h">How to get in touch</h2>
            {contact.text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="stage">
            <article className="mini mail">
              <header aria-hidden="true">
                <i />
                <i />
                <i />
                <b>New message</b>
              </header>
              <div className="to">
                To
                <PersonPhoto person={contactPerson} />
                <span>
                  <b>{contactPerson.displayName}</b>
                  {contactPerson.affiliation && <small>{contactPerson.affiliation}</small>}
                </span>
              </div>
              <ul>
                {contact.include.map((line, i) => (
                  <li key={line.item}>
                    <span className="box">
                      <span className="tick" style={{ "--i": i } as CSSProperties} />
                    </span>
                    {line.item}
                    {line.for && <small>{line.for}</small>}
                  </li>
                ))}
              </ul>
              {contactPerson.email && (
                <footer>
                  <a className="btn" href={`mailto:${contactPerson.email}`}>
                    Write to {contactPerson.name}
                  </a>
                </footer>
              )}
            </article>
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="themes-h">
        <div className="wrap">
          <div className="sec-h">
            <h2 id="themes-h">Research themes</h2>
            <Link className="more" to="/research">
              All research themes
            </Link>
          </div>
          <nav className="jump" style={{ "--n": themes.length } as CSSProperties} aria-label="Research themes">
            <span className="sig" aria-hidden="true" />
            {themes.map((theme) => (
              <Link key={theme.id} to={`/research#${theme.id}`}>
                <i />
                <span>{theme.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
