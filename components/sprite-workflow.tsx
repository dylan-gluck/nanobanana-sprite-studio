"use client";

import { Layers, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AssetPicker } from "./asset-picker";
import { ImagePreview } from "./image-preview";

type Sequence = {
  name: string;
  description: string;
  frames: number;
};

const defaultSequence: Sequence = { name: "", description: "", frames: 4 };

export function SpriteWorkflow() {
  const [characterImage, setCharacterImage] = useState<string>("");
  const [characterUrl, setCharacterUrl] = useState<string>("");
  const [sequences, setSequences] = useState<Sequence[]>([
    { ...defaultSequence },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    spriteGrid: string;
    filename: string;
  } | null>(null);

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

  const handleGenerate = async () => {
    if (!characterImage) {
      toast.error("Please select a character");
      return;
    }

    const validSequences = sequences.filter(
      (s) => s.name.trim() && s.description.trim(),
    );
    if (validSequences.length === 0) {
      toast.error("Please add at least one sequence with name and description");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/gen-sprite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterImage, sequences: validSequences }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult({ spriteGrid: data.spriteGrid, filename: data.filename });
      toast.success("Sprite sheet generated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const totalFrames = sequences.reduce((sum, s) => sum + (s.frames || 0), 0);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Select Character</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetPicker
              folder="characters"
              value={characterUrl}
              onChange={(url, base64) => {
                setCharacterUrl(url);
                if (base64) setCharacterImage(base64);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Animation Sequences</CardTitle>
              <Button variant="outline" size="sm" onClick={addSequence}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sequences.map((seq, i) => (
              <div key={i} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex gap-2">
                  <Input
                    placeholder="Sequence name (e.g., idle, walk, attack)"
                    value={seq.name}
                    onChange={(e) => updateSequence(i, "name", e.target.value)}
                    className="flex-1"
                  />
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
                    className="w-20"
                    placeholder="Frames"
                  />
                  {sequences.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSequence(i)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="Describe the animation (e.g., 'character bouncing in place with arms at sides')"
                  value={seq.description}
                  onChange={(e) =>
                    updateSequence(i, "description", e.target.value)
                  }
                  rows={2}
                />
              </div>
            ))}

            <div className="text-xs text-muted-foreground text-center pt-2">
              Total frames: {totalFrames}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Sprite Sheet...
            </>
          ) : (
            <>
              <Layers className="h-4 w-4 mr-2" />
              Generate Sprite Sheet
            </>
          )}
        </Button>
      </div>

      <div>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Sprite Sheet</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <ImagePreview
                image={result.spriteGrid}
                filename={result.filename}
                saved={true}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {loading ? (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Creating sprite sheet...</p>
                    <p className="text-xs mt-1">This may take a moment</p>
                  </div>
                ) : (
                  <p className="text-sm">Sprite sheet will appear here</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
