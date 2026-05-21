import { useRef, useState, type DragEvent } from "react";

interface ImageDropzoneProps {
  file: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File | null) => void;
}

export function ImageDropzone({ file, previewUrl, onFileSelect }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | null) {
    const next = files?.[0];
    if (!next) return;
    if (!next.type.startsWith("image/")) return;
    onFileSelect(next);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition ${
        dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-300 bg-white hover:border-slate-400"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {previewUrl ? (
        <img
          src={previewUrl}
          alt={file?.name ?? "Upload preview"}
          className="max-h-48 rounded-lg object-contain"
        />
      ) : (
        <>
          <p className="text-sm font-medium text-slate-700">Drop a furniture image here</p>
          <p className="mt-1 text-xs text-slate-500">or click to browse (max 10MB)</p>
        </>
      )}

      {file && (
        <p className="mt-3 text-xs text-slate-500">
          {file.name} · {(file.size / 1024).toFixed(0)} KB
        </p>
      )}
    </div>
  );
}
