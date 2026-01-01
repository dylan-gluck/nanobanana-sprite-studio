import { type NextRequest, NextResponse } from "next/server";
import { editImage, type ImageContent, saveImageToFile } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const {
      sourceImage,
      prompt,
      referenceImages = [],
      aspectRatio,
    } = await request.json();

    if (!sourceImage || !prompt) {
      return NextResponse.json(
        { error: "Source image and prompt are required" },
        { status: 400 },
      );
    }

    const source: ImageContent = {
      mimeType: "image/png",
      data: sourceImage.replace(/^data:image\/\w+;base64,/, ""),
    };

    const refs: ImageContent[] = referenceImages.map((img: string) => ({
      mimeType: "image/png",
      data: img.replace(/^data:image\/\w+;base64,/, ""),
    }));

    const result = await editImage(source, prompt, refs, { aspectRatio });
    const filename = saveImageToFile(result.image, "characters", "char");

    return NextResponse.json({
      image: result.image,
      filename,
      text: result.text,
    });
  } catch (error) {
    console.error("edit-character error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Edit failed" },
      { status: 500 },
    );
  }
}
