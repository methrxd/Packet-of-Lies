"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  displayName: string;
  avatarUrl: string | null;
  className?: string;
  imageClassName?: string;
};

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileAvatar({
  displayName,
  avatarUrl,
  className,
  imageClassName,
}: ProfileAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => initialsFromName(displayName), [displayName]);
  const showImage = Boolean(avatarUrl && !failed);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--accent-border)] bg-[color:rgba(2,249,109,0.08)] text-primary shadow-[0_0_0_1px_rgba(2,249,109,0.08),0_0_22px_rgba(2,249,109,0.14)]",
        className
      )}
    >
      {showImage ? (
        <Image
          src={avatarUrl ?? ""}
          alt={`${displayName} avatar`}
          width={96}
          height={96}
          unoptimized
          className={cn("size-full object-cover", imageClassName)}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-mono-ui text-[10px] font-semibold tracking-[0.08em]">
          {initials || "PL"}
        </span>
      )}
    </div>
  );
}
