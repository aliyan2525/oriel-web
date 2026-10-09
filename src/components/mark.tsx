type MarkProps = { size?: number; animate?: boolean };

/** The Oriel mark: an arch-shaped bay window with two connected agents. Decorative. */
export function Mark({ size = 32, animate = false }: MarkProps) {
  return (
    <svg
      className={animate ? "mark mark-animate" : "mark"}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
    >
      <path className="frame" d="M24 104V60a36 36 0 0 1 72 0v44" fill="none" stroke="#534AB7" strokeWidth={10} />
      <path className="frame" d="M14 108H106" stroke="#534AB7" strokeWidth={10} strokeLinecap="round" />
      <path className="link" d="M58 80H62" stroke="#534AB7" strokeWidth={3} />
      <circle className="dot dot-a" cx={50} cy={80} r={8} fill="#EF9F27" />
      <circle className="dot dot-b" cx={70} cy={80} r={8} fill="#EF9F27" />
    </svg>
  );
}
