import { priceOf } from "./format";
import type { Category, Currency, Shoe, Usage, Width } from "./schema";
import type { sortLabel } from "./i18n/ko";

export type SortKey = keyof typeof sortLabel;

export interface FilterState {
  q: string;
  brands: string[];
  categories: Category[];
  usages: Usage[];
  widths: Width[];
  priceMax: number | null; // 현재 통화 기준
  sort: SortKey;
}

export const emptyFilters: FilterState = {
  q: "",
  brands: [],
  categories: [],
  usages: [],
  widths: [],
  priceMax: null,
  sort: "rating-desc",
};

const anyOf = <T,>(selected: T[], values: T[]) =>
  selected.length === 0 || selected.some((v) => values.includes(v));

export function applyFilters(shoes: Shoe[], f: FilterState, currency: Currency): Shoe[] {
  const q = f.q.trim().toLowerCase();
  const out = shoes.filter(
    (s) =>
      (!q || `${s.brand} ${s.model}`.toLowerCase().includes(q)) &&
      anyOf(f.brands, [s.brand]) &&
      anyOf(f.categories, [s.category]) &&
      anyOf(f.usages, s.usages) &&
      anyOf(f.widths, s.widths) &&
      (f.priceMax == null || priceOf(s, currency) <= f.priceMax),
  );
  return sortShoes(out, f.sort, currency);
}

export function sortShoes(shoes: Shoe[], sort: SortKey, currency: Currency): Shoe[] {
  const cmp: Record<SortKey, (a: Shoe, b: Shoe) => number> = {
    "rating-desc": (a, b) => b.rating - a.rating,
    "price-asc": (a, b) => priceOf(a, currency) - priceOf(b, currency),
    "price-desc": (a, b) => priceOf(b, currency) - priceOf(a, currency),
    "weight-asc": (a, b) => a.specs.weightG - b.specs.weightG,
    newest: (a, b) => b.releaseYear - a.releaseYear,
  };
  // 동점일 때 이름 순으로 안정 정렬
  return [...shoes].sort((a, b) => cmp[sort](a, b) || a.id.localeCompare(b.id));
}

/** FilterState <-> URL 쿼리 (공유 가능한 필터 링크) */
export function filtersToQuery(f: FilterState): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.brands.length) p.set("brand", f.brands.join(","));
  if (f.categories.length) p.set("cat", f.categories.join(","));
  if (f.usages.length) p.set("use", f.usages.join(","));
  if (f.widths.length) p.set("width", f.widths.join(","));
  if (f.priceMax != null) p.set("max", String(f.priceMax));
  if (f.sort !== emptyFilters.sort) p.set("sort", f.sort);
  return p.toString();
}

export function filtersFromQuery(search: string): FilterState {
  const p = new URLSearchParams(search);
  const list = <T extends string>(k: string) => (p.get(k)?.split(",").filter(Boolean) ?? []) as T[];
  const max = Number(p.get("max"));
  return {
    q: p.get("q") ?? "",
    brands: list("brand"),
    categories: list<Category>("cat"),
    usages: list<Usage>("use"),
    widths: list<Width>("width"),
    priceMax: p.has("max") && Number.isFinite(max) && max > 0 ? max : null,
    sort: (p.get("sort") as SortKey) ?? emptyFilters.sort,
  };
}
