// The pages of the site, in the order the menu and the footer list them.
// The menu, the footer, the sitemap, the page descriptions and the files for AI readers all draw on this one list.

export type SitePage = {
  /** the name the content files use for the page, where its description can be set */
  key?: "home" | "mission" | "people" | "research" | "publications" | "news" | "join" | "acknowledgements";
  path: string;
  /** the page's name in titles and lists */
  name: string;
  /** the page's label in the main menu, for the pages listed there */
  menu?: string;
};

export const SITE_PAGES: SitePage[] = [
  { key: "home", path: "/", name: "Home" },
  { key: "mission", path: "/mission", name: "Mission", menu: "Mission" },
  { key: "people", path: "/people", name: "People", menu: "People" },
  { key: "research", path: "/research", name: "Research themes", menu: "Research" },
  { key: "publications", path: "/publications", name: "Publications", menu: "Publications" },
  { key: "news", path: "/news", name: "News", menu: "News" },
  { key: "join", path: "/join", name: "Join us" },
  { key: "acknowledgements", path: "/acknowledgements", name: "Acknowledgements" },
  { path: "/privacy-policy", name: "Privacy policy" },
  { path: "/third-party-licenses", name: "Third-party licences" },
];

/** The picture shown when a page is shared, 1200 by 630. */
export const SHARE_IMAGE = "/share.png";
