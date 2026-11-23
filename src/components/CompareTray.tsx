"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { compareActions, MAX_COMPARE, useCompareIds } from "@/lib/compare-store";

/** 화면 하단에 고정되는 비교 바구니. 비교 페이지에서는 숨깁니다. */
export function CompareTray() {
  const ids = useCompareIds();
  const path = usePathname();
  if (ids.length === 0 || path.startsWith("/compare")) return null;
  return (
    <aside aria-label="비교 목록" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex gap-1" aria-hidden="true">
          {Array.from({ length: MAX_COMPARE }).map((_, i) => (
            <span key={i} className={`h-2 w-5 rounded-full ${i < ids.length ? "bg-accent" : "bg-line"}`} />
          ))}
        </div>
        <p className="text-sm">
          <strong>{ids.length}</strong>
          <span className="text-muted">/{MAX_COMPARE}켤레 선택</span>
        </p>
        <button type="button" onClick={() => compareActions.clear()} className="ml-auto text-xs text-muted underline-offset-2 hover:underline">
          비우기
        </button>
        <Link
          href="/compare"
          className={`rounded-md px-3.5 py-2 text-sm font-semibold ${
            ids.length >= 2 ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted"
          }`}
        >
          {ids.length >= 2 ? "비교하기 →" : "1켤레 더 선택"}
        </Link>
      </div>
    </aside>
  );
}
