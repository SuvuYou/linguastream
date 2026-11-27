import { deleteVideoRoute, listVideosRoute, translateVideoRoute } from "@linguastream/contracts";
import { deleteMockVideo, libraryPage, translateMockVideo } from "../fixtures/library";
import { mockRoute } from "../mockRoute";

export const libraryHandlers = [
  mockRoute(listVideosRoute, ({ url }) => {
    const query = listVideosRoute.query!.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!query.success) return undefined;
    return libraryPage(query.data.page, query.data.q);
  }),
  mockRoute(translateVideoRoute, ({ params }) => translateMockVideo(params.videoId!)),
  mockRoute(deleteVideoRoute, ({ params }) => deleteMockVideo(params.videoId!)),
];
