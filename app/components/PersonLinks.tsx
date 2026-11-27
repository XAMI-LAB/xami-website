import { LINK_KINDS, type LinkKind, type Person } from "~/content/model";
import icons from "./linkIcons.json";

const LABELS: Record<LinkKind, string> = {
  email: "Email",
  website: "Website",
  linkedin: "LinkedIn",
  scholar: "Google Scholar",
  github: "GitHub",
};

/**
 * The ways to reach a person, as a row of small glyphs, each announced with the person's name so that a list of
 * people does not read as "Email, Website, Email, Website". Renders nothing for a person with no links.
 */
export function PersonLinks({ links, name }: { links: Person["links"]; name: string }) {
  // Always in the same order, whatever order the content file lists them in.
  const kinds = LINK_KINDS.filter((kind) => links[kind]);
  if (!kinds.length) return null;
  return (
    <span className="ics">
      {kinds.map((kind) => {
        const icon = icons[kind];
        return (
          <a
            key={kind}
            className="ic"
            href={kind === "email" ? `mailto:${links[kind]}` : links[kind]}
            aria-label={`${name}: ${LABELS[kind]}`}
            title={LABELS[kind]}
          >
            <svg viewBox={`0 0 ${icon.w} ${icon.h}`} aria-hidden="true">
              <path d={icon.d} />
            </svg>
          </a>
        );
      })}
    </span>
  );
}
