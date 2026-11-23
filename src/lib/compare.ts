import { priceOf } from "./format";
import { categoryLabel, usageLabel, widthLabel } from "./i18n/ko";
import { WIDTHS, type Currency, type Shoe } from "./schema";

export type RowKind = "text" | "money" | "number" | "score";

export interface CompareRow {
  key: string;
  label: string;
  unit?: string;
  kind: RowKind;
  /** 비교/강조에 쓰는 원시 값 */
  value: (s: Shoe, c: Currency) => string | number;
  /** 화면 표시용 텍스트 (score/money 는 컴포넌트에서 따로 렌더링) */
  display?: (s: Shoe) => string;
  /** 값이 작을수록/클수록 좋은 항목만 '최고' 표시 (드롭·쿠션 등 취향 항목은 없음) */
  better?: "min" | "max";
  hint?: string;
}

export const COMPARE_ROWS: CompareRow[] = [
  { key: "brand", label: "브랜드", kind: "text", value: (s) => s.brand },
  { key: "model", label: "모델명", kind: "text", value: (s) => s.model },
  { key: "category", label: "카테고리", kind: "text", value: (s) => categoryLabel[s.category] },
  { key: "price", label: "가격 (정가)", kind: "money", value: (s, c) => priceOf(s, c), better: "min" },
  { key: "weight", label: "무게", unit: "g", kind: "number", value: (s) => s.specs.weightG, better: "min", hint: "남성 US 9 기준" },
  { key: "drop", label: "힐-토 드롭", unit: "mm", kind: "number", value: (s) => s.specs.dropMm, hint: "높을수록 뒤꿈치 착지에 유리, 낮을수록 자연스러운 착지" },
  { key: "stackHeel", label: "스택 높이 (힐)", unit: "mm", kind: "number", value: (s) => s.specs.stackHeelMm },
  { key: "stackFore", label: "스택 높이 (앞꿈치)", unit: "mm", kind: "number", value: (s) => s.specs.stackForefootMm },
  { key: "cushioning", label: "쿠션감", kind: "score", value: (s) => s.specs.cushioning, hint: "1 단단함 – 5 매우 푹신함" },
  { key: "stability", label: "안정성", kind: "score", value: (s) => s.specs.stability, hint: "1 중립 – 5 강한 지지" },
  {
    key: "widths",
    label: "발볼 너비 옵션",
    kind: "text",
    value: (s) => [...s.widths].sort((a, b) => WIDTHS.indexOf(a) - WIDTHS.indexOf(b)).join(","),
    display: (s) => [...s.widths].sort((a, b) => WIDTHS.indexOf(a) - WIDTHS.indexOf(b)).map((w) => widthLabel[w]).join(", "),
  },
  {
    key: "usages",
    label: "용도",
    kind: "text",
    value: (s) => [...s.usages].sort().join(","),
    display: (s) => s.usages.map((u) => usageLabel[u]).join(", "),
  },
  { key: "year", label: "출시연도", kind: "number", value: (s) => s.releaseYear },
  { key: "rating", label: "평점", kind: "number", value: (s) => s.rating, better: "max" },
];

export function isDifferent(row: CompareRow, shoes: Shoe[], c: Currency): boolean {
  if (shoes.length < 2) return false;
  return new Set(shoes.map((s) => row.value(s, c))).size > 1;
}

/** 가장 좋은 값을 가진 열 인덱스들 (모두 같으면 빈 배열) */
export function bestIndexes(row: CompareRow, shoes: Shoe[], c: Currency): number[] {
  if (!row.better || !isDifferent(row, shoes, c)) return [];
  const vals = shoes.map((s) => Number(row.value(s, c)));
  const target = row.better === "min" ? Math.min(...vals) : Math.max(...vals);
  return vals.flatMap((v, i) => (v === target ? [i] : []));
}
