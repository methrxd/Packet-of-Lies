import type { CSSProperties } from "react";

const MATRIX_COLUMNS = [
  { left: "3%", delay: "-2s", duration: "15s", text: "010010 POL 9F3A" },
  { left: "9%", delay: "-9s", duration: "18s", text: "HASH IOC CASE" },
  { left: "15%", delay: "-5s", duration: "21s", text: "101101 7A2F" },
  { left: "22%", delay: "-12s", duration: "17s", text: "MALWARE TRIAGE" },
  { left: "29%", delay: "-3s", duration: "19s", text: "00FF 91C2" },
  { left: "36%", delay: "-15s", duration: "22s", text: "ANALYZE CONTAIN" },
  { left: "43%", delay: "-7s", duration: "16s", text: "0101 IOC" },
  { left: "50%", delay: "-10s", duration: "24s", text: "PACKET OF LIES" },
  { left: "57%", delay: "-4s", duration: "18s", text: "EVIDENCE FLOW" },
  { left: "64%", delay: "-13s", duration: "20s", text: "110010 SIGMA" },
  { left: "71%", delay: "-6s", duration: "17s", text: "YARA VT HA" },
  { left: "78%", delay: "-11s", duration: "23s", text: "MITIGATE 0X4D" },
  { left: "85%", delay: "-8s", duration: "19s", text: "REPORT TIMELINE" },
  { left: "92%", delay: "-14s", duration: "21s", text: "001101 LOCK" },
  { left: "98%", delay: "-1s", duration: "16s", text: "CASE FEED" },
];

type MatrixBackdropProps = {
  intensity?: "full" | "subtle";
};

export function MatrixBackdrop({ intensity = "subtle" }: MatrixBackdropProps) {
  return (
    <div className={`matrix-backdrop matrix-backdrop--${intensity}`} aria-hidden="true">
      <div className="matrix-backdrop__base" />
      <div className="matrix-backdrop__grid" />
      <div className="matrix-backdrop__rain">
        {MATRIX_COLUMNS.map((column) => (
          <span
            key={`${column.left}-${column.text}`}
            className="matrix-backdrop__column"
            style={
              {
                "--matrix-left": column.left,
                "--matrix-delay": column.delay,
                "--matrix-duration": column.duration,
              } as CSSProperties
            }
          >
            {column.text}
          </span>
        ))}
      </div>
      <div className="matrix-backdrop__scanline" />
      <div className="matrix-backdrop__vignette" />
    </div>
  );
}
