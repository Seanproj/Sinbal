import { priceOf } from "./format";
import type { Currency, Shoe, Width } from "./schema";

export type FinderUsage = "daily" | "tempo" | "race" | "trail" | "walking";
export type Distance = "low" | "mid" | "high";

export interface FinderAnswers {
  usage: FinderUsage;
  distance: Distance; // 주간 거리: <15km / 15–40km / >40km
  width: Width;
  budget: number | null; // 현재 통화 기준, null = 상관없음
  cushion: 2 | 3 | 5; // 단단함 / 균형 / 푹신함
}

export interface Recommendation {
  shoe: Shoe;
  score: number;
  reasons: string[];
  /** 조건을 모두 만족하는 신발이 3개 미만일 때 채워 넣은 결과 */
  relaxed: boolean;
  unmet: string[];
}

const widthOk = (want: Width, has: Width[]) =>
  has.includes(want) || (want === "wide" && has.includes("extra-wide"));

export function recommend(
  shoes: Shoe[],
  a: FinderAnswers,
  currency: Currency,
  limit = 3,
): Recommendation[] {
  const scored = shoes.map((shoe) => {
    const reasons: string[] = [];
    const unmet: string[] = [];
    let score = 0;
    const { cushioning, stability } = shoe.specs;
    const price = priceOf(shoe, currency);

    // 하드 조건
    if (a.budget != null && price > a.budget) unmet.push("예산 초과");
    if (!widthOk(a.width, shoe.widths)) unmet.push("원하는 발볼 옵션 없음");
    if (a.usage === "trail" && shoe.category !== "trail") unmet.push("트레일 전용이 아님");
    if (a.usage !== "trail" && shoe.category === "trail") unmet.push("트레일 전용 신발");

    // 용도
    if (shoe.usages.includes(a.usage)) {
      score += 40;
      reasons.push("선택한 용도에 맞게 설계됨");
    } else if (a.usage === "daily" && shoe.usages.includes("long")) {
      score += 20;
    } else if (a.usage === "walking" && shoe.usages.includes("recovery")) {
      score += 20;
    }

    // 쿠션 선호
    const diff = Math.abs(cushioning - a.cushion);
    score += 20 - diff * 7;
    if (diff === 0) reasons.push(`원하는 쿠션감과 일치 (${cushioning}/5)`);

    // 주행 거리
    if (a.distance === "high") {
      if (shoe.usages.includes("long")) score += 8;
      if (cushioning >= 4) {
        score += 6;
        reasons.push("고거리 주행에 유리한 넉넉한 쿠션");
      }
    } else if (a.distance === "low") {
      if (stability >= 4) {
        score += 5;
        reasons.push("안정적이라 입문자에게 편함");
      }
    }

    // 평점
    score += (shoe.rating - 4) * 20;
    if (shoe.rating >= 4.4) reasons.push(`높은 평점 (${shoe.rating.toFixed(1)})`);

    // 예산 내 가성비
    if (a.budget != null && price <= a.budget * 0.8) {
      score += 4;
      reasons.push("예산보다 여유 있는 가격");
    }

    return { shoe, score: Math.round(score * 10) / 10, reasons: reasons.slice(0, 3), unmet, relaxed: false };
  });

  const byScore = (x: Recommendation, y: Recommendation) =>
    y.score - x.score || x.shoe.id.localeCompare(y.shoe.id);
  const ok = scored.filter((r) => r.unmet.length === 0).sort(byScore);
  if (ok.length >= limit) return ok.slice(0, limit);

  // 부족하면 조건 하나만 어긴 것부터 보충 (트레일/비트레일 불일치는 보충하지 않음)
  const fill = scored
    .filter((r) => r.unmet.length > 0 && !r.unmet.some((u) => u.startsWith("트레일")))
    .sort((x, y) => x.unmet.length - y.unmet.length || byScore(x, y))
    .map((r) => ({ ...r, relaxed: true }));
  return [...ok, ...fill].slice(0, limit);
}
