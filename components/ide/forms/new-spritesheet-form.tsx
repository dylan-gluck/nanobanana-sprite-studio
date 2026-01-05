"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { characterPresets } from "@/lib/config/character-presets";
import { cn } from "@/lib/utils";

const FRAME_PRESETS = [
  { value: 4, label: "4 frames" },
  { value: 6, label: "6 frames" },
  { value: 10, label: "10 frames" },
  { value: 16, label: "16 frames" },
  { value: 24, label: "24 frames" },
];

interface NewSpriteSheetFormProps {
  projectId: string;
  characterId?: string;
}

export function NewSpriteSheetForm({
  projectId,
  characterId: initialCharacterId,
}: NewSpriteSheetFormProps) {
  const { currentProject, clearActionContext, refreshCurrentProject, openTab } =
    useAppStore();

  // Form state
  const [name, setName] = useState("");
  const [characterId, setCharacterId] = useState(initialCharacterId || "");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [anglePreset, setAnglePreset] = useState("front");
  const [description, setDescription] = useState("");
  const [frameCount, setFrameCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  const characters = currentProject?.characters || [];
  const selectedCharacter = characters.find((c) => c.id === characterId);
  const characterAssets = selectedCharacter?.assets || [];
  const primaryAsset = selectedCharacter?.primaryAsset;
  const hasCharacterAsset = characterAssets.length > 0 || !!primaryAsset;

  const handleCharacterChange = (value: string) => {
    setCharacterId(value);
    const char = characters.find((c) => c.id === value);
    const defaultAsset = char?.primaryAsset?.id || char?.assets?.[0]?.id || "";
    setSelectedAssetId(defaultAsset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a sprite sheet name");
      return;
    }
    if (!characterId) {
      toast.error("Please select a character");
      return;
    }

    const assetId = selectedAssetId || primaryAsset?.id;
    if (!assetId) {
      toast.error("Selected character has no assets");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter an animation description");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/gen-spritesheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          characterAssetId: assetId,
          name: name.trim(),
          description: description.trim(),
          frameCount,
          anglePreset,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate sprite sheet");
      }

      const { spriteSheet } = await res.json();
      toast.success(`Sprite sheet "${name}" generated`);

      await refreshCurrentProject();
      openTab("spritesheet", spriteSheet.id, name);
      clearActionContext();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate sprite sheet",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Character selector */}
        <div className="space-y-2">
          <Label htmlFor="character">Character</Label>
          <Select
            value={characterId}
            onValueChange={handleCharacterChange}
            disabled={isLoading}
          >
            <SelectTrigger id="character" className="w-full">
              <SelectValue placeholder="Select a character" />
            </SelectTrigger>
            <SelectContent>
              {characters.length === 0 ? (
                <SelectItem value="" disabled>
                  No characters available
                </SelectItem>
              ) : (
                characters.map((char) => (
                  <SelectItem key={char.id} value={char.id}>
                    {char.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Character asset selector */}
        {characterId && hasCharacterAsset && (
          <div className="space-y-2">
            <Label>Reference Image</Label>
            <div className="grid grid-cols-4 gap-2">
              {characterAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setSelectedAssetId(asset.id)}
                  disabled={isLoading}
                  className={cn(
                    "aspect-square rounded-md border-2 overflow-hidden transition-all",
                    selectedAssetId === asset.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50",
                    isLoading && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <img
                    src={asset.filePath}
                    alt="Character variation"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sprite sheet name */}
        <div className="space-y-2">
          <Label htmlFor="name">Sprite Sheet Name</Label>
          <Input
            id="name"
            placeholder="e.g., Hero Actions, Enemy Moves"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Angle preset */}
        <div className="space-y-2">
          <Label htmlFor="angle">Angle</Label>
          <Select
            value={anglePreset}
            onValueChange={setAnglePreset}
            disabled={isLoading}
          >
            <SelectTrigger id="angle" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {characterPresets.angles.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Animation Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Animation Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the animation sequence, e.g., 'Character walking cycle' or 'Jump and land motion'"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Frame Count */}
        <div className="space-y-2">
          <Label htmlFor="frameCount">Frame Count</Label>
          <Select
            value={frameCount.toString()}
            onValueChange={(v) => setFrameCount(parseInt(v, 10))}
            disabled={isLoading}
          >
            <SelectTrigger id="frameCount" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FRAME_PRESETS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 border-t border-border bg-sidebar p-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={clearActionContext}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading || characters.length === 0 || !hasCharacterAsset}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Sprite Sheet"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
