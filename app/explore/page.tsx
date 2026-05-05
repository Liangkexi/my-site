import { getAllExploreItems } from "@/lib/content";
import ExploreClient from "./ExploreClient";

export const dynamic = "force-static";

export default function ExplorePage() {
  const items = getAllExploreItems();
  return <ExploreClient items={items} />;
}
