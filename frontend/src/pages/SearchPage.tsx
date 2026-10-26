import { useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  return <Layout>test</Layout>;
};
