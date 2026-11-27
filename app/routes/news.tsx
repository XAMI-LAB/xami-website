import "~/styles/news.css";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/news";
import { PageTitle } from "~/components/PageTitle";
import { PersonPhoto } from "~/components/PersonPhoto";
import { loadContent } from "~/content/load.server";
import type { NewsKind } from "~/content/model";
import { pageHead } from "~/content/head";

const FILTERS: [NewsKind | "", string][] = [
  ["", "All"],
  ["people", "People"],
  ["graduation", "Graduations"],
  ["publication", "Publications"],
];
const KIND_LABELS: Record<NewsKind, string> = {
  people: "People",
  graduation: "Graduation",
  publication: "Publication",
};
// Written out rather than asked of the browser, so the page reads the same wherever it is built or opened.
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function loader() {
  const { news, people, publications } = loadContent();
  const items = news.map((item) => ({
    year: item.date.slice(0, 4),
    month: item.date.length > 4 ? MONTHS[Number(item.date.slice(5)) - 1] : undefined,
    kind: item.kind,
    title: item.title,
    text: item.text,
    people: item.people
      .flatMap((personId) => people.filter((person) => person.id === personId))
      // News names people plainly: no title and no nickname in brackets.
      .map(({ id, name, photo }) => ({ id, name: name.replace(/\s*\([^)]*\)/g, "").trim(), photo })),
    paper: publications.find((publication) => publication.key === item.publication)?.href,
  }));
  const years = [...new Set(items.map((item) => item.year))].map((year) => ({
    year,
    items: items.filter((item) => item.year === year),
  }));
  return { years };
}

export const meta: Route.MetaFunction = ({ matches }) => pageHead("/news", matches);

export default function News({ loaderData }: Route.ComponentProps) {
  const { years } = loaderData;
  const [kind, setKind] = useState<NewsKind | "">("");
  const [yearInView, setYearInView] = useState<string>();
  const page = useRef<HTMLElement>(null);

  // The year being read is marked in the bar: it is the one crossing a thin band a third of the way down the window.
  useEffect(() => {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setYearInView(entry.target.id.slice(1));
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    page.current?.querySelectorAll(".yr").forEach((section) => spy.observe(section));
    return () => spy.disconnect();
  }, []);

  const shows = (item: { kind: NewsKind }) => !kind || item.kind === kind;
  const empty = (items: { kind: NewsKind }[]) => !items.some(shows);

  return (
    <main className="p-news" ref={page}>
      <PageTitle>News</PageTitle>
      <div className="tools">
        <div className="wrap">
          <div className="seg" role="group" aria-label="Kind of news">
            {FILTERS.map(([value, label]) => (
              <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)}>
                {label}
              </button>
            ))}
          </div>
          <nav className="years" aria-label="Jump to a year">
            {years.map(({ year, items }) => (
              <Link
                key={year}
                to={`#y${year}`}
                className={[year === yearInView && "cur", empty(items) && "off"].filter(Boolean).join(" ") || undefined}
              >
                {year}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {/* Filtered-out news is hidden rather than removed, so the page keeps its shape and the year links keep their targets. */}
      {years.map(({ year, items }) => (
        <section key={year} className="yr" id={`y${year}`} hidden={empty(items)}>
          <div className="wrap reg">
            <h2 className="year">{year}</h2>
            <ol className="tl">
              {items.map((item) => (
                <li key={item.title} className="item" hidden={!shows(item)}>
                  <i className="node" aria-hidden="true" />
                  <p className="meta">
                    {item.month && <time>{item.month}</time>}
                    <span className="ty">{KIND_LABELS[item.kind]}</span>
                  </p>
                  <h3>{item.title}</h3>
                  <p className="tx">{item.text}</p>
                  {(item.people.length > 0 || item.paper) && (
                    <div className="foot">
                      {item.people.map((person) => (
                        <Link key={person.id} className="who" to={`/people#${person.id}`}>
                          <PersonPhoto person={person} />
                          {person.name}
                        </Link>
                      ))}
                      {item.paper && (
                        <a className="ext" href={item.paper}>
                          Paper
                        </a>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}
      <p className={years.every(({ items }) => empty(items)) ? "none show" : "none"}>No news of this kind yet.</p>
    </main>
  );
}
