import { useSearchParams } from "react-router-dom";
import { TrackCatalog } from "../features/tracks/components/TrackCatalog";

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  return (
    <TrackCatalog
      query={query}
      title={query ? `Results for “${query}”` : "Find your next favorite"}
    />
  );
};
