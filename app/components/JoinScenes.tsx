import type { ComponentType, CSSProperties } from "react";
import type { JoinSceneId } from "~/content/model";

/** The custom property that staggers one part of an animated scene. */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

/** How the lab is named inside a scene. */
type LabName = { name: string; universityShort: string };

/** The path of a research degree, step by step. */
function DegreePathScene() {
  const steps = ["Proposal", "Research", "Publish", "Thesis"];
  return (
    <div className="mini">
      <ol className="path">
        {steps.map((step, i) => (
          <li key={step} style={order(i)}>
            <i />
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Visitors of every career stage, each with a line to the lab. */
function VisitorsScene({ lab }: { lab: LabName }) {
  const visitors = ["PhD students", "Postdocs", "Academics"];
  return (
    <div className="visit">
      <ul>
        {visitors.map((visitor, i) => (
          <li key={visitor} style={order(i)}>
            <b>{visitor}</b>
            <span />
          </li>
        ))}
      </ul>
      <div className="lab">
        <span className="orb" />
        {lab.name}
        <br />
        {lab.universityShort}
      </div>
    </div>
  );
}

/** A partner's problem and the lab's methods meet in a joint project. */
function JointProjectScene() {
  const sides = ["A real-world problem", "Explainable AI"];
  return (
    <div className="joint">
      <div className="two">
        {sides.map((side, i) => (
          <span className="chipb" key={side} style={order(i)}>
            {side}
          </span>
        ))}
      </div>
      <span className="fork" />
      <span className="core">
        <span className="orb" />
        Joint project
      </span>
    </div>
  );
}

/** The illustrations on the cards of the ways to join, by the name the content file gives them. */
export const JOIN_SCENES: Record<JoinSceneId, ComponentType<{ lab: LabName }>> = {
  "degree-path": DegreePathScene,
  visitors: VisitorsScene,
  "joint-project": JointProjectScene,
};
