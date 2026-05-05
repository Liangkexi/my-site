import { getAllBlogPosts } from "@/lib/content";
import BlogClient from "./BlogClient";

export const dynamic = "force-static";

export default function BlogPage() {
  const posts = getAllBlogPosts();
  return <BlogClient posts={posts} />;
}
