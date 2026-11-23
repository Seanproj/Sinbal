export function ScoreDots({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" role="img" aria-label={`${label} ${value}점 (5점 만점)`}>
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`h-2 w-3 rounded-sm ${i <= value ? "bg-accent" : "bg-line"}`} />
        ))}
      </span>
      <span className="text-xs tabular-nums text-muted" aria-hidden="true">{value}</span>
    </span>
  );
}
