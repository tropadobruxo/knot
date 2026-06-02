"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

interface Props {
  onUploaded: (url: string) => void;
  disabled?: boolean;
}

export function PhotoUploader({ onUploaded, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const { startUpload, isUploading } = useUploadThing("profilePhoto", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.serverData?.url) {
        onUploaded(res[0].serverData.url);
      }
    },
  });

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    if (!file) return;
    void startUpload([file]);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
        dragOver ? "border-violet-400 bg-violet-50" : "border-zinc-300"
      } ${disabled || isUploading ? "opacity-50" : "cursor-pointer"}`}
      onClick={() => {
        if (disabled || isUploading) return;
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/jpeg,image/png,image/webp";
        input.onchange = () => handleFiles(input.files);
        input.click();
      }}
    >
      {isUploading ? (
        <p className="text-sm text-violet-600">Enviando...</p>
      ) : (
        <>
          <p className="text-sm text-zinc-600">
            Clique ou arraste uma foto aqui
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            JPG, PNG ou WebP — máx. 4MB
          </p>
        </>
      )}
    </div>
  );
}
