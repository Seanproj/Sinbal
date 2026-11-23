import type { Metadata } from "next";
import { Finder } from "@/components/Finder";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: "나에게 맞는 신발 찾기" };

export default async function FinderPage() {
  return <Finder shoes={await repo.getAll()} />;
}
