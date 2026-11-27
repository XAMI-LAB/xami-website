import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("mission", "routes/mission.tsx"),
  route("people", "routes/people.tsx"),
  route("research", "routes/research.tsx"),
  route("publications", "routes/publications.tsx"),
  route("join", "routes/join.tsx"),
  route("acknowledgements", "routes/acknowledgements.tsx"),
  route("privacy-policy", "routes/privacy-policy.tsx"),
  route("third-party-licenses", "routes/third-party-licenses.tsx"),

  // files written out from the content when the site is built
  route("robots.txt", "routes/robots-txt.ts"),
  route("sitemap.xml", "routes/sitemap-xml.ts"),
  route("llms.txt", "routes/llms-txt.ts"),
  route("llms-full.txt", "routes/llms-full-txt.ts"),

  // any other address
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
