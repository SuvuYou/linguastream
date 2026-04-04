import Player from "@/components/features/Player";
import { fetchJellyfinWatchItem, getJellyfinStreamUrl } from "@/lib/jellyfin";

export default async function Watch({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId } = await params;

  const videoItemData = await fetchJellyfinWatchItem(contentId);
  const videoUrl = getJellyfinStreamUrl(contentId);

  return (
    <>
      <div className="flex items-center justify-center bg-black mt-1">
        <Player streamUrl={videoUrl} title={videoItemData.Name} />
      </div>
    </>
  );
}
