// Reads everything in content/, checks it, and links the pieces together.
// This runs only while the site is being built: none of it is sent to the browser.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initSync, parse as parseBibtex } from "@retorquere/bibtex-parser";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import type { NewsItem, Person, Publication, PublicationKind, Site, Theme } from "./model";
import { SITE_PAGES } from "./pages";
import { newsSchema, personSchema, siteSchema, themeSchema } from "./schema";

const CONTENT = path.resolve("content");
const PUBLIC = path.resolve("public");

export type Content = {
  site: Site;
  people: Person[];
  themes: Theme[];
  news: NewsItem[];
  publications: Publication[];
};

class ContentError extends Error {
  constructor(file: string, problems: string[]) {
    super(`content/${file}:\n` + problems.map((p) => `  - ${p}`).join("\n"));
    this.name = "ContentError";
  }
}

function readYaml<S extends z.ZodType>(
  file: string,
  schema: S,
  label?: (entry: unknown, i: number) => string,
): z.infer<S> {
  const raw = parseYaml(fs.readFileSync(path.join(CONTENT, file), "utf8"));
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  const problems = result.error.issues.map((issue) => {
    const [first, ...rest] = issue.path;
    const where =
      typeof first === "number" && Array.isArray(raw) && label
        ? [label(raw[first], first), ...rest].join(" > ")
        : issue.path.join(" > ");
    return `${where || "(top of file)"}: ${issue.message}`;
  });
  throw new ContentError(file, problems);
}

const named = (key: string) => (entry: unknown, i: number) => {
  const value = entry && typeof entry === "object" ? (entry as Record<string, unknown>)[key] : undefined;
  return typeof value === "string" ? `"${value}"` : `entry ${i + 1}`;
};

/** Lower-case, without accents: "Técnico" and "tecnico" compare equal. */
const plain = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .trim();

const CITED_FIELDS = new Set([
  "author",
  "title",
  "journal",
  "booktitle",
  "series",
  "volume",
  "number",
  "pages",
  "publisher",
  "organization",
  "year",
  "eprinttype",
  "eprint",
  "doi",
  "url",
]);

/**
 * The citation offered on the site: the entry as the lab wrote it, keeping only the bibliographic
 * fields (no abstract, code links or other fields the site uses for itself).
 */
function citation(entryText: string): string {
  const head = entryText.match(/^\s*@\w+\s*\{\s*[^,\s]+\s*,/);
  if (!head) return entryText.trim();
  const fields: string[] = [];
  let at = head[0].length;
  for (;;) {
    const field = /^[\s,]*([A-Za-z_][\w-]*)\s*=\s*/.exec(entryText.slice(at));
    if (!field) break;
    at += field[0].length;
    const start = at;
    if (entryText[at] === "{" || entryText[at] === '"') {
      const quoted = entryText[at] === '"';
      let depth = 0;
      do {
        const ch = entryText[at];
        if (ch === "\\") at += 1;
        else if (ch === "{") depth += 1;
        else if (ch === "}") depth -= 1;
        at += 1;
      } while (
        at < entryText.length &&
        (quoted ? depth > 0 || entryText[at - 1] !== '"' || at - 1 === start : depth > 0)
      );
    } else {
      while (at < entryText.length && !/[,}\n]/.test(entryText[at])) at += 1;
    }
    if (CITED_FIELDS.has(field[1].toLowerCase())) fields.push(`  ${field[1]} = ${entryText.slice(start, at).trim()}`);
  }
  return `${head[0].trim()}\n${fields.join(",\n")}\n}`;
}

