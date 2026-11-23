import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-muted">신발이 목록에서 빠졌거나 주소가 잘못되었을 수 있어요.</p>
      <Link href="/" className="mt-6 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg">신발 목록으로</Link>
    </div>
  );
}
