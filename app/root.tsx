import "@fontsource-variable/red-hat-display";
import "@fontsource-variable/red-hat-text";
import "@fontsource-variable/red-hat-text/wght-italic.css";
import "./styles/site.css";

import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { loadContent } from "./content/load.server";
import { SITE_PAGES } from "./content/pages";

export async function loader() {
  const { site, people } = loadContent();
  const contact = people.find((p) => p.id === site.lab.contact);
  // A page without a description of its own is described by the lab's words for it, or by the lab's intro.
  const fallback: Record<string, string> = { mission: site.mission.vision, join: site.join.welcome };
  const descriptions = Object.fromEntries(
    SITE_PAGES.map((page) => [
      page.path,
      (page.key && (site.descriptions[page.key] ?? fallback[page.key])) || site.lab.intro,
    ]),
  );
  return {
    name: site.lab.name,
    university: site.lab.university,
    url: site.lab.url,
    descriptions,
    universityShort: site.lab.universityShort,
    founded: site.lab.founded,
    contactEmail: contact?.links.email,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f6f8f9" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/brand/xami-mark.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/xami-mark.png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header name={loaderData.name} university={loaderData.university} />
      <Outlet />
      <Footer
        name={loaderData.name}
        universityShort={loaderData.universityShort}
        founded={loaderData.founded}
        contactEmail={loaderData.contactEmail}
      />
    </>
  );
}
