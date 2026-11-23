import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { CompareTray } from "@/components/CompareTray";
import { Announcer } from "@/components/Announcer";

export const metadata: Metadata = {
  title: { default: "신발비교 Sinbal", template: "%s · 신발비교 Sinbal" },
  description: "러닝화·트레일화·워킹화를 사양, 가격, 용도별로 나란히 비교하세요.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1116" },
  ],
};

// 첫 페인트 전에 테마를 적용해 깜빡임 방지
const themeScript = `(function(){try{var t=localStorage.getItem("sinbal:theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;if(d)e.classList.add("dark");e.style.colorScheme=d?"dark":"light"}catch(_){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
        >
          본문으로 건너뛰기
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto max-w-7xl px-4 pb-28 pt-4 sm:px-6">
          {children}
        </main>
        <footer className="mx-auto max-w-7xl px-4 pb-24 text-xs text-muted sm:px-6">
          표시된 사양·가격은 <strong>샘플 데이터</strong>이며 실제와 다를 수 있습니다. 무게는 남성 US 9 기준.
        </footer>
        <CompareTray />
        <Announcer />
      </body>
    </html>
  );
}
