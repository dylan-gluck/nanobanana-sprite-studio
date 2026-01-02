import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get the frame to find its animation
    const frame = await prisma.frame.findUnique({
      where: { id },
      select: { animationId: true, frameIndex: true },
    });

    if (!frame) {
      return NextResponse.json({ error: "Frame not found" }, { status: 404 });
    }

    // Delete the frame
    await prisma.frame.delete({
      where: { id },
    });

    // Reindex remaining frames
    await prisma.frame.updateMany({
      where: {
        animationId: frame.animationId,
        frameIndex: { gt: frame.frameIndex },
      },
      data: {
        frameIndex: { decrement: 1 },
      },
    });

    // Update animation frame count
    const remainingFrames = await prisma.frame.count({
      where: { animationId: frame.animationId },
    });

    await prisma.animation.update({
      where: { id: frame.animationId },
      data: { frameCount: remainingFrames },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting frame:", error);
    return NextResponse.json(
      { error: "Failed to delete frame" },
      { status: 500 },
    );
  }
}
