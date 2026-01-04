import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, characterId, description, assetId, generationSettings } =
      body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Spritesheet name is required" },
        { status: 400 },
      );
    }

    if (!characterId || typeof characterId !== "string") {
      return NextResponse.json(
        { error: "Character ID is required" },
        { status: 400 },
      );
    }

    if (!assetId || typeof assetId !== "string") {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 },
      );
    }

    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: { projectId: true },
    });

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 },
      );
    }

    const spriteSheet = await prisma.spriteSheet.create({
      data: {
        name,
        characterId,
        projectId: character.projectId,
        description: description || null,
        assetId,
        generationSettings: generationSettings || null,
      },
      include: {
        asset: true,
        character: true,
      },
    });

    return NextResponse.json(spriteSheet, { status: 201 });
  } catch (error) {
    console.error("Error creating spritesheet:", error);
    return NextResponse.json(
      { error: "Failed to create spritesheet" },
      { status: 500 },
    );
  }
}
