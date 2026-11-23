import { describe, expect, it } from "vitest";
import raw from "../../data/shoes.json";
import { applyFilters, emptyFilters, filtersFromQuery, filtersToQuery } from "@/lib/filters";
import type { Shoe } from "@/lib/schema";

const shoes = raw as Shoe[];

describe("filters", () => {
  it("필터 없음 = 전체, 평점 순", () => {
    const r = applyFilters(shoes, emptyFilters, "KRW");
    expect(r).toHaveLength(20);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].rating).toBeGreaterThanOrEqual(r[i].rating);
  });
  it("카테고리 + 발볼 + 최대 가격", () => {
    const r = applyFilters(shoes, { ...emptyFilters, categories: ["trail"], widths: ["wide"], priceMax: 150 }, "EUR");
    expect(r.map((s) => s.id).sort()).toEqual(["brooks-cascadia-18", "salomon-speedcross-6"]);
  });
  it("검색어", () => {
    expect(applyFilters(shoes, { ...emptyFilters, q: "hoka" }, "KRW")).toHaveLength(4);
  });
  it("무게 정렬", () => {
    const r = applyFilters(shoes, { ...emptyFilters, sort: "weight-asc" }, "KRW");
    expect(r[0].id).toBe("nike-vaporfly-3");
  });
  it("URL 왕복", () => {
    const f = { ...emptyFilters, brands: ["Nike", "Hoka"], usages: ["race" as const], priceMax: 200000, sort: "price-asc" as const };
    expect(filtersFromQuery(filtersToQuery(f))).toEqual(f);
    expect(filtersToQuery(emptyFilters)).toBe("");
  });
});
