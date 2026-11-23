"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { compareActions } from "@/lib/compare-store";
import { formatMoney } from "@/lib/format";
import { currencyPref } from "@/lib/prefs";
import { recommend, type FinderAnswers } from "@/lib/recommend";
import type { Currency, Shoe } from "@/lib/schema";
import { announce } from "./Announcer";
import { PRICE_STEPS } from "./ShoeBrowser";
import { ShoeCard } from "./ShoeCard";

type Partial5 = { [K in keyof FinderAnswers]?: FinderAnswers[K] };
type Opt = { value: string; label: string; hint?: string };

function questions(c: Currency): { key: keyof FinderAnswers; title: string; help?: string; options: Opt[] }[] {
  return [
    {
      key: "usage",
      title: "주로 어떤 용도로 신나요?",
      options: [
        { value: "daily", label: "데일리 러닝", hint: "편한 페이스의 조깅·기본 훈련" },
        { value: "tempo", label: "스피드 훈련", hint: "템포런, 인터벌" },
        { value: "race", label: "대회·기록 단축", hint: "10km~풀코스 레이스" },
        { value: "trail", label: "트레일·산길", hint: "흙길, 숲길, 산" },
        { value: "walking", label: "걷기·일상", hint: "출퇴근, 오래 서 있기" },
      ],
    },
    {
      key: "distance",
      title: "일주일에 얼마나 달리거나 걷나요?",
      options: [
        { value: "low", label: "15km 미만", hint: "막 시작했거나 가끔" },
        { value: "mid", label: "15–40km", hint: "주 3~4회 꾸준히" },
        { value: "high", label: "40km 이상", hint: "마라톤 준비 등" },
      ],
    },
    {
      key: "width",
      title: "발볼은 어떤 편인가요?",
      help: "일반 운동화 앞쪽이 자주 끼거나 새끼발가락이 아프면 '넓음'을 고르세요.",
      options: [
        { value: "narrow", label: "좁음" },
        { value: "standard", label: "보통" },
        { value: "wide", label: "넓음" },
        { value: "extra-wide", label: "아주 넓음" },
      ],
    },
    {
      key: "budget",
      title: "예산은 어느 정도인가요?",
      help: "정가 기준입니다.",
      options: [
        ...PRICE_STEPS[c].map((p) => ({ value: String(p), label: `${formatMoney(p, c)} 이하` })),
        { value: "", label: "상관없음" },
      ],
    },
    {
      key: "cushion",
      title: "어떤 쿠션감을 좋아하나요?",
      options: [
        { value: "2", label: "단단하고 반응 빠른", hint: "지면 감각, 빠른 전환" },
        { value: "3", label: "균형 잡힌", hint: "적당히 부드럽고 탄탄" },
        { value: "5", label: "푹신한", hint: "충격 흡수 최우선" },
      ],
    },
  ];
}

function parse(key: keyof FinderAnswers, v: string): FinderAnswers[keyof FinderAnswers] {
  if (key === "budget") return v === "" ? null : Number(v);
  if (key === "cushion") return Number(v) as FinderAnswers["cushion"];
  return v as never;
}

const str = (v: unknown) => (v === null ? "" : v === undefined ? undefined : String(v));

