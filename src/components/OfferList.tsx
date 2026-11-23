"use client";
import { formatMoney } from "@/lib/format";
import { currencyPref } from "@/lib/prefs";
import type { Offer } from "@/lib/schema";

const regionLabel: Record<Offer["region"], string> = { DE: "독일", KR: "한국", EU: "EU", US: "미국" };

export function OfferList({ offers }: { offers: Offer[] }) {
  const currency = currencyPref.use();
  // 선택한 통화의 판매처를 먼저, 그 안에서는 재고 있음 → 낮은 가격 순
  const sorted = [...offers].sort(
    (a, b) =>
      Number(b.currency === currency) - Number(a.currency === currency) ||
      Number(b.inStock) - Number(a.inStock) ||
      a.price - b.price,
  );
  const cheapest = sorted.find((o) => o.currency === currency && o.inStock);

  return (
    <section aria-labelledby="offers" className="rounded-lg border border-line bg-surface p-4">
      <h2 id="offers" className="font-semibold">판매처별 가격</h2>
      <p className="mb-3 text-xs text-muted">샘플 가격 · 링크는 판매처 검색 결과로 연결됩니다</p>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted">등록된 판매처가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-line">
          {sorted.map((o) => (
            <li key={o.retailer + o.region}>
              <a
                href={o.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 hover:bg-surface-2"
              >
                <span>
                  <span className="block text-sm font-medium">{o.retailer}</span>
                  <span className="text-xs text-muted">
                    {regionLabel[o.region]} · {o.inStock ? "재고 있음" : <span className="text-accent">품절</span>} · {o.checkedAt} 확인
                  </span>
                </span>
                <span className="text-right">
                  <span className={`block font-bold tabular-nums ${o === cheapest ? "text-good" : ""} ${o.inStock ? "" : "text-muted line-through"}`}>
                    {formatMoney(o.price, o.currency)}
                  </span>
                  {o === cheapest && <span className="text-[10px] font-semibold text-good">최저가</span>}
                  <span className="sr-only">(새 창에서 열림)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
