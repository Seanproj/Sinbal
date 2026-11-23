"use client";
import { useEffect, useState } from "react";

/** 스크린리더 + 화면 하단 토스트로 짧은 알림을 보여줍니다. */
export function announce(message: string) {
  window.dispatchEvent(new CustomEvent("sinbal:announce", { detail: message }));
}

export function Announcer() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      clearTimeout(t);
      t = setTimeout(() => setMsg(""), 2800);
    };
    window.addEventListener("sinbal:announce", on);
    return () => window.removeEventListener("sinbal:announce", on);
  }, []);
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 transition-opacity ${msg ? "opacity-100" : "opacity-0"}`}
    >
      {msg && <div className="rounded-md bg-fg px-3 py-2 text-sm text-bg shadow-lg">{msg}</div>}
    </div>
  );
}
