import { LINK_KINDS, type LinkKind, type Person } from "~/content/model";
import icons from "./linkIcons.json";

const LABELS: Record<LinkKind, string> = {
  email: "Email",
  website: "Website",
  linkedin: "LinkedIn",
  scholar: "Google Scholar",
  github: "GitHub",
};

/** The ways to reach a person, as a row of small glyphs. Renders nothing for a person with no links. */
export function PersonLinks({ links }: { links: Person["links"] }) {
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
            aria-label={LABELS[kind]}
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
