import raw from "../../../data/shoes.json";
import { ShoeListSchema, type Shoe } from "../schema";
import type { ShoeRepository } from "./repository";

let cache: Shoe[] | null = null;

function load(): Shoe[] {
  if (!cache) {
    const parsed = ShoeListSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`data/shoes.json 검증 실패:\n${parsed.error.issues
        .map((i) => `  - [${i.path.join(".")}] ${i.message}`)
        .join("\n")}`);
    }
    cache = parsed.data;
  }
  return cache;
}

export const jsonRepository: ShoeRepository = {
  async getAll() {
    return load();
  },
  async getBySlug(slug) {
    return load().find((s) => s.slug === slug);
  },
  async getByIds(ids) {
    const all = load();
    return ids.map((id) => all.find((s) => s.id === id)).filter((s): s is Shoe => !!s);
  },
  async getOffers(id) {
    return load().find((s) => s.id === id)?.offers ?? [];
  },
};
