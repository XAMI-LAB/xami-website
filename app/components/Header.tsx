import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { SITE_PAGES } from "~/content/pages";

const MENU = SITE_PAGES.filter((page) => page.menu);

export function Header({ name, university }: { name: string; university: string }) {
  // On narrow screens the menu is a sheet that opens under the bar.
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Going to another page closes the sheet; so does the Escape key.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="head">
      <div className="wrap">
        <Link className="brand" to="/">
          <img src="/brand/xami-mark.png" alt="" />
          <span>
            {name}
            <small>{university}</small>
          </span>
        </Link>
        <nav className="nav" aria-label="Main">
          {MENU.map((page) => (
            <NavLink key={page.path} to={page.path}>
              {page.menu}
            </NavLink>
          ))}
          <Link className="cta" to="/join">
            Join us
          </Link>
        </nav>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="menu-sheet"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
        </button>
      </div>
      <nav className="menu-sheet" id="menu-sheet" aria-label="Main" hidden={!open}>
        <div className="wrap">
          <ul>
            {MENU.map((page) => (
              <li key={page.path}>
                <NavLink to={page.path}>
                  <i />
                  {page.menu}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link className="cta" to="/join">
            Join us
          </Link>
        </div>
      </nav>
    </header>
  );
}
