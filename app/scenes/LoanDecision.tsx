import { type CSSProperties, memo } from "react";
import type { SceneScript } from "./player";

/** A home loan is declined; the AI model says what drove the decision and what would change it. */
export const LoanDecisionMarkup = memo(function LoanDecisionMarkup() {
  return (
    <>
      <div className="pill" style={{ left: 36, top: 38 }}>
        <span className="orb" />
        <span className="pt">AI model</span>
      </div>
      <span className="wire" style={{ left: 54, top: 76 }} />
      <article className="card app" style={{ left: 36, top: 92, width: 292 }}>
        <header className="hd">
          <span className="tile">A</span>
          <div>
            <b>Home loan application</b>
            <small>Applicant 2841 · $320,000</small>
          </div>
        </header>
        <dl className="facts">
          <span className="scan" />
          <div>
            <dt>Annual income</dt>
            <dd className="swap">
              <span className="old">$68,400</span>
              <span className="new">$72,600</span>
            </dd>
          </div>
          <div>
            <dt>Credit history</dt>
            <dd>4 years</dd>
          </div>
          <div>
            <dt>Existing debt</dt>
            <dd>$21,000</dd>
          </div>
        </dl>
        <footer className="ft">
          <span className="chip verdict">
            <i />
            <span className="vt">Deciding</span>
          </span>
          <span className="btn why-btn">Why this decision?</span>
        </footer>
      </article>
      <article className="card lift why" style={{ left: 318, top: 186, width: 296 }}>
        <h4>What drove the decision</h4>
        <ul className="rows">
          <li>
            <span>Income</span>
            <span className="track">
              <i className="bar" style={{ "--w": 0.84 } as CSSProperties} />
            </span>
            <em className="inc">against</em>
          </li>
          <li>
            <span>Credit history</span>
            <span className="track">
              <i className="bar pos" style={{ "--w": 0.4 } as CSSProperties} />
            </span>
            <em className="pos">in favour</em>
          </li>
          <li>
            <span>Existing debt</span>
            <span className="track">
              <i className="bar" style={{ "--w": 0.3 } as CSSProperties} />
            </span>
            <em>against</em>
          </li>
        </ul>
        <div className="cf">
          <span className="switch">
            <i />
          </span>
          <div>
            <small>What would change it</small>
            <b>An income of $72,600</b>
          </div>
        </div>
      </article>
      <div className="cursor" />
    </>
  );
});

export const loanDecisionScript: SceneScript = {
  restingStep: "why",
  timeline: [
    [
      "enter",
      1100,
      (a) => {
        a.on(".pill");
        a.on(".wire");
        a.on(".app");
      },
    ],
    [
      "deciding",
      1500,
      (a) => {
        a.state("deciding");
        a.on(".pill", "busy");
        a.text(".pt", "Deciding");
      },
    ],
    [
      "declined",
      1300,
      (a) => {
        a.state("declined");
        a.off(".pill", "busy");
        a.text(".pt", "AI model");
        a.text(".vt", "Declined");
        a.on(".verdict", "neg");
        a.pop(".verdict");
      },
    ],
    [
      "toWhy",
      1050,
      (a) => {
        a.cursor(true);
        a.cursorTo(".why-btn");
      },
    ],
    [
      "why",
      2700,
      (a) => {
        a.click(".why-btn");
        a.on(".why-btn", "solid");
        a.on(".why");
      },
    ],
    [
      "toSwitch",
      1050,
      (a) => {
        a.cursorTo(".switch", 0.5, 0.6);
      },
    ],
    [
      "changed",
      4200,
      (a) => {
        a.click();
        a.state("cf-on");
        a.off(".verdict", "neg");
        a.on(".verdict", "pos");
        a.text(".vt", "Approved");
        a.pop(".verdict");
        a.text(".inc", "in favour");
        a.on(".inc", "pos");
        a.after(900, () => a.cursor(false));
      },
    ],
  ],
};