function readPublications(people: Person[]): Publication[] {
  const file = "publications.bib";
  const source = fs.readFileSync(path.join(CONTENT, file), "utf8");
  const wasm = fileURLToPath(new URL("./bibtex_parser_bg.wasm", import.meta.resolve("@retorquere/bibtex-parser")));
  initSync({ module: fs.readFileSync(wasm) });
  // Outside web addresses, a bare % starts a comment in BibTeX and silently cuts the rest of the field off.
  // A line that begins with % is a comment written on purpose.
  const barePercent = source.split("\n").flatMap((text, i) => {
    const prose = /^\s*(%|doi\s*=)/i.test(text) ? "" : text.replace(/https?:\/\/[^\s{}"]+/g, "");
    return /(?<!\\)%/.test(prose) ? [`line ${i + 1}: write % as \\% (a bare % cuts the rest of the text off)`] : [];
  });
  if (barePercent.length) throw new ContentError(file, barePercent);
  // No language is treated as English, so titles keep the capitals they were written with.
  // The link fields are read as written, so a % inside an address survives.
  const library = parseBibtex(source, {
    english: [],
    verbatimFields: ["url", "doi", "code", "code2", "demo", "arxiv"],
  });
  if (library.errors.length)
    throw new ContentError(
      file,
      library.errors.map((e) => JSON.stringify(e)),
    );

  // Lab people in an author list: leaders, members, alumni and anyone else who graduated from the lab,
  // matched by first and last name or by an alias.
  const labNames = new Set<string>();
  for (const p of people) {
    if (p.graduated.length === 0 && !p.groups.some((g) => g !== "collaborator")) continue;
    const words = plain(p.name.replace(/\([^)]*\)/g, " "))
      .split(/\s+/)
      .filter(Boolean);
    labNames.add(`${words[0]} ${words[words.length - 1]}`);
    for (const alias of p.aliases) labNames.add(plain(alias));
  }

  const problems: string[] = [];
  const seen = new Set<string>();
  const publications = library.entries.map((entry): Publication => {
    const f = entry.fields as Record<string, unknown>;
    // Most fields are plain text; publisher and organization come as lists of names.
    const str = (name: string) => {
      const value = f[name];
      if (typeof value === "string") return value.trim();
      return Array.isArray(value) && value.every((v) => typeof v === "string") ? value.join(", ").trim() : "";
    };
    for (const required of ["title", "author", "year"])
      if (!f[required]) problems.push(`${entry.key}: "${required}" is missing`);
    if (seen.has(entry.key)) problems.push(`${entry.key}: this key is used twice`);
    seen.add(entry.key);

    type Name = { name?: string; firstName?: string; prefix?: string; lastName?: string; suffix?: string };
    const authorNames = ((f.author as Name[] | undefined) ?? []).map(
      (a) => a.name ?? [a.firstName, a.prefix, a.lastName, a.suffix].filter(Boolean).join(" "),
    );
    const authors = authorNames.map((name) => {
      const words = plain(name).split(/\s+/);
      return { name, lab: labNames.has(plain(name)) || labNames.has(`${words[0]} ${words[words.length - 1]}`) };
    });

    // Where the work appeared. Datasets name where they are held in "publisher"; a preprint is one on arXiv,
    // which bibliographies list as the journal "CoRR".
    const source = str("journal") || str("booktitle") || str("publisher");
    let kind: PublicationKind = entry.type === "inproceedings" ? "conference" : "journal";
    if (/^(arxiv|corr)\b/i.test(source) || /^arxiv$/i.test(str("eprinttype"))) kind = "preprint";
    else if (/^physionet/i.test(source)) kind = "dataset";
    // A conference paper's "booktitle" is the full proceedings title, so "venue" gives the name shown on the page.
    const venue = kind === "preprint" ? "arXiv preprint" : str("venue") || source;

    // Some entries hold a full address in "doi".
    const doi = str("doi");
    let paper = str("url") || (doi ? (/^https?:/.test(doi) ? doi : `https://doi.org/${doi}`) : "");
    let arxiv = str("arxiv");
    if (/arxiv/i.test(paper)) {
      if (!arxiv) arxiv = paper;
      paper = "";
    }
    const links: Publication["links"] = [];
    if (paper) links.push({ label: "Paper", href: paper });
    if (arxiv) links.push({ label: "arXiv", href: arxiv });
    for (const name of ["code", "code2"]) if (str(name)) links.push({ label: "Code", href: str(name) });
    if (str("demo")) links.push({ label: "Demo", href: str("demo") });

    const bibtex = citation(entry.input);

    return {
      key: entry.key,
      kind,
      title: str("title"),
      authors,
      venue,
      year: Number(str("year")),
      date: str("date") || str("year"),
      href: paper || arxiv || undefined,
      links,
      abstract: str("abstract") || undefined,
      bibtex,
    };
  });
  if (problems.length) throw new ContentError(file, problems);
  return publications.sort((a, b) => b.year - a.year || b.date.localeCompare(a.date));
}

function read(): Content {
  const site = readYaml("site.yaml", siteSchema);
  const people = readYaml("people.yaml", z.array(personSchema), named("id"));
  const themes = readYaml("themes.yaml", z.array(themeSchema), named("id"));
  const news = readYaml("news.yaml", z.array(newsSchema), named("title"));
  const publications = readPublications(people);

  // Every reference from one file to another must lead somewhere.
  const personIds = new Set(people.map((p) => p.id));
  const publicationKeys = new Set(publications.map((p) => p.key));
  const check = (file: string, problems: string[]) => {
    if (problems.length) throw new ContentError(file, problems);
  };
  const unique = (ids: string[]) => ids.filter((v, i) => ids.indexOf(v) !== i).map((v) => `"${v}" is used twice`);
  const fileExists = (dir: string, name: string) => fs.existsSync(path.join(PUBLIC, dir, name));

  check("people.yaml", [
    ...unique(people.map((p) => p.id)),
    ...people
      .filter((p) => p.photo && !fileExists("photos", p.photo))
      .map((p) => `"${p.id}": photo "${p.photo}" is not in public/photos`),
  ]);
  check("themes.yaml", [
    ...unique(themes.map((t) => t.id)),
    ...themes.flatMap((t) => [
      ...t.people.filter((p) => !personIds.has(p)).map((p) => `"${t.id}": person "${p}" is not in people.yaml`),
      ...t.publications
        .filter((k) => !publicationKeys.has(k))
        .map((k) => `"${t.id}": publication "${k}" is not in publications.bib`),
    ]),
  ]);
  check(
    "news.yaml",
    news.flatMap((n) => [
      ...n.people.filter((p) => !personIds.has(p)).map((p) => `"${n.title}": person "${p}" is not in people.yaml`),
      ...(n.publication && !publicationKeys.has(n.publication)
        ? [`"${n.title}": publication "${n.publication}" is not in publications.bib`]
        : []),
    ]),
  );
  check("site.yaml", [
    ...(personIds.has(site.lab.contact) ? [] : [`lab > contact: person "${site.lab.contact}" is not in people.yaml`]),
    ...(site.lab.heading.includes(site.lab.headingHighlight)
      ? []
      : ["lab > headingHighlight is not part of the heading"]),
    ...(site.mission.vision.includes(site.mission.visionHighlight)
      ? []
      : ["mission > visionHighlight is not part of the vision"]),
    ...(site.join.welcome.includes(site.join.welcomeHighlight)
      ? []
      : ["join > welcomeHighlight is not part of the welcome"]),
    ...unique(site.join.paths.map((p) => p.id)).map((problem) => `join > paths: ${problem}`),
    // A link to a page of this site must name a page that exists.
    ...site.join.paths.flatMap((p) =>
      [...p.steps.flatMap((step) => step.links), ...(p.note?.links ?? [])]
        .filter((l) => l.url.startsWith("/") && !SITE_PAGES.some((page) => page.path === l.url))
        .map((l) => `join > "${p.id}": "${l.url}" is not a page of this site`),
    ),
    ...site.acknowledgements.institutions
      .flatMap((group) => group.row)
      .filter((o) => o.logo && !fileExists("logos", o.logo))
      .map((o) => `acknowledgements > "${o.name}": logo "${o.logo}" is not in public/logos`),
  ]);

  // Newest year first. Within a year the file's own order is kept, since some items give no month.
  news.sort((a, b) => Number(b.date.slice(0, 4)) - Number(a.date.slice(0, 4)));
  // A theme shows its people in the order of the People page, however the theme lists them.
  const placeOf = new Map(people.map((p, i) => [p.id, i]));
  for (const theme of themes) theme.people.sort((a, b) => placeOf.get(a)! - placeOf.get(b)!);
  return { site, people, themes, news, publications };
}

let cached: Content | undefined;

/** All content, read and checked once per build (re-read on every request while developing). */
export function loadContent(): Content {
  if (import.meta.env.DEV) return read();
  return (cached ??= read());
}
