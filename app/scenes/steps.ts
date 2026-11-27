import type { SceneId } from "./Scene";

/** One line of a scene's walkthrough: the step of the story it describes, and the words shown for it. */
export type WalkthroughStep = { step: string; caption: string };

/** Each scene's story told in a few lines, in order, for showing beside the scene. */
export const WALKTHROUGHS: Record<SceneId, WalkthroughStep[]> = {
  "loan-decision": [
    { step: "declined", caption: "An AI model declines a home loan." },
    { step: "why", caption: "It shows what drove the decision." },
    { step: "changed", caption: "It shows what would change the outcome." },
  ],
  "chest-xray": [
    { step: "gaze", caption: "A radiologist reads a chest X-ray." },
    { step: "found", caption: "The AI model marks where it is looking." },
    { step: "finding", caption: "It reports its finding and how confident it is." },
    { step: "confirmed", caption: "The radiologist confirms the finding." },
  ],
  "chilled-shipment": [
    { step: "moving", caption: "A shipment is tracked step by step." },
    { step: "fault", caption: "Sensors on the truck pick up a fault." },
    { step: "flag", caption: "The step is flagged and a delay is predicted." },
    { step: "alerted", caption: "The depot is alerted before the truck arrives." },
  ],
  "invoice-handoff": [
    { step: "assign1", caption: "Work is shared between software bots and AI agents." },
    { step: "done1", caption: "Routine steps are completed automatically." },
    { step: "handoff", caption: "An AI agent hands an unusual case to a person." },
    { step: "approved", caption: "The person checks and approves it." },
  ],
  "battery-plan": [
    { step: "forecast", caption: "Electricity prices are forecast for the next 24 hours." },
    { step: "plan", caption: "A plan is made: charge when cheap, sell at the peak." },
    { step: "run", caption: "The battery follows the plan through the day." },
  ],
};
