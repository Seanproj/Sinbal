import type { Category, Usage, Width } from "../schema";

export const categoryLabel: Record<Category, string> = {
  road: "로드 러닝",
  trail: "트레일",
  walking: "워킹",
};

export const usageLabel: Record<Usage, string> = {
  daily: "데일리",
  tempo: "템포/스피드",
  race: "레이스",
  long: "롱런",
  recovery: "회복주",
  trail: "트레일",
  walking: "걷기",
};

export const widthLabel: Record<Width, string> = {
  narrow: "좁음",
  standard: "보통",
  wide: "넓음",
  "extra-wide": "아주 넓음",
};

export const sortLabel = {
  "rating-desc": "평점 높은 순",
  "price-asc": "가격 낮은 순",
  "price-desc": "가격 높은 순",
  "weight-asc": "가벼운 순",
  "newest": "최신 출시 순",
} as const;
