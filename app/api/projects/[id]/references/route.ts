import fs from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { image, filename: originalFilename } = body;

    if (!image) {
      return NextResponse.json(
        { error: "image (base64) is required" },
        { status: 400 },
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create references directory
    const refsDir = path.join(
      process.cwd(),
      "public",
      "assets",
      projectId,
      "references",
    );
    fs.mkdirSync(refsDir, { recursive: true });

    // Generate filename
    const timestamp = Date.now();
    const ext = originalFilename?.split(".").pop() || "png";
    const filename = `ref_${timestamp}.${ext}`;
    const filepath = path.join(refsDir, filename);

    // Decode and save
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(filepath, buffer);

    const filePath = `/assets/${projectId}/references/${filename}`;

    // Create asset record
    const asset = await prisma.asset.create({
      data: {
        projectId,
        filePath,
        type: "reference",
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("upload reference error:", error);
    return NextResponse.json(
      { error: "Failed to upload reference" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");

    if (!assetId) {
      return NextResponse.json(
        { error: "assetId query param required" },
        { status: 400 },
      );
    }

    // Verify asset exists and belongs to project
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, projectId, type: "reference" },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Delete file from disk
    const filepath = path.join(process.cwd(), "public", asset.filePath);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete from database
    await prisma.asset.delete({ where: { id: assetId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("delete reference error:", error);
    return NextResponse.json(
      { error: "Failed to delete reference" },
      { status: 500 },
    );
  }
}
