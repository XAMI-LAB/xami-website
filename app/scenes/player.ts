// Plays a scene: a list of named steps, each of which changes the scene's elements (classes,
// words, a few style values) and then holds for a while. The scene's own CSS does the moving.

/** What a step can do to its scene. Selectors only ever look inside the scene. */
export type SceneActions<Memo = Record<string, never>> = {
  /** Values a scene keeps between its steps; emptied whenever the story starts over. */
  memo: Partial<Memo>;
  find(selector: string): HTMLElement | null;
  all(selector: string): HTMLElement[];
  /** Adds a class (by default "on") to every match. */
  on(selector: string, className?: string): void;
  off(selector: string, className?: string): void;
  /** Adds a class to the scene itself, which its CSS reads as the current state. */
  state(className: string): void;
  text(selector: string, text: string): void;
  /** Replays the small bounce on an element. */
  pop(selector: string): void;
  /** Calls `fn` again and again with the seconds passed, until the story starts over. */
  every(ms: number, fn: (seconds: number) => void): void;
  after(ms: number, fn: () => void): void;
  /** Shows or hides the drawn pointer. */
  cursor(visible: boolean): void;
  /** Glides the pointer onto an element; dx and dy are the spot within it, as shares of its size. */
  cursorTo(selector: string, dx?: number, dy?: number): void;
  /** A click of the drawn pointer, pressing the given button if there is one. */
  click(selector?: string): void;
};

export type SceneStep<Memo = Record<string, never>> = [
  name: string,
  holdMs: number,
  apply: (a: SceneActions<Memo>) => void,
];

export type SceneScript<Memo = Record<string, never>> = {
  /** The step a scene rests on when it is not playing. */
  restingStep: string;
  timeline: SceneStep<Memo>[];
};

/** The pause before the first step and the fade before the story repeats. */
const LEAD_IN_MS = 450;
const FADE_OUT_MS = 700;
/** A resting scene is left to settle for this long, then nothing in it ticks any more. */
const SETTLE_MS = 4000;

/** How long one telling of a scene's story takes, from blank to faded out. */
export function scriptDuration(script: SceneScript<never>): number {
  return LEAD_IN_MS + FADE_OUT_MS + script.timeline.reduce((total, step) => total + step[1], 0);
}

export type ScenePlayer = {
  /** Tells the story from the beginning, over and over. With reduced motion it rests instead. */
  play(): void;
  /** Jumps to the moment a step has just happened and stays there. */
  show(step: string): void;
  /** Stops and stays on the resting step. */
  rest(): void;
  /** Stops everything and puts the scene back as it was found. */
  dispose(): void;
};

export function createScenePlayer<Memo>(
  scene: HTMLElement,
  script: SceneScript<Memo>,
  onStep: (step: string) => void,
): ScenePlayer {
  const stage = scene.parentElement as HTMLElement;
  const baseClass = scene.className;
  // Every telling starts from untouched elements, so nothing carries over or eases from where it was.
  const untouched = Array.from(scene.childNodes, (node) => node.cloneNode(true));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { timeline, restingStep } = script;
  let run = 0;
  let timers: number[] = [];
  let tilted = false;

  const a: SceneActions<Memo> = {
    memo: {},
    find: (selector) => scene.querySelector<HTMLElement>(selector),
    all: (selector) => Array.from(scene.querySelectorAll<HTMLElement>(selector)),
    on: (selector, className = "on") => a.all(selector).forEach((el) => el.classList.add(className)),
    off: (selector, className = "on") => a.all(selector).forEach((el) => el.classList.remove(className)),
    state: (className) => scene.classList.add(className),
    text: (selector, text) => {
      const el = a.find(selector);
      if (el) el.textContent = text;
    },
    pop: (selector) => {
      const el = a.find(selector);
      if (!el) return;
      el.classList.remove("pop");
      void el.offsetWidth;
      el.classList.add("pop");
    },
    every: (ms, fn) => {
      const start = performance.now();
      timers.push(window.setInterval(() => fn((performance.now() - start) / 1000), ms));
    },
    after: (ms, fn) => {
      const mine = run;
      timers.push(
        window.setTimeout(() => {
          if (mine === run) fn();
        }, ms),
      );
    },
    cursor: (visible) => {
      const cursor = a.find(".cursor");
      if (cursor) cursor.style.opacity = visible ? "1" : "0";
    },
    cursorTo: (selector, dx = 0.6, dy = 0.6) => {
      const el = a.find(selector);
      const cursor = a.find(".cursor");
      if (!el || !cursor) return;
      let x = 0;
      let y = 0;
      for (let node: HTMLElement | null = el; node && node !== scene; node = node.offsetParent as HTMLElement | null) {
        x += node.offsetLeft;
        y += node.offsetTop;
      }
      cursor.style.translate = `${x + el.offsetWidth * dx}px ${y + el.offsetHeight * dy}px`;
    },
    click: (selector) => {
      const cursor = a.find(".cursor");
      if (cursor) {
        cursor.classList.remove("click");
        void cursor.offsetWidth;
        cursor.classList.add("click");
      }
      if (selector) {
        a.on(selector, "press");
        a.after(170, () => a.off(selector, "press"));
      }
    },
  };

  function stopTimers() {
    for (const timer of timers) window.clearTimeout(timer);
    timers = [];
  }
  function reset() {
    stopTimers();
    a.memo = {};
    scene.replaceChildren(...untouched.map((node) => node.cloneNode(true)));
    scene.className = baseClass + (tilted ? " manual" : "");
  }
  function wait(ms: number) {
    const mine = run;
    return new Promise<void>((resolve) => {
      timers.push(
        window.setTimeout(() => {
          if (mine === run) resolve();
        }, ms),
      );
    });
  }
  async function loop() {
    const mine = ++run;
    while (mine === run) {
      reset();
      await wait(LEAD_IN_MS);
      for (const [name, holdMs, apply] of timeline) {
        if (mine !== run) return;
        apply(a);
        onStep(name);
        await wait(holdMs);
      }
      if (mine !== run) return;
      scene.classList.add("fade");
      await wait(FADE_OUT_MS);
    }
  }
  function show(step: string) {
    run++;
    reset();
    for (const [name, , apply] of timeline) {
      apply(a);
      if (name === step) break;
    }
    onStep(step);
  }
  function rest() {
    show(restingStep);
    timers.push(window.setTimeout(stopTimers, SETTLE_MS));
  }

  // The scene leans a little towards the pointer while it is over the stage.
  function onPointerMove(e: PointerEvent) {
    const box = stage.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    tilted = true;
    scene.classList.add("manual");
    scene.style.transform = `rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
  }
  function onPointerLeave() {
    tilted = false;
    scene.style.transform = "";
    scene.classList.remove("manual");
  }
  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerleave", onPointerLeave);

  return {
    play: () => (reducedMotion ? rest() : void loop()),
    show,
    rest,
    dispose() {
      run++;
      stopTimers();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      scene.replaceChildren(...untouched);
      scene.className = baseClass;
      scene.style.transform = "";
    },
  };
}
