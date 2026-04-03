export default async function Watch({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId } = await params;

  return <div>Watch {contentId}</div>;
}
