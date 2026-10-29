import { Layout } from "../shared/layout/Layout";
import { TrackCatalog } from "../features/tracks/components/TrackCatalog";

export const HomePage = () => {
  return (
    <Layout>
      <TrackCatalog title="All tracks" />
    </Layout>
  );
};
