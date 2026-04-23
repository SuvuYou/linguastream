import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOADS_DIR = path.join(
  process.env.HOME ?? "/tmp",
  "linguastream-uploads",
  "subtitles",
);

const ALLOWED_EXTENSIONS = [".srt", ".vtt"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 400 },
    );
  }

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const fileName = `${randomUUID()}${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return NextResponse.json({ path: filePath });
}
