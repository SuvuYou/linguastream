import WatchScreen from "@/components/features/watch/WatchScreen";

export default async function Watch({
  params,
  searchParams,
}: {
  params: Promise<{ videoId: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { videoId } = await params;
  const { t } = await searchParams;
  const startMs = Math.max(0, Number(t) || 0);

  return <WatchScreen videoId={videoId} startMs={startMs} />;
}
