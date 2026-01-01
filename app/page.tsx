"use client";

import { Layers, Sparkles } from "lucide-react";
import { CharacterWorkflow } from "@/components/character-workflow";
import { SpriteWorkflow } from "@/components/sprite-workflow";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">🍌 NanoBanana Sprite Studio</h1>
          <p className="text-sm text-muted-foreground">
            Character & sprite generation with Gemini
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="character" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="character" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Character
            </TabsTrigger>
            <TabsTrigger value="sprite" className="gap-2">
              <Layers className="h-4 w-4" />
              Sprite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="character">
            <CharacterWorkflow />
          </TabsContent>

          <TabsContent value="sprite">
            <SpriteWorkflow />
          </TabsContent>
        </Tabs>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
