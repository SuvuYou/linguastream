import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import {
  FETCH_SUBTITLES_API_PARAMS_SCHEMA,
  parseSearchParamsSafe,
} from "@/helpers/params-schema";
import { getSubtitles } from "@/lib/db-helpers/subtitles";

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
