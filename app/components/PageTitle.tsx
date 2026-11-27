import { Network } from "./Network";

/** How every inner page opens: a ring, the page name, and a line that runs on with a signal. */
export function PageTitle({ children, clear = 0.5 }: { children: React.ReactNode; clear?: number }) {
  return (
    <section className="page-head">
      <Network clear={clear} />
      <div className="wrap ttl">
        <i />
        <h1>{children}</h1>
        <span className="ln">
          <b />
        </span>
      </div>
    </section>
  );
}
