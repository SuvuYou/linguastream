export default async function Deck({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;

  return <div>Deck {deckId}</div>;
}
