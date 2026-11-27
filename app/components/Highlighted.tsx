/** A sentence with one phrase shown in the logo colours. */
export function Highlighted({ text, highlight }: { text: string; highlight: string }) {
  const at = text.indexOf(highlight);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="grad">{highlight}</span>
      {text.slice(at + highlight.length)}
    </>
  );
}
