import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const spriteSheet = await prisma.spriteSheet.findUnique({
      where: { id },
      include: {
        character: {
          include: {
            primaryAsset: true,
            assets: true,
          },
        },
        asset: true,
        project: true,
      },
    });

    if (!spriteSheet) {
      return NextResponse.json(
        { error: "Spritesheet not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(spriteSheet);
  } catch (error) {
    console.error("Error fetching spritesheet:", error);
    return NextResponse.json(
      { error: "Failed to fetch spritesheet" },
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
    const { name, description } = body;

    const spriteSheet = await prisma.spriteSheet.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        asset: true,
        character: true,
      },
    });

    return NextResponse.json(spriteSheet);
  } catch (error) {
    console.error("Error updating spritesheet:", error);
    return NextResponse.json(
      { error: "Failed to update spritesheet" },
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

    const spriteSheet = await prisma.spriteSheet.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!spriteSheet) {
      return NextResponse.json(
        { error: "Spritesheet not found" },
        { status: 404 },
      );
    }

    await prisma.spriteSheet.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting spritesheet:", error);
    return NextResponse.json(
      { error: "Failed to delete spritesheet" },
      { status: 500 },
    );
  }
}
