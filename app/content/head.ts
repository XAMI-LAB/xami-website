// What goes in a page's <head>: its title, its description, its one true address, and what a shared link shows.
import { SHARE_IMAGE, SITE_PAGES } from "./pages";

/** What the root route hands every page about the site as a whole. */
export type SiteHead = {
  name: string;
  university: string;
  url: string;
  /** each page's description, by path */
  descriptions: Record<string, string>;
};

type Matches = readonly ({ id: string; loaderData?: unknown } | undefined)[];

/**
 * The head of the page at `path`. `matches` is what a route's `meta` function receives; the site's
 * name, address and descriptions come from the root route's data.
 */
export function pageHead(path: string, matches: Matches, title?: string) {
  const site = matches.find((match) => match?.id === "root")?.loaderData as SiteHead | undefined;
  if (!site) return [{ title: title ?? "" }];
  const page = SITE_PAGES.find((p) => p.path === path);
  const fullTitle = path === "/" ? `${site.name} | ${site.university}` : `${title ?? page?.name ?? ""} | ${site.name}`;
  const description = site.descriptions[path] ?? site.descriptions["/"];
  const address = site.url + (path === "/" ? "/" : path);
  const head: Record<string, unknown>[] = [
    { title: fullTitle },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: address },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: site.name },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: address },
    { property: "og:image", content: site.url + SHARE_IMAGE },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (path === "/") {
    // Tells search engines what kind of organisation this is and whom it belongs to.
    head.push({
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "ResearchOrganization",
        name: site.name,
        url: site.url + "/",
        logo: site.url + "/brand/xami-mark.png",
        description,
        parentOrganization: { "@type": "CollegeOrUniversity", name: site.university },
      },
    });
  }
  return head;
}

/** The head of a page that should stay out of search results, such as the page shown for an unknown address. */
export function unlistedHead(title: string, matches: Matches) {
  const site = matches.find((match) => match?.id === "root")?.loaderData as SiteHead | undefined;
  return [{ title: site ? `${title} | ${site.name}` : title }, { name: "robots", content: "noindex" }];
}
