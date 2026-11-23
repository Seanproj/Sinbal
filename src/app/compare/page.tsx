import type { Metadata } from "next";
import { CompareView } from "@/components/CompareView";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: "비교" };

export default async function ComparePage() {
  const shoes = await repo.getAll();
  return <CompareView allShoes={shoes} />;
}
