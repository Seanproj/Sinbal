"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { bestIndexes, COMPARE_ROWS, isDifferent } from "@/lib/compare";
import { compareActions, MAX_COMPARE, useCompareIds } from "@/lib/compare-store";
import { formatMoney } from "@/lib/format";
import { currencyPref } from "@/lib/prefs";
import type { Shoe } from "@/lib/schema";
import { announce } from "./Announcer";
import { ScoreDots } from "./ScoreDots";
import { ShoeThumb } from "./ShoeThumb";

export function CompareView({ allShoes }: { allShoes: Shoe[] }) {
  const ids = useCompareIds();
  const currency = currencyPref.use();
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [ready, setReady] = useState(false);
  const synced = useRef(false);

  // 공유 링크(?ids=a,b,c)로 들어오면 그 목록으로 교체
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("ids");
    if (fromUrl) {
      const valid = fromUrl.split(",").filter((id) => allShoes.some((s) => s.id === id));
      if (valid.length) compareActions.set(valid);
    }
    synced.current = true;
    setReady(true);
  }, [allShoes]);

  // 목록 → URL
  useEffect(() => {
    if (!synced.current) return;
    window.history.replaceState(null, "", ids.length ? `?ids=${ids.join(",")}` : window.location.pathname);
  }, [ids]);

  const shoes = useMemo(
    () => ids.map((id) => allShoes.find((s) => s.id === id)).filter((s): s is Shoe => !!s),
    [ids, allShoes],
  );
  const rows = useMemo(
    () => COMPARE_ROWS.map((r) => ({ row: r, diff: isDifferent(r, shoes, currency), best: bestIndexes(r, shoes, currency) })),
    [shoes, currency],
  );
  const diffCount = rows.filter((r) => r.diff).length;
  const visible = onlyDiff ? rows.filter((r) => r.diff) : rows;
  const candidates = allShoes.filter((s) => !ids.includes(s.id));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      announce("비교 링크를 복사했습니다.");
    } catch {
      announce("복사에 실패했습니다. 주소창의 링크를 사용하세요.");
    }
  };

  if (!ready) return <p className="py-10 text-center text-muted">불러오는 중…</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">신발 비교</h1>
          <p className="mt-1 text-sm text-muted">
            {shoes.length}/{MAX_COMPARE}켤레
            {shoes.length >= 2 && <> · 값이 다른 항목 <strong className="text-fg">{diffCount}</strong>개는 <mark className="rounded bg-diff px-1 text-fg">노란색</mark>으로 표시</>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {shoes.length >= 2 && (
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-sm">
              <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} className="accent-[var(--accent)]" />
              다른 항목만 보기
            </label>
          )}
          {shoes.length > 0 && (
            <>
              <button type="button" onClick={copyLink} className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm">링크 복사</button>
              <button type="button" onClick={() => compareActions.clear()} className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-muted">모두 비우기</button>
            </>
          )}
        </div>
      </div>

      {shoes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-muted">비교할 신발을 아직 고르지 않았습니다.</p>
          <p className="mt-1 text-sm text-muted">목록에서 <strong>+ 비교</strong>를 눌러 최대 {MAX_COMPARE}켤레까지 담으세요.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg">신발 고르러 가기</Link>
            <Link href="/finder" className="rounded-md border border-line px-4 py-2 text-sm">추천받기</Link>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-2 text-xs text-muted sm:hidden">← 표를 옆으로 밀어서 보세요 →</p>
          <div className="overflow-x-auto rounded-lg border border-line bg-surface" tabIndex={0} role="region" aria-label="비교 표 (가로 스크롤 가능)">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <caption className="sr-only">선택한 신발 {shoes.length}켤레의 사양 비교. 값이 다른 행은 강조됩니다.</caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 z-20 w-28 min-w-28 border-b border-r border-line bg-surface p-2 text-left align-bottom text-xs font-medium text-muted sm:w-44 sm:min-w-44">
                    항목
                  </th>
                  {shoes.map((s) => (
                    <th key={s.id} scope="col" className="min-w-40 border-b border-line p-2 text-left align-top font-normal sm:min-w-48">
                      <div className="flex items-start justify-between gap-1">
                        <ShoeThumb shoe={s} className="h-10 w-20" />
                        <button
                          type="button"
                          onClick={() => {
                            compareActions.remove(s.id);
                            announce(`${s.brand} ${s.model} 비교에서 제거`);
                          }}
                          className="rounded p-1 text-muted hover:bg-surface-2 hover:text-fg"
                          aria-label={`${s.brand} ${s.model} 비교에서 제거`}
                        >
                          ✕
                        </button>
                      </div>
                      <Link href={`/shoes/${s.slug}`} className="mt-1 block font-semibold leading-tight hover:text-accent">
                        <span className="block text-xs font-medium text-muted">{s.brand}</span>
                        {s.model}
                      </Link>
                    </th>
                  ))}
                  {shoes.length < MAX_COMPARE && (
                    <th scope="col" className="min-w-40 border-b border-line p-2 text-left align-top font-normal">
                      <label className="block text-xs text-muted" htmlFor="add-shoe">신발 추가</label>
                      <select
                        id="add-shoe"
                        value=""
                        onChange={(e) => e.target.value && compareActions.toggle(e.target.value)}
                        className="mt-1 w-full rounded-md border border-dashed border-line bg-bg px-2 py-1.5 text-sm"
                      >
                        <option value="">+ 선택…</option>
                        {candidates.map((c) => (
                          <option key={c.id} value={c.id}>{c.brand} {c.model}</option>
                        ))}
                      </select>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {visible.map(({ row, diff, best }) => (
                  <tr key={row.key} className={diff ? "bg-diff" : ""}>
                    <th
                      scope="row"
                      className={`sticky left-0 z-10 border-b border-r border-line p-2 text-left text-xs font-medium ${diff ? "bg-diff" : "bg-surface"}`}
                    >
                      <span className={`flex items-center gap-1 ${diff ? "text-fg" : "text-muted"}`}>
                        {diff && <span aria-hidden="true" className="h-3 w-1 shrink-0 rounded bg-diff-line" />}
                        {row.label}
                        {row.unit && <span className="text-muted">({row.unit})</span>}
                        {diff && <span className="sr-only">(값이 다름)</span>}
                      </span>
                      {row.hint && <span className="mt-0.5 hidden text-[11px] font-normal text-muted sm:block">{row.hint}</span>}
                    </th>
                    {shoes.map((s, i) => {
                      const v = row.value(s, currency);
                      const isBest = best.includes(i);
                      return (
                        <td key={s.id} className="border-b border-line p-2 align-middle tabular-nums">
                          {row.kind === "score" ? (
                            <ScoreDots value={Number(v)} label={row.label} />
                          ) : (
                            <span className={isBest ? "font-bold text-good" : row.key === "model" ? "font-semibold" : ""}>
                              {row.kind === "money" ? formatMoney(Number(v), currency) : row.display ? row.display(s) : String(v)}
                            </span>
                          )}
                          {isBest && (
                            <span className="ml-1.5 rounded bg-good/15 px-1 text-[10px] font-semibold text-good">
                              {row.better === "min" ? (row.key === "price" ? "최저가" : "최경량") : "최고"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    {shoes.length < MAX_COMPARE && <td className="border-b border-line" />}
                  </tr>
                ))}
                {onlyDiff && diffCount === 0 && (
                  <tr><td colSpan={shoes.length + 2} className="p-6 text-center text-muted">모든 항목의 값이 같습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {shoes.length === 1 && <p className="mt-3 text-sm text-muted">1켤레 이상 더 추가하면 다른 값이 강조됩니다.</p>}
        </>
      )}
    </div>
  );
}
