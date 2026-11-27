import { Link } from "react-router";

export function Footer({
  name,
  universityShort,
  founded,
  sites,
  contactEmail,
}: {
  name: string;
  universityShort: string;
  founded: number;
  /** the lab's other websites, under the name the menu gives them */
  sites: { label: string; items: { name: string; url: string }[] };
  contactEmail?: string;
}) {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="cols">
          <div>
            <img className="logo" src="/brand/xami-long-white.png" alt={name} />
          </div>
          {/* The site's own pages are in the menu above; this column leads to the lab's other websites. */}
          {sites.items.length > 0 && (
            <div>
              <h3>{sites.label}</h3>
              <ul>
                {sites.items.map((site) => (
                  <li key={site.url}>
                    <a className="out" href={site.url} target="_blank" rel="noopener">
                      {site.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3>About</h3>
            <ul>
              {contactEmail && (
                <li>
                  <a href={`mailto:${contactEmail}`}>Contact us</a>
                </li>
              )}
              <li>
                <Link to="/acknowledgements">Acknowledgements</Link>
              </li>
              <li>
                <Link to="/privacy-policy">Privacy policy</Link>
              </li>
              <li>
                <Link to="/third-party-licenses">Third-party licences</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="legal">
          Copyright © {founded} - {new Date().getFullYear()} {name} @{universityShort}
        </p>
      </div>
    </footer>
  );
}
