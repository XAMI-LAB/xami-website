import "~/styles/prose.css";

import type { Route } from "./+types/third-party-licenses";
import { PageTitle } from "~/components/PageTitle";
import { loadLicences } from "~/content/licences.server";
import { loadContent } from "~/content/load.server";
import { pageHead } from "~/content/head";

export async function loader() {
  const packages = loadLicences();
  // Packages under the same licence are listed together, the most common licence first.
  const licences = [...new Set(packages.map((p) => p.licence))]
    .map((licence) => ({ licence, packages: packages.filter((p) => p.licence === licence) }))
    .sort((a, b) => b.packages.length - a.packages.length || a.licence.localeCompare(b.licence));
  return { intro: loadContent().site.licences.intro, licences };
}

export const meta: Route.MetaFunction = ({ matches }) => pageHead("/third-party-licenses", matches);

export default function ThirdPartyLicences({ loaderData }: Route.ComponentProps) {
  const { intro, licences } = loaderData;
  return (
    <main>
      <PageTitle>Third-party licences</PageTitle>
      <div className="prose">
        <div className="wrap">
          <p>{intro}</p>
          {licences.map((group) => (
            <section key={group.licence}>
              <h2>{group.licence}</h2>
              <ul className="packages">
                {group.packages.map((pkg) => (
                  <li key={`${pkg.name}@${pkg.version}`}>
                    <h3>
                      {pkg.name}
                      <span className="version">{pkg.version}</span>
                    </h3>
                    {pkg.repository && (
                      <a className="source" href={pkg.repository}>
                        {pkg.repository}
                      </a>
                    )}
                    {pkg.text && (
                      <details>
                        <summary>Licence text</summary>
                        <pre>{pkg.text}</pre>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
