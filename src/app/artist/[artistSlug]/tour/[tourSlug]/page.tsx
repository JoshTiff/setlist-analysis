type TourPageProps = {
  params: Promise<{
    artistSlug: string;
    tourSlug: string;
  }>;
};

export default async function TourPage({ params }: TourPageProps) {
  const { artistSlug, tourSlug } = await params;

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Tour Dashboard</h1>
      <p>
        Artist: <code>{artistSlug}</code>
      </p>
      <p>
        Tour: <code>{tourSlug}</code>
      </p>
      <p>This dashboard will be built in a later phase.</p>
    </main>
  );
}