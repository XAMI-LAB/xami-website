import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { SITE_PAGES } from "~/content/pages";

const MENU = SITE_PAGES.filter((page) => page.menu);

/** The lab's other websites, shown as one category of the menu. */
type Sites = { label: string; items: { name: string; url: string }[] };

export function Header({ name, university, sites }: { name: string; university: string; sites: Sites }) {
  // On narrow screens the menu is a sheet that opens under the bar.
  const [open, setOpen] = useState(false);
  // On wide screens the category of other websites opens a short list under its name.
  const [listed, setListed] = useState(false);
  // Whether the list is open only because the pointer is over it; a click then keeps it open.
  const previewing = useRef(false);
  const category = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Going to another page closes both; so does the Escape key.
  useEffect(() => {
    setOpen(false);
    setListed(false);
    previewing.current = false;
  }, [pathname]);
  useEffect(() => {
    if (!open && !listed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      setListed(false);
      previewing.current = false;
    };
    // A click anywhere else closes the list.
    const onPointer = (event: PointerEvent) => {
      if (category.current?.contains(event.target as Node)) return;
      previewing.current = false;
      setListed(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, listed]);

  const hasSites = sites.items.length > 0;

  // With a mouse, resting on the category shows its list; touch and keyboard open it by pressing the button.
  const canHover = (event: React.PointerEvent) =>
    event.pointerType !== "touch" && window.matchMedia("(hover: hover)").matches;
  const preview = (event: React.PointerEvent) => {
    if (!canHover(event) || listed) return;
    previewing.current = true;
    setListed(true);
  };
  const endPreview = () => {
    if (!previewing.current) return;
    previewing.current = false;
    setListed(false);
  };
  const toggle = () => {
    // A click while the pointer is only resting on the list keeps it open, so it stays when the pointer leaves.
    if (previewing.current) {
      previewing.current = false;
      return;
    }
    setListed(!listed);
  };
  // Tabbing out of the category closes its list.
  const closeOnLeave = (event: React.FocusEvent) => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) {
      previewing.current = false;
      setListed(false);
    }
  };

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
          {hasSites && (
            <div
              className="nav-more"
              ref={category}
              onPointerEnter={preview}
              onPointerLeave={endPreview}
              onBlur={closeOnLeave}
            >
              <button type="button" aria-expanded={listed} aria-controls="nav-sites" onClick={toggle}>
                {sites.label}
                <i aria-hidden="true" />
              </button>
              <ul className="nav-list" id="nav-sites" hidden={!listed}>
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
          {hasSites && (
            <div className="sheet-more">
              <p>{sites.label}</p>
              {sites.items.map((site) => (
                <a key={site.url} className="out" href={site.url} target="_blank" rel="noopener">
                  {site.name}
                </a>
              ))}
            </div>
          )}
          <Link className="cta" to="/join">
            Join us
          </Link>
        </div>
      </nav>
    </header>
  );
}
