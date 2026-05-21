import { memo, useState, type DragEvent } from "react";
import { cn } from "../../utils/format";

interface ImageDropzoneProps {
  file: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export const ImageDropzone = memo(function ImageDropzone({
  file,
  previewUrl,
  onFileSelect,
  disabled,
}: ImageDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputId = "furniture-image-upload";

  function handleFiles(files: FileList | null) {
    const next = files?.[0];
    if (!next?.type.startsWith("image/")) return;
    onFileSelect(next);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    if (disabled) return;
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 border-dashed transition",
        dragOver
          ? "border-brand-500 bg-brand-50"
          : "border-surface-border bg-white hover:border-brand-300",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <label
        htmlFor={inputId}
        className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center px-6 py-8 text-center"
      >
        <input
          id={inputId}
          type="file"
          accept="image/*"
          disabled={disabled}
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />

        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={file?.name ?? "Upload preview"}
              className="max-h-52 rounded-xl object-contain shadow-lift"
              loading="lazy"
              decoding="async"
            />
            {file && (
              <p className="mt-4 text-xs text-stone-500">
                {file.name} · {(file.size / 1024).toFixed(0)} KB
              </p>
            )}
            <p className="mt-2 text-xs font-medium text-brand-700 opacity-0 transition group-hover:opacity-100">
              Click or drop to replace
            </p>
          </>
        ) : (
          <>
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 16V4m0 0L8 8m4-4 4 4M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="font-medium text-stone-800">Drop a furniture photo here</p>
            <p className="mt-1 text-sm text-stone-500">PNG, JPG, WebP · up to 10MB</p>
          </>
        )}
      </label>
    </div>
  );
});
