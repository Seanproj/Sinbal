"use client";
import { compareActions, MAX_COMPARE, useCompareIds } from "@/lib/compare-store";
import { announce } from "./Announcer";

export function CompareButton({ id, name, size = "sm" }: { id: string; name: string; size?: "sm" | "md" }) {
  const ids = useCompareIds();
  const on = ids.includes(id);
  const full = !on && ids.length >= MAX_COMPARE;
  const onClick = () => {
    const r = compareActions.toggle(id);
    if (r === "full") announce(`비교는 최대 ${MAX_COMPARE}켤레까지 가능합니다. 하나를 빼고 추가하세요.`);
    else announce(r === "added" ? `${name} 비교에 추가 (${ids.length + 1}/${MAX_COMPARE})` : `${name} 비교에서 제거`);
  };
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-disabled={full || undefined}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1 rounded-md border font-medium ${
        size === "md" ? "px-3.5 py-2 text-sm" : "px-2.5 py-1.5 text-xs"
      } ${
        on
          ? "border-accent bg-accent text-accent-fg"
          : full
            ? "cursor-not-allowed border-line text-muted opacity-60"
            : "border-line bg-surface text-fg hover:border-accent hover:text-accent"
      }`}
    >
      <span aria-hidden="true">{on ? "✓" : "+"}</span>
      {on ? "비교 중" : "비교"}
      <span className="sr-only"> {name}</span>
    </button>
  );
}
