import "~/styles/mission.css";

import type { Route } from "./+types/mission";
import { MISSION_SCENES } from "~/components/MissionScenes";
import { PageTitle } from "~/components/PageTitle";
import { loadContent } from "~/content/load.server";
import { pageHead } from "~/content/head";

export async function loader() {
  return loadContent().site.mission;
}

export const meta: Route.MetaFunction = ({ matches }) => pageHead("/mission", matches);

export default function Mission({ loaderData }: Route.ComponentProps) {
  const { vision, visionHighlight, points, values } = loaderData;
  // The highlighted phrase is part of the sentence, so the sentence is cut around it.
  const highlightAt = vision.indexOf(visionHighlight);
  return (
    <main className="p-mission">
      <PageTitle>Mission</PageTitle>
      <section className="mh">
        <div className="wrap">
          <h2>Our Vision</h2>
          <p className="vision">
            {vision.slice(0, highlightAt)}
            <span className="grad">{visionHighlight}</span>
            {vision.slice(highlightAt + visionHighlight.length)}
          </p>
        </div>
      </section>

      <section className="ms" aria-labelledby="mission-h">
        <div className="wrap">
          <h2 id="mission-h">Our Mission</h2>
          <ol className="trio">
            {points.map((point, i) => {
              const Scene = MISSION_SCENES[i];
              return (
                <li className="pt" key={point.lead}>
                  <div className="viz" aria-hidden="true">
                    {Scene && <Scene />}
                  </div>
                  <div className="txt">
                    <span className="no">{String(i + 1).padStart(2, "0")}</span>
                    <h3>{point.lead}</h3>
                    <p>{point.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="vs" aria-labelledby="values-h">
        <div className="wrap">
          <div className="vals">
            <h2 id="values-h">Our Values</h2>
            <ul>
              {values.map((value) => (
                <li key={value}>
                  <i />
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
