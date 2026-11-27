import { memo } from "react";
import type { SceneActions, SceneScript } from "./player";

/** How many readings each sensor chart shows. */
const READINGS = 14;
const chartBars = Array.from({ length: READINGS }, (_, i) => <i key={i} />);

/** A chilled shipment is tracked step by step; sensors on the truck catch a cooling fault before it arrives. */
export const ChilledShipmentMarkup = memo(function ChilledShipmentMarkup() {
  return (
    <>
      <article className="card process" style={{ left: 34, top: 30, width: 582 }}>
        <header className="hd">
          <span className="tile">7C</span>
          <div>
            <b>Shipment 7C-204</b>
            <small>Chilled medicines, kept between 2 and 8 °C</small>
          </div>
          <span className="chip spos status">
            <i />
            <span className="stt">On time</span>
          </span>
        </header>
        <ol className="steps">
          <span className="prog" />
          <li className="step done">
            <span className="d" />
            <b>Warehouse</b>
            <small>08:10</small>
          </li>
          <li className="step now">
            <span className="d" />
            <b>Loading</b>
            <small>08:40</small>
          </li>
          <li className="step">
            <span className="d" />
            <b>On the road</b>
            <small>09:05</small>
          </li>
          <li className="step">
            <span className="d" />
            <b>Depot</b>
            <small>12:30</small>
          </li>
          <li className="step">
            <span className="d" />
            <b>Delivery</b>
            <small className="eta">13:00</small>
          </li>
        </ol>
      </article>
      <article className="card sensors" style={{ left: 34, top: 206, width: 290 }}>
        <h4>
          Live sensor data <small>from the truck</small>
        </h4>
        <div className="sr">
          <span>Temperature</span>
          <span className="spark sp-t">{chartBars}</span>
          <b className="tv">4.2 °C</b>
        </div>
        <div className="sr">
          <span>Vibration</span>
          <span className="spark sp-v">{chartBars}</span>
          <b>Low</b>
        </div>
        <div className="sr">
          <span>Cargo door</span>
          <span className="chip spos door">
            <i />
            <span className="dt">Closed</span>
          </span>
        </div>
      </article>
      <article className="card lift alert" style={{ left: 338, top: 222, width: 278 }}>
        <span className="chip neg">
          <i />
          Problem found
        </span>
        <h4>Cooling is failing on the road</h4>
        <p className="lbl">
          <span className="orb sm" />
          Why the system thinks so
        </p>
        <ul>
          <li>Temperature above 8 °C and rising</li>
          <li>Cargo door opened at 10:14</li>
        </ul>
        <div className="actions">
          <div>
            New delivery time<b>13:50</b>
          </div>
          <span className="btn solid notify">
            <span className="bt">Alert the depot</span>
          </span>
        </div>
      </article>
      <div className="cursor" />
    </>
  );
});

type Sensors = { temperature: number[]; vibration: number[]; coolingFault: boolean };

/** Starts the live sensor charts: a new reading every 240 ms, with the temperature climbing once the cooling fails. */
function startSensors(a: SceneActions<Sensors>) {
  const temperature = (a.memo.temperature = Array.from({ length: READINGS }, () => 4.2 + (Math.random() - 0.5) * 0.5));
  const vibration = (a.memo.vibration = Array.from({ length: READINGS }, () => 20 + Math.random() * 30));
  function draw() {
    const temperatureBars = a.all(".sp-t i");
    const vibrationBars = a.all(".sp-v i");
    const latest = temperature[READINGS - 1];
    const readout = a.find(".tv");
    temperature.forEach((value, k) => {
      temperatureBars[k].style.setProperty("--h", `${Math.min(100, (value / 11) * 100).toFixed(0)}%`);
      temperatureBars[k].classList.toggle("hot", value > 8);
    });
    vibration.forEach((value, k) => vibrationBars[k].style.setProperty("--h", `${value.toFixed(0)}%`));
    if (readout) {
      readout.textContent = `${latest.toFixed(1)} °C`;
      readout.classList.toggle("hot", latest > 8);
    }
  }
  draw();
  a.every(240, () => {
    const latest = temperature[READINGS - 1];
    const target = a.memo.coolingFault ? 9.7 : 4.2;
    temperature.shift();
    temperature.push(latest + (target - latest) * 0.2 + (Math.random() - 0.5) * 0.3);
    vibration.shift();
    vibration.push(20 + Math.random() * 30);
    draw();
  });
}

export const chilledShipmentScript: SceneScript<Sensors> = {
  restingStep: "flag",
  timeline: [
    [
      "enter",
      1000,
      (a) => {
        a.on(".process");
        a.on(".sensors");
        startSensors(a);
      },
    ],
    [
      "moving",
      2600,
      (a) => {
        const steps = a.all(".step");
        steps[1].className = "step done";
        steps[2].className = "step now";
        a.find(".steps")?.style.setProperty("--p", "0.5");
      },
    ],
    [
      "fault",
      2300,
      (a) => {
        a.memo.coolingFault = true;
        a.off(".door", "spos");
        a.on(".door", "sneg");
        a.text(".dt", "Opened 10:14");
        a.pop(".door");
      },
    ],
    [
      "flag",
      2800,
      (a) => {
        a.all(".step")[2].classList.add("flag");
        a.off(".status", "spos");
        a.on(".status", "neg");
        a.text(".stt", "Delay predicted");
        a.pop(".status");
        a.text(".eta", "13:50");
        a.on(".eta", "late");
        a.on(".alert");
      },
    ],
    [
      "toNotify",
      1050,
      (a) => {
        a.cursor(true);
        a.cursorTo(".notify");
      },
    ],
    [
      "alerted",
      3600,
      (a) => {
        a.click(".notify");
        a.on(".notify", "ok");
        a.text(".notify .bt", "Depot alerted");
        a.after(900, () => a.cursor(false));
      },
    ],
  ],
};
