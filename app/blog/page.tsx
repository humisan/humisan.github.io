import Link from "next/link";

export default function BlogPage() {
  const posts = [
    {
      slug: "getting-started-nextjs",
      title: "Getting Started with Next.js",
      date: "2025-01-15",
      excerpt: "Learn how to build modern web applications with Next.js and React.",
    },
    {
      slug: "web-dev-best-practices",
      title: "Web Development Best Practices",
      date: "2025-01-10",
      excerpt: "Essential tips and practices for building scalable web applications.",
    },
    {
      slug: "typescript-tips",
      title: "TypeScript Tips and Tricks",
      date: "2025-01-05",
      excerpt: "Improve your TypeScript skills with these useful tips and tricks.",
    },
  ];

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8">Blog Posts</h2>
      <div className="grid gap-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition"
          >
            <time className="text-gray-500 text-sm">{post.date}</time>
            <h3 className="text-2xl font-semibold mt-2 mb-2">{post.title}</h3>
            <p className="text-gray-700 mb-4">{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="text-blue-600 hover:underline font-medium"
            >
              Read More →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
