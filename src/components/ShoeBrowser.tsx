"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { applyFilters, emptyFilters, filtersFromQuery, filtersToQuery, type FilterState, type SortKey } from "@/lib/filters";
import { formatMoney } from "@/lib/format";
import { categoryLabel, sortLabel, usageLabel, widthLabel } from "@/lib/i18n/ko";
import { currencyPref } from "@/lib/prefs";
import { CATEGORIES, USAGES, WIDTHS, type Currency, type Shoe } from "@/lib/schema";
import { ShoeCard } from "./ShoeCard";

export const PRICE_STEPS: Record<Currency, number[]> = {
  EUR: [130, 160, 200, 260],
  KRW: [160000, 200000, 250000, 300000],
};

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export function ShoeBrowser({ shoes }: { shoes: Shoe[] }) {
  const currency = currencyPref.use();
  const [f, setF] = useState<FilterState>(emptyFilters);
  const [open, setOpen] = useState(false);
  const hydrated = useRef(false);
  const prevCurrency = useRef(currency);

  // URL → 상태 (최초 1회)
  useEffect(() => {
    setF(filtersFromQuery(window.location.search));
    hydrated.current = true;
  }, []);
  // 상태 → URL (공유 가능한 링크)
  useEffect(() => {
    if (!hydrated.current) return;
    const q = filtersToQuery(f);
    window.history.replaceState(null, "", q ? `?${q}` : window.location.pathname);
  }, [f]);
  // 통화가 바뀌면 가격 상한은 의미가 달라지므로 초기화
  useEffect(() => {
    if (prevCurrency.current !== currency) {
      prevCurrency.current = currency;
      setF((x) => ({ ...x, priceMax: null }));
    }
  }, [currency]);

  const brands = useMemo(() => [...new Set(shoes.map((s) => s.brand))].sort(), [shoes]);
  const results = useMemo(() => applyFilters(shoes, f, currency), [shoes, f, currency]);
  const activeCount =
    f.brands.length + f.categories.length + f.usages.length + f.widths.length + (f.priceMax != null ? 1 : 0);

  const set = (patch: Partial<FilterState>) => setF((x) => ({ ...x, ...patch }));

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-6">
      <div className="mb-3 flex items-center gap-2 lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="filters"
          onClick={() => setOpen((o) => !o)}
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium"
        >
          필터{activeCount > 0 && <span className="ml-1 text-accent">({activeCount})</span>} {open ? "▲" : "▼"}
        </button>
      </div>

      <aside id="filters" aria-label="필터" className={`${open ? "block" : "hidden"} mb-4 space-y-4 rounded-lg border border-line bg-surface p-4 lg:sticky lg:top-20 lg:mb-0 lg:block lg:self-start`}>
        <div>
          <label htmlFor="q" className="mb-1 block text-xs font-semibold text-muted">모델 검색</label>
          <input
            id="q"
            type="search"
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="예: Pegasus, Hoka"
            className="w-full rounded-md border border-line bg-bg px-2.5 py-1.5 text-sm placeholder:text-muted"
          />
        </div>
        <CheckGroup legend="카테고리" options={CATEGORIES.map((c) => [c, categoryLabel[c]])} value={f.categories} onToggle={(v) => set({ categories: toggle(f.categories, v) })} />
        <CheckGroup legend="용도" options={USAGES.map((u) => [u, usageLabel[u]])} value={f.usages} onToggle={(v) => set({ usages: toggle(f.usages, v) })} />
        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold text-muted">가격대 (정가)</legend>
          <div className="flex flex-wrap gap-1.5">
            {[null, ...PRICE_STEPS[currency]].map((p) => (
              <label key={String(p)} className="cursor-pointer">
                <input type="radio" name="price" className="peer sr-only" checked={f.priceMax === p} onChange={() => set({ priceMax: p })} />
                <span className="block rounded-md border border-line px-2 py-1 text-xs peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-ring">
                  {p == null ? "전체" : `${formatMoney(p, currency)} 이하`}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <CheckGroup legend="발볼 너비" options={WIDTHS.map((w) => [w, widthLabel[w]])} value={f.widths} onToggle={(v) => set({ widths: toggle(f.widths, v) })} />
        <CheckGroup legend="브랜드" options={brands.map((b) => [b, b])} value={f.brands} onToggle={(v) => set({ brands: toggle(f.brands, v) })} />
        {activeCount > 0 && (
          <button type="button" onClick={() => setF({ ...emptyFilters, sort: f.sort })} className="text-sm text-accent underline-offset-2 hover:underline">
            필터 초기화
          </button>
        )}
      </aside>

      <section aria-labelledby="results-heading" className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="results-heading" className="text-sm text-muted" aria-live="polite">
            <strong className="text-fg">{results.length}</strong>켤레
          </h2>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">정렬</span>
            <select
              value={f.sort}
              onChange={(e) => set({ sort: e.target.value as SortKey })}
              className="rounded-md border border-line bg-surface px-2 py-1.5"
            >
              {Object.entries(sortLabel).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        {results.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-10 text-center text-muted">
            조건에 맞는 신발이 없습니다.{" "}
            <button type="button" className="text-accent underline" onClick={() => setF(emptyFilters)}>필터 초기화</button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((s) => (
              <li key={s.id} className="min-w-0"><ShoeCard shoe={s} /></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CheckGroup<T extends string>({
  legend,
  options,
  value,
  onToggle,
}: {
  legend: string;
  options: [T, string][];
  value: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold text-muted">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map(([v, label]) => (
          <label key={v} className="cursor-pointer">
            <input type="checkbox" className="peer sr-only" checked={value.includes(v)} onChange={() => onToggle(v)} />
            <span className="block rounded-md border border-line px-2 py-1 text-xs peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-ring">
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
