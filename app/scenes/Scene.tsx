import "./scenes.css";

import { type ComponentType, type Ref, useEffect, useImperativeHandle, useRef } from "react";
import { BatteryPlanMarkup, batteryPlanScript } from "./BatteryPlan";
import { ChestXrayMarkup, chestXrayScript } from "./ChestXray";
import { ChilledShipmentMarkup, chilledShipmentScript } from "./ChilledShipment";
import { InvoiceHandoffMarkup, invoiceHandoffScript } from "./InvoiceHandoff";
import { LoanDecisionMarkup, loanDecisionScript } from "./LoanDecision";
import { SCENE_IDS, type SceneId } from "~/content/model";
import { type ScenePlayer, type SceneScript, createScenePlayer, scriptDuration } from "./player";

export { SCENE_IDS, type SceneId };

// Each script keeps its own kind of notes between steps, which nothing outside the script reads.
const SCENES: Record<SceneId, { Markup: ComponentType; script: SceneScript<never> }> = {
  "loan-decision": { Markup: LoanDecisionMarkup, script: loanDecisionScript },
  "chest-xray": { Markup: ChestXrayMarkup, script: chestXrayScript },
  "chilled-shipment": { Markup: ChilledShipmentMarkup, script: chilledShipmentScript },
  "invoice-handoff": { Markup: InvoiceHandoffMarkup, script: invoiceHandoffScript },
  "battery-plan": { Markup: BatteryPlanMarkup, script: batteryPlanScript },
};

/** The names of a scene's steps, in the order its story reaches them. */
export function sceneSteps(id: SceneId): string[] {
  return SCENES[id].script.timeline.map(([name]) => name);
}

/** How long one telling of a scene's story takes, in milliseconds, before it starts over. */
export function sceneDuration(id: SceneId): number {
  return scriptDuration(SCENES[id].script);
}

/** The size a scene is drawn at. Narrower places get the whole scene shrunk to fit. */
const DESIGN_WIDTH = 650;

export type SceneHandle = {
  /** Tells the story again from the beginning. */
  play(): void;
  /** Jumps to the moment the named step has just happened, and stays there. */
  show(step: string): void;
};

export type SceneProps = {
  id: SceneId;
  /** While false the scene does not move: it rests on its final still. Turning it on starts the story from the beginning. */
  playing?: boolean;
  /** Called with the step's name each time the story reaches a step, and when a step is shown. */
  onStep?: (step: string) => void;
  ref?: Ref<SceneHandle>;
};

/** One of the animated example scenes: a small mock interface that plays a short story in a loop. */
export function Scene({ id, playing = true, onStep, ref }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const player = useRef<ScenePlayer>(null);
  const onStepLatest = useRef(onStep);
  const { Markup } = SCENES[id];

  useEffect(() => {
    onStepLatest.current = onStep;
  });

  // The player works on the scene's elements directly, so React never has to redraw them as the story moves.
  useEffect(() => {
    if (!scene.current) return;
    const created = createScenePlayer(scene.current, SCENES[id].script, (step) => onStepLatest.current?.(step));
    player.current = created;
    return () => {
      created.dispose();
      player.current = null;
    };
  }, [id]);

  useEffect(() => {
    if (playing) player.current?.play();
    else player.current?.rest();
  }, [id, playing]);

  useEffect(() => {
    const box = root.current;
    if (!box) return;
    const fit = () => box.style.setProperty("--scene-scale", String(Math.min(1, box.clientWidth / DESIGN_WIDTH)));
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useImperativeHandle(
    ref,
    () => ({ play: () => player.current?.play(), show: (step) => player.current?.show(step) }),
    [],
  );

  // A scene is a picture of an example; the words beside it say what it shows, so it is kept from screen readers.
  return (
    <div className="scene-stage" ref={root} aria-hidden="true">
      <div className="scene-frame">
        {/* A new scene gets a new element, because the player has rearranged what is inside the old one. */}
        <div className={`scene ${id}`} key={id} ref={scene}>
          <Markup />
        </div>
      </div>
    </div>
  );
}
