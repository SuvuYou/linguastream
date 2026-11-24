import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  FETCH_SUBTITLES_API_PARAMS_SCHEMA,
  parseSearchParamsSafe,
  PUT_INGEST_SUBTITLES_API_PARAMS_SCHEMA,
} from "@/helpers/params-schema";
import { getSubtitles, ingestSubtitles } from "@/lib/db-helpers/subtitles";

interface Params {
  params: Promise<{ mediaContentId: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mediaContentId } = await params;

  const parsed = parseSearchParamsSafe(
    FETCH_SUBTITLES_API_PARAMS_SCHEMA,
    req.nextUrl.searchParams,
  );

  if (!parsed?.lang) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const result = await getSubtitles({
    user,
    mediaContentId,
    language: parsed.lang,
  });

  return NextResponse.json(result.data ?? { error: result.error }, {
    status: result.status,
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mediaContentId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PUT_INGEST_SUBTITLES_API_PARAMS_SCHEMA.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await ingestSubtitles({
    user,
    mediaContentId,
    data: parsed.data,
  });

  return NextResponse.json(result.data ?? { error: result.error }, {
    status: result.status,
  });
}
