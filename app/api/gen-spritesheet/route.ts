import fs from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { characterPresets } from "@/lib/config/character-presets";
import { editImage, type ImageContent } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { characterId, characterAssetId, name, description, frameCount, anglePreset } =
      await request.json();

    if (!characterId || !characterAssetId || !name || !description || !frameCount) {
      return NextResponse.json(
        {
          error:
            "characterId, characterAssetId, name, description, and frameCount are required",
        },
        { status: 400 },
      );
    }

    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { project: true },
    });
    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 },
      );
    }

    const characterAsset = await prisma.asset.findUnique({
      where: { id: characterAssetId },
    });
    if (!characterAsset) {
      return NextResponse.json(
        { error: "Character asset not found" },
        { status: 404 },
      );
    }

    // Read character image as base64
    const imagePath = path.join(
      process.cwd(),
      "public",
      characterAsset.filePath,
    );
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const source: ImageContent = {
      mimeType: "image/png",
      data: base64Image,
    };

    // Build sprite sheet prompt (v0 logic)
    const cols = Math.ceil(Math.sqrt(frameCount));

    // Get angle preset prompt fragment
    const angleOption = characterPresets.angles.find(
      (a) => a.value === anglePreset,
    );
    const angleFragment = angleOption ? `, ${angleOption.promptFragment}` : "";

    const prompt = `Create a sprite sheet grid for this character with the following animation:

${description} (${frameCount} frames)

Requirements:
- Arrange all frames in a ${cols}x${cols} grid layout
- Each frame should show the character in a clear pose for animation${angleFragment}
- Maintain consistent character design across all frames
- Use the same background color as the reference image
- Keep frames evenly spaced for easy extraction
- Total frames: ${frameCount}`;

    // Generate spritesheet
    const result = await editImage(source, prompt, [], {
      aspectRatio: "1:1",
      resolution: "2K",
    });

    // Save to project-based path
    const projectId = character.projectId;
    const spritesheetsDir = path.join(
      process.cwd(),
      "public",
      "assets",
      projectId,
      "spritesheets",
    );

    fs.mkdirSync(spritesheetsDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = name.replace(/\s+/g, "-").toLowerCase();
    const filename = `${safeName}_${timestamp}.png`;
    const filePath = `/assets/${projectId}/spritesheets/${filename}`;
    const fullPath = path.join(spritesheetsDir, filename);

    const buffer = Buffer.from(result.image, "base64");
    fs.writeFileSync(fullPath, buffer);

    // Create Asset record
    const asset = await prisma.asset.create({
      data: {
        projectId,
        filePath,
        type: "spritesheet",
        systemPrompt: prompt,
        userPrompt: name,
        referenceAssetIds: [characterAssetId],
        generationSettings: { description, frameCount, anglePreset, cols },
        characterId,
      },
    });

    // Create SpriteSheet record
    const spriteSheet = await prisma.spriteSheet.create({
      data: {
        name,
        characterId,
        projectId,
        description,
        assetId: asset.id,
        generationSettings: {
          characterAssetId,
          anglePreset,
          frameCount,
          cols,
        },
      },
      include: {
        asset: true,
        character: true,
      },
    });

    return NextResponse.json({
      spriteSheet,
      spriteGrid: result.image,
      text: result.text,
    });
  } catch (error) {
    console.error("gen-spritesheet error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Spritesheet generation failed",
      },
      { status: 500 },
    );
  }
}
