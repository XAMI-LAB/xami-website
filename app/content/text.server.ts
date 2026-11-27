// The site's content written out as plain text files: for search engines (robots.txt, sitemap.xml)
// and for AI readers (llms.txt as a short guide, llms-full.txt as everything in one Markdown file).
import { loadContent } from "./load.server";
import { type Person, displayName } from "./model";
import { SITE_PAGES } from "./pages";

const GROUP_HEADINGS = [
  ["leader", "Leaders"],
  ["member", "Members"],
  ["collaborator", "Collaborators"],
  ["alumni", "Alumni"],
] as const;

const address = (url: string, path: string) => url + (path === "/" ? "/" : path);

export function robotsTxt(): string {
  const { site } = loadContent();
  return `User-agent: *\nAllow: /\n\nSitemap: ${site.lab.url}/sitemap.xml\n`;
}

export function sitemapXml(): string {
  const { site } = loadContent();
  const entries = SITE_PAGES.map((page) => `  <url><loc>${address(site.lab.url, page.path)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

/** A short guide to the site: what the lab is and where each kind of information lives. */
export function llmsTxt(): string {
  const { site, themes } = loadContent();
  const { lab } = site;
  const notes: Record<string, string> = {
    mission: site.mission.vision,
    research: themes.map((theme) => theme.title).join("; "),
    join: site.join.welcome,
  };
  const pages = SITE_PAGES.filter((page) => page.path !== "/").map((page) => {
    const note = page.key ? notes[page.key] : undefined;
    return `- [${page.name}](${address(lab.url, page.path)})${note ? `: ${note}` : ""}`;
  });
  return (
    [
      `# ${lab.name}`,
      `> ${lab.intro}`,
      `${lab.name} is a research lab at ${lab.university}.`,
      `## Pages\n\n${pages.join("\n")}`,
      `## Research themes\n\n${themes
        .map(
          (theme) => `- [${theme.title}](${lab.url}/research#${theme.id})${theme.summary ? `: ${theme.summary}` : ""}`,
        )
        .join("\n")}`,
      `## Optional\n\n- [Everything on the site as one Markdown file](${lab.url}/llms-full.txt)`,
    ].join("\n\n") + "\n"
  );
}

function personLine(person: Person, group: (typeof GROUP_HEADINGS)[number][0]): string {
  const details =
    group === "alumni"
      ? person.graduated
        ? [
            `${person.graduated.degree} Graduate, ${person.graduated.year}`,
            ...person.affiliations.map((a) => `now at ${a}`),
          ]
        : []
      : [person.position, ...person.affiliations].filter(Boolean);
  const links = Object.entries(person.links)
    .filter(([kind]) => kind !== "email")
    .map(([kind, href]) => `[${kind}](${href})`);
  return `- ${[displayName(person), ...details].join(", ")}${links.length ? ` (${links.join(", ")})` : ""}`;
}

/** Everything the site says, as one Markdown file. */
export function llmsFullTxt(): string {
  const { site, people, themes, news, publications } = loadContent();
  const { lab, mission, join, acknowledgements } = site;
  const byId = new Map(people.map((person) => [person.id, person]));
  const byKey = new Map(publications.map((publication) => [publication.key, publication]));
  const cite = (key: string) => {
    const p = byKey.get(key);
    return p
      ? `- ${p.authors.map((a) => a.name).join(", ")}. ${p.title}. ${[p.venue, p.year].filter(Boolean).join(", ")}.${p.href ? ` ${p.href}` : ""}`
      : "";
  };
  const years = [...new Set(publications.map((p) => p.year))];

  const sections = [
    `# ${lab.name}`,
    `> ${lab.intro}`,
    `${lab.name} is a research lab at ${lab.university}. Website: ${lab.url}/`,
    `## Mission`,
    `### Vision\n\n${mission.vision}`,
    `### Mission\n\n${mission.points.map((point, i) => `${i + 1}. ${point.lead} ${point.text}`).join("\n")}`,
    `### Values\n\n${mission.values.map((value) => `- ${value}`).join("\n")}`,
    `## Research themes`,
    ...themes.map((theme) =>
      [
        `### ${theme.title}`,
        ...theme.description,
        theme.people.length
          ? `People: ${theme.people
              .map((id) => byId.get(id))
              .filter((p) => p !== undefined)
              .map(displayName)
              .join(", ")}`
          : "",
        theme.publications.length ? `Publications:\n\n${theme.publications.map(cite).join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    ),
    `## People`,
    ...GROUP_HEADINGS.map(([group, heading]) => {
      const members = people.filter((person) => person.groups.includes(group));
      return `### ${heading}\n\n${members.map((person) => personLine(person, group)).join("\n")}`;
    }),
    `## Publications`,
    ...years.map(
      (year) =>
        `### ${year}\n\n${publications
          .filter((p) => p.year === year)
          .map((p) => cite(p.key))
          .join("\n")}`,
    ),
    `## News\n\n${news.map((item) => `- ${item.date}: ${item.title}. ${item.text}`).join("\n")}`,
    `## Join us`,
    join.welcome,
    join.ways.map((way) => `- ${way.title}: ${way.text}`).join("\n"),
    ...join.contact.text,
    `## Acknowledgements`,
    `### Acknowledgement of Traditional Owners\n\n${acknowledgements.traditionalOwners}`,
    `### Affiliated institutions and research centres\n\n${acknowledgements.institutions
      .flatMap((group) => group.row)
      .map((org) => `- ${org.name}`)
      .join("\n")}`,
    `### Scholarships, grants and awards\n\n${acknowledgements.schemes.map((scheme) => `- ${scheme}`).join("\n")}`,
  ];
  return sections.join("\n\n") + "\n";
}