export function Finder({ shoes }: { shoes: Shoe[] }) {
  const currency = currencyPref.use();
  const qs = useMemo(() => questions(currency), [currency]);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Partial5>({});
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // 단계가 바뀌면 질문 제목으로 포커스 이동 (스크린리더/키보드 사용자)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, done]);

  // 통화가 바뀌면 예산 답변은 무효
  const prevCur = useRef(currency);
  useEffect(() => {
    if (prevCur.current !== currency) {
      prevCur.current = currency;
      setAns((a) => ({ ...a, budget: undefined }));
      setDone(false);
      setStep((s) => Math.min(s, 3));
    }
  }, [currency]);

  const complete = qs.every((q) => ans[q.key] !== undefined);
  const results = useMemo(
    () => (done && complete ? recommend(shoes, ans as FinderAnswers, currency) : []),
    [done, complete, shoes, ans, currency],
  );

  const q = qs[step];
  const current = str(ans[q?.key]);

  const choose = (v: string) => {
    setAns((a) => ({ ...a, [q.key]: parse(q.key, v) }));
  };
  const next = () => (step < qs.length - 1 ? setStep(step + 1) : setDone(true));

  if (done && complete) {
    return (
      <div>
        <h1 ref={headingRef} tabIndex={-1} className="text-xl font-bold tracking-tight outline-none sm:text-2xl">
          추천 결과 Top {results.length}
        </h1>
        <p className="mt-1 text-sm text-muted">
          답변: {qs.map((x) => x.options.find((o) => o.value === str(ans[x.key]))?.label).join(" · ")}
        </p>
        {results.some((r) => r.relaxed) && (
          <p className="mt-3 rounded-md border border-diff-line bg-diff px-3 py-2 text-sm">
            모든 조건을 만족하는 신발이 {results.filter((r) => !r.relaxed).length}켤레뿐이라, 조건을 일부 벗어난 신발도 함께 보여드립니다.
          </p>
        )}
        <ol className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {results.map((r, i) => (
            <li key={r.shoe.id} className="flex min-w-0 flex-col gap-2">
              <p className="text-sm font-semibold">
                <span className="mr-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs text-accent-fg">{i + 1}</span>
                {i === 0 ? "가장 잘 맞아요" : i === 1 ? "좋은 대안" : "이것도 고려해 보세요"}
              </p>
              <ShoeCard shoe={r.shoe} />
              <div className="rounded-md bg-surface-2 p-3 text-sm">
                <p className="mb-1 text-xs font-semibold text-muted">추천 이유</p>
                <ul className="space-y-0.5">
                  {r.reasons.map((x) => <li key={x}>✓ {x}</li>)}
                  {r.reasons.length === 0 && <li className="text-muted">전반적인 조건이 무난하게 맞습니다</li>}
                  {r.unmet.map((x) => <li key={x} className="text-accent">⚠ {x}</li>)}
                </ul>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              compareActions.set(results.map((r) => r.shoe.id));
              announce("추천 신발을 비교 목록에 담았습니다.");
            }}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg"
          >
            {results.length}켤레 비교 목록에 담기
          </button>
          <Link href="/compare" className="rounded-md border border-line bg-surface px-4 py-2 text-sm">비교 화면으로</Link>
          <button type="button" onClick={() => { setDone(false); setStep(0); setAns({}); }} className="rounded-md px-4 py-2 text-sm text-muted underline-offset-2 hover:underline">
            처음부터 다시
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm font-medium text-accent">나에게 맞는 신발 찾기</p>
      <div className="mt-2 flex gap-1" role="progressbar" aria-valuemin={1} aria-valuemax={qs.length} aria-valuenow={step + 1} aria-label={`${qs.length}개 중 ${step + 1}번째 질문`}>
        {qs.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-line"}`} />
        ))}
      </div>
      <form
        className="mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (current !== undefined) next();
        }}
      >
        <fieldset>
          <legend className="w-full">
            <span className="text-xs text-muted">질문 {step + 1}/{qs.length}</span>
            <h1 ref={headingRef} tabIndex={-1} className="text-xl font-bold tracking-tight outline-none">{q.title}</h1>
            {q.help && <p className="mt-1 text-sm text-muted">{q.help}</p>}
          </legend>
          <div className="mt-4 grid gap-2">
            {q.options.map((o) => (
              <label key={o.value} className="cursor-pointer">
                <input
                  type="radio"
                  name={q.key}
                  value={o.value}
                  checked={current === o.value}
                  onChange={() => choose(o.value)}
                  className="peer sr-only"
                />
                <span className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 peer-checked:border-accent peer-checked:bg-accent-soft peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
                  <span>
                    <span className="block font-medium">{o.label}</span>
                    {o.hint && <span className="text-sm text-muted">{o.hint}</span>}
                  </span>
                  <span aria-hidden="true" className={`h-4 w-4 shrink-0 rounded-full border-2 ${current === o.value ? "border-accent bg-accent shadow-[inset_0_0_0_2px_var(--surface)]" : "border-line"}`} />
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 flex justify-between gap-2">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="rounded-md border border-line bg-surface px-4 py-2 text-sm disabled:opacity-40"
          >
            ← 이전
          </button>
          <button
            type="submit"
            disabled={current === undefined}
            className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-accent-fg disabled:opacity-40"
          >
            {step === qs.length - 1 ? "추천 보기" : "다음 →"}
          </button>
        </div>
      </form>
    </div>
  );
}
