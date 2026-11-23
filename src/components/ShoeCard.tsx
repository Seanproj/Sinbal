import Link from "next/link";
import type { Shoe } from "@/lib/schema";
import { categoryLabel, usageLabel } from "@/lib/i18n/ko";
import { CompareButton } from "./CompareButton";
import { Price } from "./Price";
import { ScoreDots } from "./ScoreDots";
import { ShoeThumb } from "./ShoeThumb";

export function ShoeCard({ shoe }: { shoe: Shoe }) {
  const name = `${shoe.brand} ${shoe.model}`;
  return (
    <article className="group relative flex h-full min-w-0 flex-col rounded-lg border border-line bg-surface p-3 hover:border-muted">
      <div className="mb-3 flex items-start gap-3">
        <ShoeThumb shoe={shoe} className="h-12 w-20 shrink-0 sm:h-14 sm:w-24" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{shoe.brand}</p>
          <h3 className="line-clamp-2 font-semibold leading-tight">
            <Link href={`/shoes/${shoe.slug}`} className="after:absolute after:inset-0 hover:text-accent">
              {shoe.model}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {categoryLabel[shoe.category]} · {shoe.releaseYear}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <Price shoe={shoe} className="block font-bold tabular-nums" />
          <span className="text-xs text-muted" aria-label={`평점 ${shoe.rating}`}>★ {shoe.rating.toFixed(1)}</span>
        </div>
      </div>

      <dl className="mt-auto grid grid-cols-3 gap-x-2 gap-y-1.5 border-t border-line pt-2.5 text-xs">
        <div><dt className="text-muted">무게</dt><dd className="font-semibold tabular-nums">{shoe.specs.weightG}g</dd></div>
        <div><dt className="text-muted">드롭</dt><dd className="font-semibold tabular-nums">{shoe.specs.dropMm}mm</dd></div>
        <div><dt className="text-muted">스택(힐)</dt><dd className="font-semibold tabular-nums">{shoe.specs.stackHeelMm}mm</dd></div>
        <div className="col-span-3 flex flex-wrap gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5"><dt className="text-muted">쿠션</dt><dd><ScoreDots value={shoe.specs.cushioning} label="쿠션감" /></dd></div>
          <div className="flex items-center gap-1.5"><dt className="text-muted">안정성</dt><dd><ScoreDots value={shoe.specs.stability} label="안정성" /></dd></div>
        </div>
      </dl>

      <div className="mt-2.5 flex items-end justify-between gap-2">
        <ul className="flex flex-wrap gap-1" aria-label="용도">
          {shoe.usages.map((u) => (
            <li key={u} className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">{usageLabel[u]}</li>
          ))}
        </ul>
        {/* 카드 전체 링크 위로 올려서 클릭 가능하게 */}
        <div className="relative z-10 shrink-0">
          <CompareButton id={shoe.id} name={name} />
        </div>
      </div>
      {shoe.isSample && (
        <span className="absolute right-2 top-0 -translate-y-1/2 rounded bg-surface-2 px-1.5 text-[10px] font-medium text-muted ring-1 ring-line">
          샘플
        </span>
      )}
    </article>
  );
}
