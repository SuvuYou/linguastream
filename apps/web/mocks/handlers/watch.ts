import { getLineWindowRoute, getVideoRoute } from "@linguastream/contracts";
import { mockVideos } from "../fixtures/watch";
import { mockRoute } from "../mockRoute";

export const watchHandlers = [
  mockRoute(getLineWindowRoute, ({ params, url }) => {
    const entry = mockVideos[params.videoId!];
    if (!entry) return undefined;
    const from = Number(url.searchParams.get("from_ms") ?? 0);
    const to = Number(url.searchParams.get("to_ms") ?? 0);
    return {
      from_ms: from,
      to_ms: to,
      lines: entry.lines.filter(
        (line) => line.start_ms >= from && line.start_ms < to,
      ),
    };
  }),
  mockRoute(getVideoRoute, ({ params }) => mockVideos[params.videoId!]?.video),
];
