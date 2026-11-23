import type { Shoe } from "@/lib/schema";

function hue(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

/**
 * 실제 사진 대신 쓰는 데이터 기반 실루엣.
 * 미드솔 두께가 힐/앞꿈치 스택 높이에 비례하므로 드롭이 눈으로 보입니다.
 */
export function ShoeThumb({ shoe, className = "" }: { shoe: Shoe; className?: string }) {
  if (shoe.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={shoe.image} alt="" className={className} />;
  }
  const k = 0.42;
  const base = 56;
  const hT = base - shoe.specs.stackHeelMm * k;
  const tT = base - shoe.specs.stackForefootMm * k;
  const h = hue(shoe.brand);
  const upper = `M14 ${hT} L13 ${hT - 15} C13 ${hT - 20} 17 ${hT - 22} 23 ${hT - 22} L40 ${hT - 33} C44 ${hT - 36} 50 ${hT - 35} 52 ${hT - 31} L58 ${hT - 22} C78 ${hT - 20} 100 ${tT - 13} 110 ${tT - 6} C115 ${tT - 3} 115 ${tT} 112 ${tT} Z`;
  const sole = `M10 ${hT + 1} L113 ${tT} C117 ${tT + 1} 118 ${base - 4} 115 ${base - 1} L113 ${base} L16 ${base} C10 ${base} 8 ${base - 4} 8 ${hT + 6} Z`;
  return (
    <svg viewBox="0 0 124 62" className={className} aria-hidden="true">
      <path d={sole} fill="var(--surface)" stroke="var(--muted)" strokeWidth="1" />
      <path d={upper} fill={`hsl(${h} 65% 50%)`} opacity="0.9" />
      {shoe.category === "trail" && (
        <path d={`M16 ${base} ${"l3 3 l3 -3 ".repeat(16)}`} fill="none" stroke="var(--muted)" strokeWidth="1" />
      )}
    </svg>
  );
}
