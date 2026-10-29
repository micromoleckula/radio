import { useSearchParams } from "react-router-dom";
import { Layout } from "../shared/layout/Layout";
import { TrackCatalog } from "../features/tracks/components/TrackCatalog";

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  return (
    <Layout>
      <TrackCatalog
        query={query}
        title={query ? `Results for “${query}”` : "Find your next favorite"}
      />
    </Layout>
  );
};
