import { Link } from "react-router";
import { SITE_PAGES } from "~/content/pages";

export function Footer({
  name,
  universityShort,
  founded,
  contactEmail,
}: {
  name: string;
  universityShort: string;
  founded: number;
  contactEmail?: string;
}) {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="cols">
          <div>
            <img className="logo" src="/brand/xami-long-white.png" alt={name} />
          </div>
          <div>
            <h3>Explore</h3>
            <ul>
              {SITE_PAGES.filter((page) => page.menu || page.key === "join").map((page) => (
                <li key={page.path}>
                  <Link to={page.path}>{page.name}</Link>
                </li>
              ))}
            </ul>
          </div>
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
