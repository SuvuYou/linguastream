import { listVideosRoute } from "@linguastream/contracts";
import { libraryPage } from "../fixtures/library";
import { mockRoute } from "../mockRoute";

export const libraryHandlers = [
  mockRoute(listVideosRoute, ({ url }) => {
    const query = listVideosRoute.query!.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!query.success) return undefined;
    return libraryPage(query.data.page, query.data.q);
  }),
];
