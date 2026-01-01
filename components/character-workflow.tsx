"use client";

import { Loader2, Pencil, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AssetPicker } from "./asset-picker";
import { ImagePreview } from "./image-preview";
import { ImageUpload } from "./image-upload";

export function CharacterWorkflow() {
  const [mode, setMode] = useState<"generate" | "edit">("generate");
  const [prompt, setPrompt] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [sourceImage, setSourceImage] = useState<string>("");
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    image: string;
    filename: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/gen-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, referenceImages, aspectRatio }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult({ image: data.image, filename: data.filename });
      toast.success("Character generated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage) {
      toast.error("Please select a character to edit");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Please enter edit instructions");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/edit-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceImage,
          prompt,
          referenceImages,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult({ image: data.image, filename: data.filename });
      toast.success("Character edited!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Edit failed");
    } finally {
      setLoading(false);
    }
  };

  const useResultAsSource = () => {
    if (result) {
      setSourceImage(`data:image/png;base64,${result.image}`);
      setSourceUrl("");
      setMode("edit");
      setResult(null);
      setPrompt("");
      toast.success("Loaded as source for editing");
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "generate" | "edit")}
        >
          <TabsList className="w-full">
            <TabsTrigger value="generate" className="flex-1">
              <Sparkles className="h-4 w-4 mr-1" /> Generate
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex-1">
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe your character... (e.g., 'A brave knight with silver armor and a red cape, pixel art style')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Reference Images (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={referenceImages}
                  onChange={setReferenceImages}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Select Character</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetPicker
                  folder="characters"
                  value={sourceUrl}
                  onChange={(url, base64) => {
                    setSourceUrl(url);
                    if (base64) setSourceImage(base64);
                  }}
                />
                {sourceImage && !sourceUrl && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Current source:
                    </p>
                    <img
                      src={sourceImage}
                      alt="Source"
                      className="h-24 rounded-md"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Edit Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe the changes... (e.g., 'Add a wizard hat and change armor to purple')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Reference Images (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={referenceImages}
                  onChange={setReferenceImages}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3">
          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">1:1</SelectItem>
              <SelectItem value="4:3">4:3</SelectItem>
              <SelectItem value="3:4">3:4</SelectItem>
              <SelectItem value="16:9">16:9</SelectItem>
              <SelectItem value="9:16">9:16</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={mode === "generate" ? handleGenerate : handleEdit}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === "generate" ? "Generating..." : "Editing..."}
              </>
            ) : (
              <>
                {mode === "generate" ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" /> Generate
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mr-2" /> Apply Edit
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </div>

      <div>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-3">
                <ImagePreview
                  image={result.image}
                  filename={result.filename}
                  saved={true}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={useResultAsSource}
                  className="w-full"
                >
                  <Pencil className="h-4 w-4 mr-1" /> Edit This Character
                </Button>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {loading ? (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Creating your character...</p>
                  </div>
                ) : (
                  <p className="text-sm">
                    Generated character will appear here
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
