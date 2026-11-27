import "~/styles/acknowledgements.css";

import type { Route } from "./+types/acknowledgements";
import { PageTitle } from "~/components/PageTitle";
import { loadContent } from "~/content/load.server";
import { pageHead } from "~/content/head";

export async function loader() {
  return loadContent().site.acknowledgements;
}

export const meta: Route.MetaFunction = ({ matches }) => pageHead("/acknowledgements", matches);

export default function Acknowledgements({ loaderData }: Route.ComponentProps) {
  const { traditionalOwners, institutions, schemes } = loaderData;
  return (
    <main id="content" tabIndex={-1}>
      <PageTitle>Acknowledgements</PageTitle>
      <div className="ack">
        <div className="wrap">
          <section aria-labelledby="country-h">
            <h2 id="country-h">Acknowledgement of Traditional Owners</h2>
            <p>{traditionalOwners}</p>
          </section>
          <section aria-labelledby="orgs-h">
            <h2 id="orgs-h">Affiliated institutions and research centres</h2>
            {institutions.map((group) => (
              <div className="logos" key={group.row[0].name}>
                {group.row.map((org) => {
                  const mark = org.logo ? (
                    <img
                      src={`/logos/${org.logo}`}
                      alt={org.name}
                      className={org.whiteOnly ? "white-only" : undefined}
                      style={{ height: org.logoHeight }}
                    />
                  ) : (
                    <span className="name">{org.name}</span>
                  );
                  return org.url ? (
                    <a key={org.name} href={org.url}>
                      {mark}
                    </a>
                  ) : (
                    <span key={org.name}>{mark}</span>
                  );
                })}
              </div>
            ))}
          </section>
          <section aria-labelledby="funds-h">
            <h2 id="funds-h">Scholarships, grants and awards</h2>
            <ul>
              {schemes.map((scheme) => (
                <li key={scheme}>{scheme}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
