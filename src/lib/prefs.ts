"use client";
import { useSyncExternalStore } from "react";
import type { Currency } from "./schema";

/** 작은 localStorage 기반 설정 저장소 (통화, 테마) */
function createPref<T extends string>(key: string, fallback: T, valid: readonly T[]) {
  let value: T | null = null;
  const listeners = new Set<() => void>();
  const get = (): T => {
    if (value === null) {
      try {
        const v = localStorage.getItem(key) as T | null;
        value = v && valid.includes(v) ? v : fallback;
      } catch {
        value = fallback;
      }
    }
    return value;
  };
  const set = (v: T) => {
    value = v;
    try {
      localStorage.setItem(key, v);
    } catch {}
    listeners.forEach((l) => l());
  };
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  };
  const use = () => useSyncExternalStore(subscribe, get, () => fallback);
  return { get, set, use };
}

export const currencyPref = createPref<Currency>("sinbal:currency", "KRW", ["KRW", "EUR"]);
export type Theme = "system" | "light" | "dark";
export const themePref = createPref<Theme>("sinbal:theme", "system", ["system", "light", "dark"]);

export function applyTheme(t: Theme) {
  const dark = t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}
