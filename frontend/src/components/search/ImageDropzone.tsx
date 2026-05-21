import { type DragEvent, memo, useState } from "react";
import { cn } from "../../utils/format";
import { ArchedFrame } from "../editorial/ArchedFrame";

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
      className={cn("group relative transition", disabled && "pointer-events-none opacity-60")}
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

        <ArchedFrame
          className={cn(
            "min-h-[260px] transition",
            dragOver ? "border-terracotta/60 bg-burgundy" : "hover:border-cream/20",
          )}
          innerClassName="min-h-[260px] flex-col px-6 py-8 text-center"
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt={file?.name ?? "Upload preview"}
                className="max-h-48 w-full object-contain"
                loading="lazy"
                decoding="async"
              />
              {file && (
                <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-cream/45">
                  {file.name} · {(file.size / 1024).toFixed(0)} KB
                </p>
              )}
              <p className="mt-2 font-hand text-lg text-ochre opacity-0 transition group-hover:opacity-100">
                replace →
              </p>
            </>
          ) : (
            <>
              <span
                className="font-hand text-2xl text-ochre"
                style={{ transform: "rotate(-3deg)" }}
              >
                drop here
              </span>
              <p className="mt-3 font-display text-xl italic text-cream/90">
                A furniture photograph
              </p>
              <p className="mt-2 font-serif text-sm italic text-cream/50">
                PNG, JPG, WebP · up to 10MB
              </p>
            </>
          )}
        </ArchedFrame>
      </label>
    </div>
  );
});
