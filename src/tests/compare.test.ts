import { describe, expect, it } from "vitest";
import raw from "../../data/shoes.json";
import { bestIndexes, COMPARE_ROWS, isDifferent } from "@/lib/compare";
import type { Shoe } from "@/lib/schema";

const shoes = raw as Shoe[];
const by = (id: string) => shoes.find((s) => s.id === id)!;
const row = (k: string) => COMPARE_ROWS.find((r) => r.key === k)!;

describe("compare", () => {
  const pair = [by("hoka-clifton-10"), by("hoka-mach-6")];
  it("같은 값은 다르지 않음, 다른 값은 다름", () => {
    expect(isDifferent(row("brand"), pair, "EUR")).toBe(false);
    expect(isDifferent(row("price"), pair, "EUR")).toBe(false); // 둘 다 150
    expect(isDifferent(row("weight"), pair, "EUR")).toBe(true);
  });
  it("발볼 순서가 달라도 같은 값으로 본다", () => {
    const a = { ...pair[0], widths: ["wide", "standard"] } as Shoe;
    expect(isDifferent(row("widths"), [a, pair[1]], "EUR")).toBe(false);
  });
  it("최고값 표시", () => {
    expect(bestIndexes(row("weight"), pair, "EUR")).toEqual([1]);
    expect(bestIndexes(row("drop"), pair, "EUR")).toEqual([]); // 취향 항목
    expect(bestIndexes(row("price"), pair, "EUR")).toEqual([]); // 동일
  });
  it("1켤레면 강조 없음", () => {
    expect(isDifferent(row("weight"), [pair[0]], "EUR")).toBe(false);
  });
});
