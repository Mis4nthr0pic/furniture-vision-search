import { type DragEvent, memo, useState } from "react";
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
      className={cn("relative", disabled && "pointer-events-none opacity-60")}
    >
      <label htmlFor={inputId} className="block cursor-pointer">
        <input
          id={inputId}
          type="file"
          accept="image/*"
          disabled={disabled}
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />

        <div
          className={cn(
            "flex min-h-[220px] flex-col items-center justify-center border border-dashed border-hair bg-bg px-4 py-6 text-center transition",
            dragOver && "border-accent bg-panel",
          )}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt={file?.name ?? "Upload preview"}
                className="max-h-44 w-full object-contain"
                loading="lazy"
                decoding="async"
              />
              {file && (
                <p className="mt-3 font-mono text-[10px] uppercase text-ink-muted">
                  {file.name} · {(file.size / 1024).toFixed(0)} KB
                </p>
              )}
              <p className="mt-1 font-mono text-[10px] text-accent">↻ replace</p>
            </>
          ) : (
            <>
              <p className="font-mono text-[11px] uppercase text-ink-muted">Drop image · browse</p>
              <p className="mt-2 text-[13px] text-ink-soft">image/jpeg · png · webp · max 10MB</p>
            </>
          )}
        </div>
      </label>
    </div>
  );
});
