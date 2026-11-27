import "~/styles/join.css";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/join";
import { Highlighted } from "~/components/Highlighted";
import { JOIN_SCENES } from "~/components/JoinScenes";
import { PageTitle } from "~/components/PageTitle";
import { PersonPhoto } from "~/components/PersonPhoto";
import { loadContent } from "~/content/load.server";
import { displayName } from "~/content/model";
import { pageHead } from "~/content/head";

export async function loader() {
  const { site, people } = loadContent();
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
    // People who earned a degree in the lab and where they are now, the most recent graduates first.
    // Those who graduated in the same year keep the order of the People page.
    graduates: people
      .filter((person) => person.graduated.length > 0)
      .map((person) => ({
        id: person.id,
        name: displayName(person),
        photo: person.photo,
        degrees: person.graduated.map((d) => [d.degree, d.year].filter(Boolean).join(", ")),
        latest: Math.max(0, ...person.graduated.map((d) => d.year ?? 0)),
        // Only the organisation is named: "School of Information Systems, QUT" reads as "QUT" here.
        now: person.affiliations.at(-1)?.split(", ").at(-1),
      }))
      .sort((a, b) => b.latest - a.latest),
  };
}

export const meta: Route.MetaFunction = ({ matches }) => pageHead("/join", matches);

type Data = Route.ComponentProps["loaderData"];

/** A link from the content file: to a page of this site, or to another site in a new tab. */
function ContentLink({ link }: { link: { label: string; url: string } }) {
  return link.url.startsWith("/") ? (
    <Link to={link.url}>{link.label}</Link>
  ) : (
    <a className="out" href={link.url} target="_blank" rel="noopener">
      {link.label}
    </a>
  );
}

function Links({ links }: { links: { label: string; url: string }[] }) {
  if (links.length === 0) return null;
  return (
    <p className="lks">
      {links.map((link) => (
        <ContentLink key={link.url} link={link} />
      ))}
    </p>
  );
}

/** What an enquiry should include, as a plain list: shown where there is no room for the message beside the text. */
function SendList({ path }: { path: Data["paths"][number] }) {
  return (
    <div className="send">
      <p className="lbl">What to send</p>
      <ul>
        {path.send.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Join({ loaderData }: Route.ComponentProps) {
  const { lab, welcome, welcomeHighlight, paths, contactPerson, graduates } = loaderData;
  // The message on the right stays in view while the ways scroll past on the left,
  // and is written for whichever way it is beside.
  const [beside, setBeside] = useState(paths[0].id);
  const blocks = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Measuring three boxes is cheap, so it is done on every scroll; the message never lags behind the page.
    const read = () => {
      const card = stage.current?.getBoundingClientRect();
      const ways = blocks.current?.querySelectorAll<HTMLElement>(".way");
      if (!card || !ways) return;
      // The way whose area the middle of the message has reached; where the message is not shown, the middle of the screen.
      const middle = card.height ? card.top + card.height / 2 : window.innerHeight / 2;
      let id = paths[0].id;
      for (const way of ways) if (way.getBoundingClientRect().top <= middle) id = way.id;
      setBeside(id);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [paths]);
  const current = paths.find((path) => path.id === beside) ?? paths[0];

  return (
    <main id="content" tabIndex={-1} className="p-join">
      <PageTitle>Join us</PageTitle>
      <section className="mh">
        <div className="wrap">
          <p className="vision">
            <Highlighted text={welcome} highlight={welcomeHighlight} />
          </p>
        </div>
      </section>

      <section className="sec ways" aria-labelledby="ways-h">
        <div className="wrap">
          <h2 id="ways-h">Ways to join</h2>
          <ol className="trio">
            {paths.map((path) => {
              const Scene = JOIN_SCENES[path.scene];
              return (
                <li className="pt" key={path.id}>
                  <a href={`#${path.id}`}>
                    <div className="viz" aria-hidden="true">
                      <Scene lab={lab} />
                    </div>
                    <div className="txt">
                      <h3>{path.title}</h3>
                      <p>{path.summary}</p>
                      <span className="go">How it works</span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="sec" aria-label="How to join">
        <div className="wrap touch">
          <div className="blocks" ref={blocks}>
            {paths.map((path) => (
              <div className={path.id === beside ? "prose way on" : "prose way"} id={path.id} key={path.id}>
                <h2>{path.title}</h2>
                {path.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {path.steps.length > 0 && (
                  <ol className="steps">
                    {path.steps.map((step) => (
                      <li key={step.title}>
                        <i aria-hidden="true" />
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                        <Links links={step.links} />
                      </li>
                    ))}
                  </ol>
                )}
                {path.note && (
                  <div className="note">
                    <p>{path.note.text}</p>
                    <Links links={path.note.links} />
                  </div>
                )}
                {path.graduates && graduates.length > 0 && (
                  <div className="grads">
                    <p className="lbl">Graduates of the lab</p>
                    <ul>
                      {graduates.map((person) => (
                        <li key={person.id}>
                          <Link to={`/people#${person.id}`}>
                            <PersonPhoto person={person} />
                            <span>
                              <b>{person.name}</b>
                              <small>
                                {person.degrees.join(" and ")}
                                {person.now && `. Now at ${person.now}`}
                              </small>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <SendList path={path} />
              </div>
            ))}
          </div>

          {/* One message for the page. Each way has its own subject and checklist, laid one over another;
              the one for the way beside the message is shown, and the others fade out. */}
          <div className="stage" ref={stage}>
            <article className="mini mail" aria-label={`What to send: ${current.title}`}>
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
              <div className="layers">
                {paths.map((path) => (
                  <div
                    className={path.id === beside ? "layer on" : "layer"}
                    key={path.id}
                    aria-hidden={path.id !== beside}
                  >
                    <p className="subj">
                      <span>Subject</span>
                      {path.subject}
                    </p>
                    <ul>
                      {path.send.map((item, i) => (
                        <li key={item} style={{ "--i": i } as CSSProperties}>
                          <span className="box">
                            <span className="tick" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {contactPerson.email && (
                <footer>
                  <a
                    className="btn"
                    href={`mailto:${contactPerson.email}?subject=${encodeURIComponent(current.subject)}`}
                  >
                    Contact us
                  </a>
                </footer>
              )}
            </article>
          </div>
        </div>
        {/* Where the message is not shown, its one button stays at the foot of the screen and writes about the way being read. */}
        {contactPerson.email && (
          <div className="write">
            <a className="btn" href={`mailto:${contactPerson.email}?subject=${encodeURIComponent(current.subject)}`}>
              Contact us
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
