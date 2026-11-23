"use client";
import { useSyncExternalStore } from "react";

export const MAX_COMPARE = 4;
const KEY = "sinbal:compare:v1";
const EMPTY: string[] = [];

let snapshot: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

function getSnapshot() {
  if (snapshot === null) snapshot = read();
  return snapshot;
}

function write(ids: string[]) {
  snapshot = ids;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* 저장 불가(사생활 보호 모드 등) — 메모리에서만 유지 */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      snapshot = read();
      cb();
    }
  };
  window.addEventListener("storage", onStorage); // 다른 탭과 동기화
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const compareActions = {
  toggle(id: string): "added" | "removed" | "full" {
    const ids = getSnapshot();
    if (ids.includes(id)) {
      write(ids.filter((x) => x !== id));
      return "removed";
    }
    if (ids.length >= MAX_COMPARE) return "full";
    write([...ids, id]);
    return "added";
  },
  remove(id: string) {
    write(getSnapshot().filter((x) => x !== id));
  },
  set(ids: string[]) {
    write(ids.slice(0, MAX_COMPARE));
  },
  clear() {
    write([]);
  },
};

export function useCompareIds(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
