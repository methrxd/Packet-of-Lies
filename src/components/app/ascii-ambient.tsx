"use client";

import { useEffect, useMemo, useState } from "react";

type AsciiAmbientProps = {
  className?: string;
  title?: string;
};

const verbs = [
  "watching",
  "tracking",
  "correlating",
  "isolating",
  "mapping",
  "verifying",
  "recording",
  "resolving",
];

const subjects = [
  "endpoint hash",
  "dns burst",
  "email artifact",
  "sandbox trace",
  "auth event",
  "process tree",
  "file mutation",
  "outbound callback",
];

const states = [
  "ok",
  "new",
  "triage",
  "investigating",
  "contained",
  "resolved",
];

function randomHex(length: number) {
  const chars = "abcdef0123456789";
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }
  return value;
}

function buildLine() {
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const token = randomHex(6);
  return `[${token}] ${verb} ${subject} :: state=${state}`;
}

const baseLines = [
  "[boot] packet-of-lies interface initialized",
  "[feed] case timeline channel connected",
  "[sync] snapshot interval 5s",
  "[guard] upload policy pdf<=5mb enforced",
  buildLine(),
  buildLine(),
  buildLine(),
  buildLine(),
  buildLine(),
];

export function AsciiAmbient({ className, title = "Realtime signal" }: AsciiAmbientProps) {
  const [lines, setLines] = useState<string[]>(baseLines);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLines((current) => {
        const next = [...current.slice(1), buildLine()];
        return next;
      });
    }, 900);

    return () => window.clearInterval(id);
  }, []);

  const rendered = useMemo(() => lines.join("\n"), [lines]);

  return (
    <div className={`helix-terminal relative overflow-hidden p-4 ${className ?? ""}`}>
      <div className="pointer-events-none absolute inset-0 ascii-noise opacity-55" />
      <p className="relative z-10 font-mono-ui text-[10px] tracking-[0.24em] text-[var(--text-muted)] uppercase">
        {title}
      </p>
      <pre className="relative z-10 mt-3 whitespace-pre-wrap break-words text-[12px] leading-6">
        {rendered}
      </pre>
      <div className="pointer-events-none absolute inset-0 ascii-scanline opacity-60" />
    </div>
  );
}

