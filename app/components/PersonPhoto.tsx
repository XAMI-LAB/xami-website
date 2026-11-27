import type { Person } from "~/content/model";

/** A person's photo, or their initials when there is no photo. Each page sizes `.ph` itself. */
export function PersonPhoto({ person }: { person: Pick<Person, "name" | "photo"> }) {
  if (person.photo) return <img className="ph" src={`/photos/${person.photo}`} alt="" loading="lazy" />;
  const words = person.name
    .replace(/\([^)]*\)/g, " ")
    .trim()
    .split(/\s+/);
  const initials = words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0][0];
  return (
    <span className="ph ini" aria-hidden="true">
      {initials.toUpperCase()}
    </span>
  );
}
