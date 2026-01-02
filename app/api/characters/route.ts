import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, projectId, userPrompt, primaryAssetId } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Character name is required" },
        { status: 400 },
      );
    }

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    const character = await prisma.character.create({
      data: {
        name,
        projectId,
        userPrompt: userPrompt || null,
        primaryAssetId: primaryAssetId || null,
      },
      include: {
        primaryAsset: true,
        assets: true,
      },
    });

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    console.error("Error creating character:", error);
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 },
    );
  }
}
