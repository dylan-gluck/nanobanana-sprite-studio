import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        primaryAsset: true,
        assets: {
          where: { type: { not: "spritesheet" } },
          orderBy: { createdAt: "desc" },
        },
        animations: {
          orderBy: { updatedAt: "desc" },
          include: {
            frames: {
              orderBy: { frameIndex: "asc" },
              include: { asset: true },
            },
          },
        },
        spriteSheets: {
          orderBy: { updatedAt: "desc" },
          include: { asset: true },
        },
        project: true,
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(character);
  } catch (error) {
    console.error("Error fetching character:", error);
    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, userPrompt, primaryAssetId } = body;

    const character = await prisma.character.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(userPrompt !== undefined && { userPrompt }),
        ...(primaryAssetId !== undefined && { primaryAssetId }),
      },
      include: {
        primaryAsset: true,
        assets: true,
      },
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error("Error updating character:", error);
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.character.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting character:", error);
    return NextResponse.json(
      { error: "Failed to delete character" },
      { status: 500 },
    );
  }
}
