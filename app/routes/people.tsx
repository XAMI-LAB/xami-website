import "~/styles/people.css";

import type { Route } from "./+types/people";
import { PageTitle } from "~/components/PageTitle";
import { PersonLinks } from "~/components/PersonLinks";
import { PersonPhoto } from "~/components/PersonPhoto";
import { loadContent } from "~/content/load.server";
import { type Group, type Person, displayName } from "~/content/model";
import { pageHead } from "~/content/head";

const HEADINGS: [Group, string][] = [
  ["leader", "Leaders"],
  ["member", "Members"],
  ["collaborator", "Collaborators"],
  ["alumni", "Alumni"],
];

export async function loader() {
  const { people } = loadContent();
  return {
    people: people.map(({ id, name, title, groups, position, affiliations, graduated, photo, links }) => ({
      id,
      name,
      title,
      groups,
      position,
      affiliations,
      graduated,
      photo,
      links,
    })),
  };
}

export const meta: Route.MetaFunction = ({ matches }) => pageHead("/people", matches);

type Details = Pick<Person, "position" | "affiliations" | "graduated">;

/** What is said about a person beside their name: alumni by what they graduated with and where they are now, everyone else by where they work. */
function PersonDetails({ person, group }: { person: Details; group: Group }) {
  if (group === "alumni") {
    const { graduated, affiliations } = person;
    return (
      <span className="info">
        {graduated && <b>{`${graduated.degree} Graduate, ${graduated.year}`}</b>}
        {affiliations.length > 0 && <small>{`Now at ${affiliations.join(", ")}`}</small>}
      </span>
    );
  }
  const { position, affiliations } = person;
  return (
    <span className="info">
      {position && <b>{position}</b>}
      {affiliations.map((affiliation) => (
        <small key={affiliation}>{affiliation}</small>
      ))}
    </span>
  );
}

/** The people of one group, in the order of the content file; alumni by graduation year, newest first. */
function listed<P extends { groups: Group[]; graduated?: { year: number } }>(people: P[], group: Group): P[] {
  const members = people.filter((person) => person.groups.includes(group));
  if (group === "alumni") members.sort((a, b) => (b.graduated?.year ?? 0) - (a.graduated?.year ?? 0));
  return members;
}

export default function People({ loaderData }: Route.ComponentProps) {
  const { people } = loaderData;
  return (
    <main className="p-people">
      <PageTitle clear={0.4}>People</PageTitle>
      {HEADINGS.map(([group, heading]) => (
        <section key={group}>
          <div className="wrap reg">
            <h2>{heading}</h2>
            <div className="list">
              {listed(people, group).map((person) => (
                <div key={person.id} className="p r">
                  <PersonPhoto person={person} />
                  <span className="nm">
                    <b>{displayName(person)}</b>
                    <PersonLinks links={person.links} />
                  </span>
                  <PersonDetails person={person} group={group} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
