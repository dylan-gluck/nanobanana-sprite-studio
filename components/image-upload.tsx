"use client";

import { Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  value: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
};

export function ImageUpload({
  value,
  onChange,
  maxImages = 14,
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const remaining = maxImages - value.length;
      const filesToProcess = Array.from(files).slice(0, remaining);

      filesToProcess.forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          onChange([...value, base64]);
        };
        reader.readAsDataURL(file);
      });
    },
    [value, onChange, maxImages],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          value.length >= maxImages && "opacity-50 cursor-not-allowed",
        )}
        onClick={() => {
          if (value.length >= maxImages) return;
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.multiple = true;
          input.onchange = (e) =>
            handleFiles((e.target as HTMLInputElement).files);
          input.click();
        }}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Drop images here or click to upload
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {value.length}/{maxImages} images
        </p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`Upload ${i + 1}`}
                className="w-full aspect-square object-cover rounded-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(i);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
