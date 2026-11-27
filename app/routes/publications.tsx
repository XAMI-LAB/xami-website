import "~/styles/publications.css";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/publications";
import { PageTitle } from "~/components/PageTitle";
import { loadContent } from "~/content/load.server";
import type { Publication, PublicationKind } from "~/content/model";
import { pageHead } from "~/content/head";

const FILTERS: [PublicationKind | "", string][] = [
  ["", "All"],
  ["journal", "Journal articles"],
  ["conference", "Conference papers"],
  ["preprint", "Preprints"],
  ["dataset", "Datasets"],
];
const KIND_LABELS: Record<PublicationKind, string> = {
  journal: "Journal article",
  conference: "Conference paper",
  preprint: "Preprint",
  dataset: "Dataset",
};

export async function loader() {
  const { publications } = loadContent();
  return {
    publications: publications.map(({ key, kind, title, authors, venue, year, href, links, abstract, bibtex }) => ({
      key,
      kind,
      title,
      authors,
      venue,
      year,
      href,
      links,
      abstract,
      bibtex,
    })),
  };
}

export const meta: Route.MetaFunction = ({ matches }) => pageHead("/publications", matches);

type ListedPublication = Omit<Publication, "date">;

/** Lower-case and without accents, so that a search for "tecnico" finds "Técnico". */
const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function copyToClipboard(text: string) {
  // The clipboard is only offered on secure pages: elsewhere, copy by selecting a hidden text box.
  const byHand = () => {
    const box = document.createElement("textarea");
    box.value = text;
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    try {
      document.execCommand("copy");
    } catch {}
    box.remove();
  };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).catch(byHand);
  else byHand();
}

function PublicationRow({ publication, hidden }: { publication: ListedPublication; hidden: boolean }) {
  // The abstract and the citation open under the row, one at a time.
  const [open, setOpen] = useState<"abstract" | "cite">();
  const [copied, setCopied] = useState(false);
  const toggle = (panel: "abstract" | "cite") => setOpen(open === panel ? undefined : panel);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <li className="pub" hidden={hidden}>
      <h3>{publication.href ? <a href={publication.href}>{publication.title}</a> : publication.title}</h3>
      <p className="au">
        {publication.authors.map((author, i) => (
          <Fragment key={i}>
            {i > 0 && ", "}
            {author.lab ? <b>{author.name}</b> : author.name}
          </Fragment>
        ))}
      </p>
      <p className="ve">
        {publication.venue && <i>{publication.venue}</i>}
        <span className="ty">{KIND_LABELS[publication.kind]}</span>
      </p>
      <div className="acts">
        {publication.links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
        {publication.abstract && (
          <button type="button" aria-expanded={open === "abstract"} onClick={() => toggle("abstract")}>
            Abstract
          </button>
        )}
        <button type="button" aria-expanded={open === "cite"} onClick={() => toggle("cite")}>
          Cite
        </button>
      </div>
      {publication.abstract && (
        <div className={open === "abstract" ? "fold open" : "fold"}>
          <div>
            <p className="abs">{publication.abstract}</p>
          </div>
        </div>
      )}
      <div className={open === "cite" ? "fold open" : "fold"}>
        <div>
          <div className="bib">
            <button
              type="button"
              className={copied ? "copy done" : "copy"}
              onClick={() => {
                copyToClipboard(publication.bibtex);
                setCopied(true);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <pre>{publication.bibtex}</pre>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function Publications({ loaderData }: Route.ComponentProps) {
  const { publications } = loaderData;
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<PublicationKind | "">("");
  const [yearInView, setYearInView] = useState<number>();
  const page = useRef<HTMLElement>(null);

  // The year being read is marked in the bar: it is the one crossing a thin band a third of the way down the window.
  useEffect(() => {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setYearInView(Number(entry.target.id.slice(1)));
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    page.current?.querySelectorAll(".yr").forEach((section) => spy.observe(section));
    return () => spy.disconnect();
  }, []);

  // What a search looks through for each publication: its title, authors, venue and year.
  const searchText = useMemo(
    () =>
      new Map(
        publications.map((p) => [
          p.key,
          plain(`${p.title} ${p.authors.map((a) => a.name).join(" ")} ${p.venue} ${p.year}`),
        ]),
      ),
    [publications],
  );
  const years = useMemo(
    () =>
      [...new Set(publications.map((p) => p.year))].map((year) => ({
        year,
        publications: publications.filter((p) => p.year === year),
      })),
    [publications],
  );

  const words = plain(query).split(/\s+/).filter(Boolean);
  const shows = (p: ListedPublication) =>
    (!kind || p.kind === kind) && words.every((word) => searchText.get(p.key)!.includes(word));
  const empty = (list: ListedPublication[]) => !list.some(shows);

  return (
    <main className="p-publications" ref={page}>
      <PageTitle>Publications</PageTitle>
      <div className="tools">
        <div className="wrap">
          <label className="search">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3.5 3.5" />
            </svg>
            <input
              type="search"
              placeholder="Search title, author or venue"
              aria-label="Search publications"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="seg" role="group" aria-label="Kind of publication">
            {FILTERS.map(([value, label]) => (
              <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)}>
                {label}
              </button>
            ))}
          </div>
          <nav className="years" aria-label="Jump to a year">
            {years.map(({ year, publications }) => (
              <Link
                key={year}
                to={`#y${year}`}
                className={
                  [year === yearInView && "cur", empty(publications) && "off"].filter(Boolean).join(" ") || undefined
                }
              >
                {year}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {/* Publications that do not match are hidden rather than removed, so an open abstract or citation stays open when they come back. */}
      {years.map(({ year, publications }) => (
        <section key={year} className="yr" id={`y${year}`} hidden={empty(publications)}>
          <div className="wrap reg">
            <h2 className="year">{year}</h2>
            <ol className="plist">
              {publications.map((publication) => (
                <PublicationRow key={publication.key} publication={publication} hidden={!shows(publication)} />
              ))}
            </ol>
          </div>
        </section>
      ))}
      <p className={empty(publications) ? "none show" : "none"}>No publications match.</p>
    </main>
  );
}
