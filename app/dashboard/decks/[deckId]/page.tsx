import OverlayPlayer from "@/components/features/overlay-player/OverlayPlayer";
import DeckDetailPage from "@/components/pages/DeckDetailsPage";

export default async function Deck({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;

  return (
    <>
      <DeckDetailPage deckId={deckId} />
      <OverlayPlayer />
    </>
  );
}
