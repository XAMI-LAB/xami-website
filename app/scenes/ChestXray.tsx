import { type CSSProperties, memo } from "react";
import type { SceneScript } from "./player";

/** Where the radiologist's eyes rest on the image, in order. */
const GAZE: [x: number, y: number][] = [
  [70, 68],
  [98, 122],
  [152, 94],
  [192, 126],
  [186, 172],
];

/** A radiologist reads a chest X-ray; the AI model shows where it looked and what it found; the radiologist decides. */
export const ChestXrayMarkup = memo(function ChestXrayMarkup() {
  return (
    <>
      <article className="card viewer" style={{ left: 34, top: 30, width: 296 }}>
        <header className="hd">
          <span className="tile">XR</span>
          <div>
            <b>Chest X-ray</b>
            <small>Patient 0192</small>
          </div>
          <span className="chip pos">
            <i />
            Confirmed
          </span>
        </header>
        <div className="xray">
          <span className="body" />
          <span className="lung l">
            <i />
          </span>
          <span className="lung r">
            <i />
          </span>
          <span className="heart" />
          <span className="spine" />
          <span className="clav l" />
          <span className="clav r" />
          <span className="dia" />
          <span className="vig" />
          <span className="mark">R</span>
          <span className="sweep" />
          <span className="heat" />
          <span className="box" />
          <span className="tag">AI</span>
          {GAZE.slice(1).map(([x, y], i) => {
            const [fromX, fromY] = GAZE[i];
            const dx = x - fromX;
            const dy = y - fromY;
            const line = {
              "--i": i,
              left: fromX,
              top: fromY,
              width: `${Math.hypot(dx, dy).toFixed(1)}px`,
              rotate: `${((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1)}deg`,
            };
            return <span key={i} className="gl" style={line as CSSProperties} />;
          })}
          {GAZE.map(([x, y], i) => (
            <span key={i} className="gz" style={{ "--i": i, left: x, top: y } as CSSProperties} />
          ))}
        </div>
        <div className="legend">
          <span>
            <i className="g" />
            Radiologist's gaze
          </span>
          <span>
            <i className="a" />
            AI focus
          </span>
        </div>
      </article>
      <div className="pill" style={{ left: 346, top: 112 }}>
        <span className="orb" />
        <span className="pt">AI model</span>
      </div>
      <span className="wire" style={{ left: 364, top: 150 }} />
      <article className="card lift finding" style={{ left: 318, top: 166, width: 298 }}>
        <h4>
          <span className="orb sm" />
          AI finding
        </h4>
        <p className="big">Possible opacity</p>
        <small>Lower lung</small>
        <ul className="rows">
          <li>
            <span>Confidence</span>
            <span className="track">
              <i className="bar pos" style={{ "--w": 0.87 } as CSSProperties} />
            </span>
            <em className="pos">87%</em>
          </li>
        </ul>
        <p className="match">
          <span className="tick" />
          Matches where the radiologist looked
        </p>
        <div className="actions">
          <span className="btn solid confirm">
            <span className="bt">Confirm finding</span>
          </span>
          <span className="btn">Dismiss</span>
        </div>
      </article>
      <div className="cursor" />
    </>
  );
});

export const chestXrayScript: SceneScript = {
  restingStep: "finding",
  timeline: [
    [
      "enter",
      1000,
      (a) => {
        a.on(".viewer");
      },
    ],
    // The gaze marks must be laid out unseen first, or they would appear without easing in.
    [
      "gaze",
      2500,
      (a) => {
        void a.find(".xray")?.offsetWidth;
        a.state("gaze");
      },
    ],
    [
      "analyse",
      1500,
      (a) => {
        a.on(".pill");
        a.on(".pill", "busy");
        a.on(".wire");
        a.text(".pt", "Analysing");
        a.state("analysing");
      },
    ],
    [
      "found",
      1200,
      (a) => {
        a.state("found");
        a.off(".pill", "busy");
        a.text(".pt", "AI model");
      },
    ],
    [
      "finding",
      2600,
      (a) => {
        a.on(".finding");
      },
    ],
    [
      "toConfirm",
      1050,
      (a) => {
        a.cursor(true);
        a.cursorTo(".confirm");
      },
    ],
    [
      "confirmed",
      3800,
      (a) => {
        a.click(".confirm");
        a.on(".confirm", "ok");
        a.text(".confirm .bt", "Confirmed");
        a.state("confirmed");
        a.after(900, () => a.cursor(false));
      },
    ],
  ],
};
