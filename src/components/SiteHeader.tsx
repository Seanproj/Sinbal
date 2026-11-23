"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCompareIds } from "@/lib/compare-store";
import { applyTheme, currencyPref, themePref, type Theme } from "@/lib/prefs";

const NAV = [
  { href: "/", label: "신발 목록" },
  { href: "/compare", label: "비교" },
  { href: "/finder", label: "나에게 맞는 신발" },
];

export function SiteHeader() {
  const path = usePathname();
  const count = useCompareIds().length;
  const currency = currencyPref.use();
  const theme = themePref.use();

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const on = () => applyTheme("system");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [theme]);

  const nextTheme: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
  const themeName: Record<Theme, string> = { system: "시스템", light: "라이트", dark: "다크" };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-baseline gap-1.5 font-bold tracking-tight">
          <span className="text-lg text-accent">신발비교</span>
          <span className="text-xs font-medium text-muted">Sinbal</span>
        </Link>
        <nav aria-label="주요 메뉴" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {NAV.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium ${
                  active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                {n.label}
                {n.href === "/compare" && count > 0 && (
                  <span className="ml-1 rounded-full bg-accent px-1.5 text-xs text-accent-fg" aria-label={`${count}켤레 선택됨`}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div role="group" aria-label="표시 통화" className="flex rounded-md border border-line p-0.5 text-xs">
            {(["KRW", "EUR"] as const).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={currency === c}
                onClick={() => currencyPref.set(c)}
                className={`rounded px-2 py-1 font-semibold ${currency === c ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
              >
                {c === "KRW" ? "₩ KRW" : "€ EUR"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => themePref.set(nextTheme[theme])}
            className="rounded-md border border-line px-2 py-1 text-xs text-muted hover:text-fg"
            aria-label={`테마: ${themeName[theme]} (눌러서 변경)`}
            title="테마 변경"
          >
            {theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🖥️"} <span className="hidden sm:inline">{themeName[theme]}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
