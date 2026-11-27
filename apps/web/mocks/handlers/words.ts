import {
  getWordPackRoute,
  lookupWordRoute,
  setWordStatusRoute,
  type SetWordStatus,
} from "@linguastream/contracts";
import { mockVideos } from "../fixtures/watch";
import { mockWordLookup, mockWordPack, setMockWordStatus } from "../fixtures/words";
import { mockRoute } from "../mockRoute";

export const wordsHandlers = [
  mockRoute(getWordPackRoute, ({ params }) => {
    const entry = mockVideos[params.videoId!];
    return entry && mockWordPack(entry.video.id, entry.lines);
  }),
  mockRoute(lookupWordRoute, ({ params }) => {
    const line = mockVideos[params.videoId!]?.lines.find((l) => l.index === Number(params.index));
    return line && mockWordLookup(params.videoId!, line, Number(params.i));
  }),
  mockRoute(setWordStatusRoute, ({ body }) => {
    const change = body as SetWordStatus;
    setMockWordStatus(change.lemma, change.status);
    return change;
  }),
];
