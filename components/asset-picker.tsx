"use client";

import { Check, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Asset = {
  filename: string;
  url: string;
  createdAt: string;
};

type AssetPickerProps = {
  folder: "characters" | "sprites" | "reference";
  value?: string;
  onChange: (url: string, base64?: string) => void;
  className?: string;
};

export function AssetPicker({
  folder,
  value,
  onChange,
  className,
}: AssetPickerProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assets?folder=${folder}`);
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  const handleSelect = async (asset: Asset) => {
    try {
      const res = await fetch(asset.url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        onChange(asset.url, reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch {
      onChange(asset.url);
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-32 text-muted-foreground",
          className,
        )}
      >
        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
        Loading assets...
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-32 text-muted-foreground",
          className,
        )}
      >
        <p className="text-sm">No {folder} found</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAssets}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium capitalize">{folder}</span>
        <Button variant="ghost" size="sm" onClick={fetchAssets}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-48">
        <div className="grid grid-cols-4 gap-2 pr-3">
          {assets.map((asset) => (
            <button
              type="button"
              key={asset.filename}
              onClick={() => handleSelect(asset)}
              className={cn(
                "relative aspect-square rounded-md overflow-hidden border-2 transition-all",
                value === asset.url
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-muted-foreground/50",
              )}
            >
              <img
                src={asset.url}
                alt={asset.filename}
                className="w-full h-full object-cover"
              />
              {value === asset.url && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
