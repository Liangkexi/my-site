import { getAllBlogPosts } from "@/lib/content";
import BlogClient from "./BlogClient";

export default function BlogPage() {
  const posts = getAllBlogPosts();
  return <BlogClient posts={posts} />;
}
