import { Layout } from "../components/Layout";
import { TrackCatalog } from "../components/Tracks/TrackCatalog";

export const HomePage = () => {
  return (
    <Layout>
      <TrackCatalog title="All tracks" />
    </Layout>
  );
};
