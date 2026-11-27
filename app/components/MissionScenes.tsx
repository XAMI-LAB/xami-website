import type { CSSProperties } from "react";

/** Custom properties that time or size one part of an animated scene. */
const vars = (values: Record<`--${string}`, string | number>) => values as CSSProperties;

/** Four competing demands on a model settle into a balance. */
function BalanceScene() {
  const demands = [
    { label: "Accuracy", from: "96%", to: "74%" },
    { label: "Efficiency", from: "38%", to: "68%" },
    { label: "Complexity", from: "88%", to: "62%" },
    { label: "Interpretability", from: "18%", to: "72%" },
  ];
  return (
    <div className="mini bal">
      <span className="ok">
        <span className="tick" />
        Balanced
      </span>
      <ul>
        {demands.map((demand) => (
          <li key={demand.label}>
            {demand.label}
            <span className="track">
              <i style={vars({ "--a": demand.from, "--b": demand.to })} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Every step of the pipeline is checked off, one after another. */
function PipelineScene() {
  const steps = ["Data", "Features", "Model", "Prediction", "Decision"];
  return (
    <div className="mini pipewrap">
      <ol className="pipe">
        {steps.map((step, i) => (
          <li key={step} style={vars({ "--i": i })}>
            <i />
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** One explainable core reaches several domains in turn. */
function DomainsScene() {
  const domains = ["Healthcare", "Logistics", "Workforce", "Energy"];
  return (
    <div className="dom">
      <span className="core">
        <span className="orb" />
        Explainable AI
      </span>
      <span className="wire" />
      <ul>
        {domains.map((domain, i) => (
          <li key={domain} style={vars({ "--i": i })}>
            <i />
            {domain}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The illustrations above the mission points, in the order of the points. */
export const MISSION_SCENES = [BalanceScene, PipelineScene, DomainsScene];
