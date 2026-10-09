const PHRASES = [
  "Plans, not messages",
  "Scoped sharing",
  "Your keys, your models",
  "Approval before action",
  "A record, not a summary",
];

/** A slow, endless ticker. The list is rendered twice so the loop joins without a visible seam. */
export function Marquee() {
  const items = [...PHRASES, ...PHRASES];
  return (
    <div className="marquee" aria-label="Oriel principles">
      <div className="marquee-track" aria-hidden="true">
        {items.map((text, i) => (
          <span key={`${text}-${i}`}>{text}</span>
        ))}
      </div>
    </div>
  );
}
