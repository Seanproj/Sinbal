"use client";
import { formatPrice } from "@/lib/format";
import { currencyPref } from "@/lib/prefs";
import type { Shoe } from "@/lib/schema";

export function Price({ shoe, className }: { shoe: Shoe; className?: string }) {
  const c = currencyPref.use();
  return <span className={className}>{formatPrice(shoe, c)}</span>;
}
