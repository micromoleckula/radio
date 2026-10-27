import { useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { TrackCatalog } from "../components/Tracks/TrackCatalog";

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  return (
    <Layout>
      <TrackCatalog
        query={query}
        title={query ? `Search results for “${query}”` : "Search"}
      />
    </Layout>
  );
};
