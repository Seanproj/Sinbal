import Link from "next/link";
import { Suspense } from "react";
import { ShoeBrowser } from "@/components/ShoeBrowser";
import { repo } from "@/lib/data";

export default async function Home() {
  const shoes = await repo.getAll();
  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">러닝화 · 트레일화 · 워킹화 비교</h1>
        <p className="mt-1 text-sm text-muted">
          최대 4켤레를 골라 사양을 나란히 비교하세요. 고르기 어렵다면{" "}
          <Link href="/finder" className="font-medium text-accent underline-offset-2 hover:underline">질문 5개로 추천받기 →</Link>
        </p>
      </div>
      <Suspense>
        <ShoeBrowser shoes={shoes} />
      </Suspense>
    </>
  );
}
