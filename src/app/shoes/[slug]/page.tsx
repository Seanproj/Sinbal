import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompareButton } from "@/components/CompareButton";
import { OfferList } from "@/components/OfferList";
import { Price } from "@/components/Price";
import { ScoreDots } from "@/components/ScoreDots";
import { ShoeCard } from "@/components/ShoeCard";
import { ShoeThumb } from "@/components/ShoeThumb";
import { repo } from "@/lib/data";
import { categoryLabel, usageLabel, widthLabel } from "@/lib/i18n/ko";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await repo.getAll()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shoe = await repo.getBySlug((await params).slug);
  return shoe ? { title: `${shoe.brand} ${shoe.model}`, description: shoe.summary } : {};
}

export default async function ShoePage({ params }: Props) {
  const shoe = await repo.getBySlug((await params).slug);
  if (!shoe) notFound();
  const [offers, all] = await Promise.all([repo.getOffers(shoe.id), repo.getAll()]);
  const name = `${shoe.brand} ${shoe.model}`;
  const similar = all
    .filter((s) => s.id !== shoe.id && s.category === shoe.category && s.usages.some((u) => shoe.usages.includes(u)))
    .sort((a, b) => Math.abs(a.specs.cushioning - shoe.specs.cushioning) - Math.abs(b.specs.cushioning - shoe.specs.cushioning) || b.rating - a.rating)
    .slice(0, 3);

  const specs: [string, React.ReactNode][] = [
    ["무게", `${shoe.specs.weightG} g`],
    ["힐-토 드롭", `${shoe.specs.dropMm} mm`],
    ["스택 높이 (힐 / 앞꿈치)", `${shoe.specs.stackHeelMm} / ${shoe.specs.stackForefootMm} mm`],
    ["쿠션감", <ScoreDots key="c" value={shoe.specs.cushioning} label="쿠션감" />],
    ["안정성", <ScoreDots key="s" value={shoe.specs.stability} label="안정성" />],
    ["발볼 너비", shoe.widths.map((w) => widthLabel[w]).join(", ")],
    ["용도", shoe.usages.map((u) => usageLabel[u]).join(", ")],
    ["카테고리", categoryLabel[shoe.category]],
    ["출시연도", shoe.releaseYear],
  ];

  return (
    <article>
      <nav aria-label="경로" className="mb-3 text-xs text-muted">
        <Link href="/" className="hover:text-fg">신발 목록</Link> <span aria-hidden="true">/</span>{" "}
        <Link href={`/?cat=${shoe.category}`} className="hover:text-fg">{categoryLabel[shoe.category]}</Link>{" "}
        <span aria-hidden="true">/</span> <span aria-current="page">{shoe.model}</span>
      </nav>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <header className="rounded-lg border border-line bg-surface p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <ShoeThumb shoe={shoe} className="h-24 w-48 shrink-0 self-center" />
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {shoe.brand}
                  {shoe.isSample && <span className="ml-2 rounded bg-surface-2 px-1.5 py-0.5 normal-case tracking-normal ring-1 ring-line">샘플 데이터</span>}
                </p>
                <h1 className="text-2xl font-bold tracking-tight">{shoe.model}</h1>
                <p className="mt-1 text-sm text-muted">{shoe.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Price shoe={shoe} className="text-xl font-bold tabular-nums" />
                  <span className="text-sm text-muted">정가 · ★ {shoe.rating.toFixed(1)}</span>
                  <CompareButton id={shoe.id} name={name} size="md" />
                </div>
              </div>
            </div>
          </header>

          <section aria-labelledby="specs" className="rounded-lg border border-line bg-surface p-4 sm:p-5">
            <h2 id="specs" className="mb-2 font-semibold">사양</h2>
            <dl className="grid grid-cols-1 text-sm sm:grid-cols-2 sm:gap-x-8">
              {specs.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 border-b border-line py-2">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-medium tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-xs text-muted">무게는 남성 US 9 기준 · 업데이트 {shoe.updatedAt}</p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section aria-labelledby="pros" className="rounded-lg border border-line bg-surface p-4">
              <h2 id="pros" className="mb-2 font-semibold text-good">장점</h2>
              <ul className="space-y-1.5 text-sm">
                {shoe.pros.map((p) => (
                  <li key={p} className="flex gap-2"><span aria-hidden="true" className="text-good">＋</span>{p}</li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="cons" className="rounded-lg border border-line bg-surface p-4">
              <h2 id="cons" className="mb-2 font-semibold text-accent">단점</h2>
              <ul className="space-y-1.5 text-sm">
                {shoe.cons.map((p) => (
                  <li key={p} className="flex gap-2"><span aria-hidden="true" className="text-accent">−</span>{p}</li>
                ))}
              </ul>
            </section>
          </div>

          <section aria-labelledby="for" className="rounded-lg border border-line bg-surface p-4">
            <h2 id="for" className="mb-2 font-semibold">이런 분께 추천</h2>
            <ul className="flex flex-wrap gap-2 text-sm">
              {shoe.recommendedFor.map((r) => (
                <li key={r} className="rounded-md bg-accent-soft px-2.5 py-1">{r}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <OfferList offers={offers} />
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar" className="mt-8">
          <h2 id="similar" className="mb-3 font-semibold">비슷한 신발</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {similar.map((s) => (
              <li key={s.id} className="min-w-0"><ShoeCard shoe={s} /></li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
