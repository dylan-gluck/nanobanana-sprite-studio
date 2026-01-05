"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, ImagePlus, Upload } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAppStore, type Asset } from "@/lib/store";
import { AssetThumbnail } from "@/components/ui/asset-thumbnail";
import { cn } from "@/lib/utils";

interface ReferenceAssetsViewProps {
  projectId: string;
}

export function ReferenceAssetsView({ projectId }: ReferenceAssetsViewProps) {
  const { currentProject } = useAppStore();
  const [references, setReferences] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fetchReferences = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/assets?type=reference`);
      if (res.ok) {
        const data = await res.json();
        setReferences(data.assets || []);
      }
    } catch (error) {
      console.error("Failed to fetch references:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch(`/api/projects/${projectId}/references`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, filename: file.name }),
        });

        if (!res.ok) throw new Error("Upload failed");
      }
      toast.success(`Uploaded ${files.length} reference${files.length > 1 ? "s" : ""}`);
      fetchReferences();
    } catch (error) {
      console.error("Failed to upload reference:", error);
      toast.error("Failed to upload reference");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (assetId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/references?assetId=${assetId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Reference deleted");
        setReferences((prev) => prev.filter((r) => r.id !== assetId));
      } else {
        toast.error("Failed to delete reference");
      }
    } catch (error) {
      console.error("Failed to delete reference:", error);
      toast.error("Failed to delete reference");
    }
  };

  const openFilePicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => handleFiles((e.target as HTMLInputElement).files);
    input.click();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const projectName = currentProject?.name || "Project";

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ImagePlus className="h-6 w-6 text-primary" />
            Reference Assets
          </h1>
          <p className="text-muted-foreground">
            Upload images to use as style references for {projectName}
          </p>
        </div>

        {/* Upload Dropzone */}
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={openFilePicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openFilePicker();
            }
          }}
          className={cn(
            "relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border/50 hover:border-primary/40 hover:bg-muted/30",
            isUploading && "opacity-50 pointer-events-none"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                isDragging
                  ? "bg-primary/15 text-primary"
                  : "bg-muted/50 text-muted-foreground"
              )}
            >
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isDragging ? (
                  <span className="text-primary font-medium">Drop images here</span>
                ) : isUploading ? (
                  <span className="font-medium">Uploading...</span>
                ) : (
                  <>
                    <span className="text-foreground font-medium">Click to upload</span>{" "}
                    or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                PNG, JPG, or WEBP images
              </p>
            </div>
          </div>
        </div>

        {/* Reference Assets Grid */}
        {references.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">No reference images yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload images above to use as style references
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">
                {references.length} reference{references.length !== 1 ? "s" : ""}
              </h2>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {references.map((ref) => (
                <AssetThumbnail
                  key={ref.id}
                  asset={ref}
                  onDelete={() => handleDelete(ref.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
