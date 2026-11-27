import "~/styles/prose.css";

import { Link } from "react-router";
import type { Route } from "./+types/not-found";
import { PageTitle } from "~/components/PageTitle";
import { unlistedHead } from "~/content/head";
import { SITE_PAGES } from "~/content/pages";

export const meta: Route.MetaFunction = ({ matches }) => unlistedHead("Page not found", matches);

/** Shown for any address that is not a page of the site. */
export default function NotFound() {
  return (
    <main>
      <PageTitle>Page not found</PageTitle>
      <div className="prose">
        <div className="wrap">
          <p>This address does not lead to a page. These do:</p>
          <ul>
            {SITE_PAGES.filter((page) => page.key).map((page) => (
              <li key={page.path}>
                <Link to={page.path}>{page.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
