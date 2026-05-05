import { getAllExploreItems } from "@/lib/content";
import ExploreClient from "./ExploreClient";

export default function ExplorePage() {
  const items = getAllExploreItems();
  return <ExploreClient items={items} />;
}
