import { type CSSProperties, memo } from "react";
import type { SceneActions, SceneScript } from "./player";

/** The electricity price for each hour of the day, as a share of the day's peak. The first 8 hours are already known. */
const PRICE = [38, 34, 30, 30, 33, 40, 58, 72, 70, 56, 40, 26, 20, 22, 30, 46, 64, 86, 100, 94, 78, 60, 48, 42];
const KNOWN_HOURS = 8;
const isChargeHour = (hour: number) => hour >= 11 && hour <= 14;
const isSellHour = (hour: number) => hour >= 17 && hour <= 20;

/** A price forecast for the next 24 hours, and the battery plan it drives: charge when cheap, sell at the peak. */
export const BatteryPlanMarkup = memo(function BatteryPlanMarkup() {
  return (
    <>
      <article className="card chart" style={{ left: 34, top: 30, width: 404 }}>
        <header className="hd">
          <span className="tile">$</span>
          <div>
            <b>Electricity price</b>
            <small>The next 24 hours</small>
          </div>
          <span className="chip spos">
            <span className="orb sm" />
            <span className="pt">AI forecast</span>
          </span>
        </header>
        <div className="bars">
          {PRICE.map((price, hour) => {
            const known = hour < KNOWN_HOURS;
            const className = [known && "p", isChargeHour(hour) && "c", isSellHour(hour) && "s"]
              .filter(Boolean)
              .join(" ");
            // Known hours rise one after another, and so do the forecast hours later on.
            const order = known ? hour : hour - KNOWN_HOURS;
            return <i key={hour} className={className} style={{ "--v": `${price}%`, "--i": order } as CSSProperties} />;
          })}
          <span className="now" />
        </div>
        <div className="planrow">
          <span className="seg c" style={{ gridColumn: "12/16" }}>
            Charge
          </span>
          <span className="seg s" style={{ gridColumn: "18/22" }}>
            Sell
          </span>
        </div>
        <div className="axis">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </article>
      <article className="card battery" style={{ left: 454, top: 30, width: 162 }}>
        <h4>Grid battery</h4>
        <div className="cell">
          <i />
        </div>
        <span className="pct">30%</span>
        <span className="chip bst">
          <i />
          <span className="bt">Waiting</span>
        </span>
      </article>
      <article className="card whycard" style={{ left: 34, top: 318, width: 582 }}>
        <h4>Why this plan</h4>
        <ul>
          <li>
            <i style={{ background: "var(--teal-lit)" }} />
            <span>
              <b>Midday:</b> solar power makes electricity cheap, so the battery charges.
            </span>
          </li>
          <li>
            <i style={{ background: "var(--coral)" }} />
            <span>
              <b>Evening:</b> demand peaks and prices rise, so the battery sells.
            </span>
          </li>
        </ul>
      </article>
    </>
  );
});

type Battery = { activity: string };

/** How full the battery is at a time of day: it fills over midday, holds, then empties over the evening peak. */
function chargeLevel(hour: number) {
  if (hour < 11) return 0.3;
  if (hour < 15) return 0.3 + (0.62 * (hour - 11)) / 4;
  if (hour < 17) return 0.92;
  if (hour < 21) return 0.92 - (0.78 * (hour - 17)) / 4;
  return 0.14;
}

/** Moves the scene to a time of day: the "now" line, the hours gone by, and what the battery is doing. */
function setTimeOfDay(a: SceneActions<Battery>, hour: number) {
  const activity =
    hour >= 11 && hour < 15
      ? "Charging"
      : hour >= 17 && hour < 21
        ? "Selling"
        : hour >= 15 && hour < 17
          ? "Holding"
          : "Waiting";
  const level = chargeLevel(hour);
  const cell = a.find(".cell");
  const chip = a.find(".bst");
  a.find(".now")?.style.setProperty("--h", hour.toFixed(2));
  a.all(".bars i").forEach((bar, i) => {
    bar.classList.toggle(
      "gone",
      i >= KNOWN_HOURS && i < Math.floor(hour) && !bar.classList.contains("c") && !bar.classList.contains("s"),
    );
  });
  cell?.querySelector("i")?.style.setProperty("--lvl", level.toFixed(3));
  cell?.classList.toggle("sell", activity === "Selling");
  a.text(".pct", `${Math.round(level * 100)}%`);
  if (a.memo.activity !== activity) {
    a.memo.activity = activity;
    a.text(".bst .bt", activity);
    if (chip) chip.className = "chip bst" + (activity === "Charging" ? " pos" : activity === "Selling" ? " neg" : "");
    a.pop(".bst");
  }
}

export const batteryPlanScript: SceneScript<Battery> = {
  restingStep: "plan",
  timeline: [
    [
      "enter",
      1300,
      (a) => {
        a.on(".chart");
        a.on(".battery");
      },
    ],
    [
      "forecast",
      1800,
      (a) => {
        a.state("forecast");
        a.on(".chart", "busy");
        a.text(".pt", "Forecasting");
      },
    ],
    [
      "plan",
      2200,
      (a) => {
        a.state("plan");
        a.off(".chart", "busy");
        a.text(".pt", "AI forecast");
        a.on(".whycard");
      },
    ],
    // The rest of the day runs by in 6.6 seconds, from 08:00 to just before midnight.
    [
      "run",
      7400,
      (a) => {
        a.every(50, (seconds) => setTimeOfDay(a, Math.min(23.6, 8 + (seconds / 6.6) * 15.6)));
      },
    ],
  ],
};
