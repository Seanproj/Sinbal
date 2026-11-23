import { describe, expect, it } from "vitest";
import raw from "../../data/shoes.json";
import { ShoeListSchema } from "@/lib/schema";
import { repo } from "@/lib/data";

describe("data/shoes.json", () => {
  it("스키마 검증을 통과한다", () => {
    const r = ShoeListSchema.safeParse(raw);
    if (!r.success) console.error(r.error.issues);
    expect(r.success).toBe(true);
  });
  it("샘플 20켤레, 카테고리 12/4/4", async () => {
    const all = await repo.getAll();
    expect(all).toHaveLength(20);
    const count = (c: string) => all.filter((s) => s.category === c).length;
    expect([count("road"), count("trail"), count("walking")]).toEqual([12, 4, 4]);
  });
  it("저장소 조회", async () => {
    expect((await repo.getBySlug("nike-pegasus-41"))?.model).toBe("Pegasus 41");
    const pair = await repo.getByIds(["hoka-mach-6", "nope", "nike-vaporfly-3"]);
    expect(pair.map((s) => s.id)).toEqual(["hoka-mach-6", "nike-vaporfly-3"]);
  });
  it("드롭이 맞지 않으면 거부한다", () => {
    const bad = structuredClone(raw) as typeof raw;
    bad[0].specs.dropMm = 99;
    expect(ShoeListSchema.safeParse(bad).success).toBe(false);
  });
});
