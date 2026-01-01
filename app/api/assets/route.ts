import fs from "fs";
import { type NextRequest, NextResponse } from "next/server";
import path from "path";

const VALID_FOLDERS = ["characters", "sprites", "reference"];

export async function GET(request: NextRequest) {
  const folder = request.nextUrl.searchParams.get("folder");

  if (!folder || !VALID_FOLDERS.includes(folder)) {
    return NextResponse.json(
      { error: "Invalid folder. Must be: characters, sprites, or reference" },
      { status: 400 },
    );
  }

  try {
    const assetsPath = path.join(process.cwd(), "public", "assets", folder);

    if (!fs.existsSync(assetsPath)) {
      return NextResponse.json({ assets: [] });
    }

    const files = fs.readdirSync(assetsPath);
    const imageFiles = files
      .filter((f) => /\.(png|jpg|jpeg|gif|webp)$/i.test(f))
      .map((filename) => {
        const filepath = path.join(assetsPath, filename);
        const stats = fs.statSync(filepath);
        return {
          filename,
          url: `/assets/${folder}/${filename}`,
          createdAt: stats.birthtime.toISOString(),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return NextResponse.json({ assets: imageFiles });
  } catch (error) {
    console.error("assets error:", error);
    return NextResponse.json(
      { error: "Failed to list assets" },
      { status: 500 },
    );
  }
}
