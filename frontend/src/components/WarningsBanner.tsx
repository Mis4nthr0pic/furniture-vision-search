interface WarningsBannerProps {
  warnings: string[];
  rerankError?: string | null;
}

export function WarningsBanner({ warnings, rerankError }: WarningsBannerProps) {
  const items = [...warnings];
  if (rerankError) {
    items.push(`Rerank error: ${rerankError}`);
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">Pipeline notices</p>
      <ul className="mt-1 list-inside list-disc space-y-0.5">
        {items.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}
