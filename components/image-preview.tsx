"use client";

import { Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImagePreviewProps = {
  image: string;
  filename?: string;
  onSave?: () => void;
  saved?: boolean;
  className?: string;
};

export function ImagePreview({
  image,
  filename,
  onSave,
  saved,
  className,
}: ImagePreviewProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = image.startsWith("data:")
      ? image
      : `data:image/png;base64,${image}`;
    link.download = filename || `image_${Date.now()}.png`;
    link.click();
  };

  const displayImage = image.startsWith("data:")
    ? image
    : `data:image/png;base64,${image}`;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative rounded-lg overflow-hidden border bg-muted/50">
        <img src={displayImage} alt="Generated" className="w-full h-auto" />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        {onSave && (
          <Button
            variant={saved ? "secondary" : "default"}
            size="sm"
            onClick={onSave}
            disabled={saved}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-1" />
            {saved ? "Saved" : "Save to Assets"}
          </Button>
        )}
      </div>
      {filename && (
        <p className="text-xs text-muted-foreground text-center">{filename}</p>
      )}
    </div>
  );
}
