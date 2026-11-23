import { describe, expect, it } from "vitest";
import raw from "../../data/shoes.json";
import { recommend } from "@/lib/recommend";
import type { Shoe } from "@/lib/schema";

const shoes = raw as Shoe[];

describe("recommend", () => {
  it("레이스 + 고거리 → 레이싱화가 상위", () => {
    const r = recommend(shoes, { usage: "race", distance: "high", width: "standard", budget: null, cushion: 3 }, "EUR");
    expect(r).toHaveLength(3);
    expect(r.every((x) => x.shoe.usages.includes("race"))).toBe(true);
  });
  it("트레일은 트레일화만", () => {
    const r = recommend(shoes, { usage: "trail", distance: "mid", width: "standard", budget: null, cushion: 3 }, "EUR");
    expect(r.every((x) => x.shoe.category === "trail")).toBe(true);
  });
  it("예산과 발볼을 지킨다", () => {
    const r = recommend(shoes, { usage: "daily", distance: "mid", width: "wide", budget: 160000, cushion: 5 }, "KRW");
    for (const x of r.filter((x) => !x.relaxed)) {
      expect(x.shoe.price.krw).toBeLessThanOrEqual(160000);
      expect(x.shoe.widths.some((w) => w === "wide" || w === "extra-wide")).toBe(true);
    }
  });
  it("조건이 너무 빡빡하면 relaxed 로 채운다", () => {
    const r = recommend(shoes, { usage: "race", distance: "low", width: "extra-wide", budget: 100, cushion: 3 }, "EUR");
    expect(r.length).toBe(3);
    expect(r.every((x) => x.relaxed && x.unmet.length > 0)).toBe(true);
  });
});
