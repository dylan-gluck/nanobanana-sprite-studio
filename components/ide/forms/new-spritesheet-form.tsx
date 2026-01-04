"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, Play, Layers } from "lucide-react";
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

type Sequence = {
  name: string;
  description: string;
  frames: number;
};

const defaultSequence: Sequence = { name: "", description: "", frames: 4 };

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
  const [sequences, setSequences] = useState<Sequence[]>([
    { ...defaultSequence },
  ]);
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

  const addSequence = () => {
    setSequences([...sequences, { ...defaultSequence }]);
  };

  const removeSequence = (index: number) => {
    if (sequences.length === 1) return;
    setSequences(sequences.filter((_, i) => i !== index));
  };

  const updateSequence = (
    index: number,
    field: keyof Sequence,
    value: string | number,
  ) => {
    const updated = [...sequences];
    updated[index] = { ...updated[index], [field]: value };
    setSequences(updated);
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

    const validSequences = sequences.filter(
      (s) => s.name.trim() && s.description.trim(),
    );
    if (validSequences.length === 0) {
      toast.error(
        "Please add at least one sequence with name and description",
      );
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
          sequences: validSequences,
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

  const totalFrames = sequences.reduce((sum, s) => sum + (s.frames || 0), 0);
  const validSequenceCount = sequences.filter(
    (s) => s.name.trim() && s.description.trim(),
  ).length;

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
            <SelectTrigger id="character">
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
            <SelectTrigger id="angle">
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

        {/* Animation Sequences */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Animation Sequences</Label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addSequence}
              disabled={isLoading}
              className="h-7 px-2.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-3">
            {sequences.map((seq, i) => (
              <div
                key={i}
                className="relative bg-muted/30 rounded-lg p-3 border border-border/30"
              >
                <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-secondary border border-border text-[10px] font-medium flex items-center justify-center">
                  {i + 1}
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Animation name"
                        value={seq.name}
                        onChange={(e) =>
                          updateSequence(i, "name", e.target.value)
                        }
                        disabled={isLoading}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="w-16">
                      <Input
                        type="number"
                        min={1}
                        max={16}
                        value={seq.frames}
                        onChange={(e) =>
                          updateSequence(
                            i,
                            "frames",
                            parseInt(e.target.value, 10) || 1,
                          )
                        }
                        disabled={isLoading}
                        className="h-8 text-sm text-center"
                      />
                    </div>
                    {sequences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSequence(i)}
                        disabled={isLoading}
                        className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Textarea
                    placeholder="Describe the animation..."
                    value={seq.description}
                    onChange={(e) =>
                      updateSequence(i, "description", e.target.value)
                    }
                    disabled={isLoading}
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <Play className="w-3 h-3" />
              {validSequenceCount} sequence{validSequenceCount !== 1 && "s"}
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3 h-3" />
              {totalFrames} total frames
            </span>
          </div>
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
