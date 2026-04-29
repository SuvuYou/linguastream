import WatchPage from "@/components/pages/WatchPage";

export default async function Watch({
  params,
}: {
  params: Promise<{ mediaContentId: string }>;
}) {
  const { mediaContentId } = await params;
  return <WatchPage mediaContentId={mediaContentId} />;
}
