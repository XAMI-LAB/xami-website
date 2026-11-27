import { type CSSProperties, memo } from "react";
import type { SceneActions, SceneScript } from "./player";

/** Today's supplier invoices are shared out: software bots take the rule-based steps, AI agents the judgement, a person the exception. */
export const InvoiceHandoffMarkup = memo(function InvoiceHandoffMarkup() {
  return (
    <>
      <article className="card queue" style={{ left: 34, top: 30, width: 362 }}>
        <header className="hd">
          <span className="tile">In</span>
          <div>
            <b>Supplier invoices</b>
            <small>Today's incoming work</small>
          </div>
        </header>
        <ul>
          <li className="task" style={{ "--i": 0 } as CSSProperties}>
            <span className="doc">
              <span className="tick" />
            </span>
            <div>
              <b>Enter invoice details</b>
              <small>Copy fields into the system</small>
            </div>
            <span className="who" />
          </li>
          <li className="task" style={{ "--i": 1 } as CSSProperties}>
            <span className="doc">
              <span className="tick" />
            </span>
            <div>
              <b>Check against the contract</b>
              <small>Read the terms and compare</small>
            </div>
            <span className="who" />
          </li>
          <li className="task" style={{ "--i": 2 } as CSSProperties}>
            <span className="doc">
              <span className="tick" />
            </span>
            <div>
              <b>Approve $48,200 payment</b>
              <small className="sub">Decide whether to pay</small>
            </div>
            <span className="who" />
          </li>
          <li className="task" style={{ "--i": 3 } as CSSProperties}>
            <span className="doc">
              <span className="tick" />
            </span>
            <div>
              <b>Schedule the payment</b>
              <small>Book it with the bank</small>
            </div>
            <span className="who" />
          </li>
        </ul>
      </article>
      <article className="card force" style={{ left: 408, top: 52, width: 208 }}>
        <h4>Who does what</h4>
        <small>Learned from past work records</small>
        <div className="lane">
          <span className="ic bot" />
          <div>
            <b>Software bots</b>
            <small>Rule-based steps</small>
            <span className="ld">
              <span className="track">
                <i className="bar pos l-bot" />
              </span>
              <em className="n-bot">0</em>
            </span>
          </div>
        </div>
        <div className="lane">
          <span className="ic">
            <span className="orb sm" />
          </span>
          <div>
            <b>AI agents</b>
            <small>Reading and judgement</small>
            <span className="ld">
              <span className="track">
                <i className="bar pos l-agent" />
              </span>
              <em className="n-agent">0</em>
            </span>
          </div>
        </div>
        <div className="lane">
          <span className="ic person" />
          <div>
            <b>People</b>
            <small>Approvals, exceptions</small>
            <span className="ld">
              <span className="track">
                <i className="bar pos l-person" />
              </span>
              <em className="n-person">0</em>
            </span>
          </div>
        </div>
      </article>
      <article className="card lift handoff" style={{ left: 110, top: 358, width: 440 }}>
        <span className="ic">
          <span className="orb sm" />
        </span>
        <div>
          <b>AI agent to the finance lead</b>
          <p>This is three times the supplier's usual amount. Please check it.</p>
        </div>
        <span className="btn solid approve">
          <span className="bt">Approve</span>
        </span>
      </article>
      <div className="cursor" />
    </>
  );
});

const WORKERS = ["bot", "agent", "person"] as const;
type Worker = (typeof WORKERS)[number];
const WORKER_LABEL: Record<Worker, string> = { bot: "Software bot", agent: "AI agent", person: "Finance lead" };

type Workload = { taskCount: Record<Worker, number>; assignee: Record<number, Worker> };

/** Gives a task to a kind of worker and updates how much each kind is carrying. */
function assign(a: SceneActions<Workload>, taskIndex: number, worker: Worker) {
  const taskCount = (a.memo.taskCount ??= { bot: 0, agent: 0, person: 0 });
  const assignee = (a.memo.assignee ??= {});
  const previous = assignee[taskIndex];
  if (previous) taskCount[previous]--;
  assignee[taskIndex] = worker;
  taskCount[worker]++;
  const task = a.all(".task")[taskIndex];
  const badge = task.querySelector<HTMLElement>(".who");
  if (badge) {
    badge.className = `who ${worker}`;
    badge.textContent = WORKER_LABEL[worker];
    void badge.offsetWidth;
    badge.classList.add("on");
  }
  task.classList.add("busy");
  for (const kind of WORKERS) {
    a.find(`.l-${kind}`)?.style.setProperty("--w", String(taskCount[kind] / 2));
    a.text(`.n-${kind}`, String(taskCount[kind]));
  }
}

function finish(a: SceneActions<Workload>, taskIndex: number) {
  const task = a.all(".task")[taskIndex];
  task.classList.remove("busy");
  task.classList.add("done");
}

export const invoiceHandoffScript: SceneScript<Workload> = {
  restingStep: "handoff",
  timeline: [
    [
      "enter",
      1300,
      (a) => {
        a.on(".queue");
        a.on(".force");
      },
    ],
    [
      "assign1",
      650,
      (a) => {
        assign(a, 0, "bot");
      },
    ],
    [
      "assign2",
      650,
      (a) => {
        assign(a, 1, "agent");
      },
    ],
    [
      "assign3",
      650,
      (a) => {
        assign(a, 2, "agent");
      },
    ],
    [
      "assign4",
      900,
      (a) => {
        assign(a, 3, "bot");
      },
    ],
    [
      "done1",
      550,
      (a) => {
        finish(a, 0);
      },
    ],
    [
      "done4",
      700,
      (a) => {
        finish(a, 3);
      },
    ],
    [
      "done2",
      1000,
      (a) => {
        finish(a, 1);
      },
    ],
    [
      "handoff",
      2600,
      (a) => {
        const task = a.all(".task")[2];
        task.classList.add("flag");
        a.text(".sub", "Unusual for this supplier");
        assign(a, 2, "person");
        task.classList.remove("busy");
        a.on(".handoff");
      },
    ],
    [
      "toApprove",
      1050,
      (a) => {
        a.cursor(true);
        a.cursorTo(".approve");
      },
    ],
    [
      "approved",
      3600,
      (a) => {
        a.click(".approve");
        a.on(".approve", "ok");
        a.text(".approve .bt", "Approved");
        a.all(".task")[2].classList.remove("flag");
        a.text(".sub", "Checked by the finance lead");
        finish(a, 2);
        a.after(900, () => a.cursor(false));
      },
    ],
  ],
};
