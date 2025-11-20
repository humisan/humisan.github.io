import Link from "next/link";
import styles from "../components/Blog.module.css";

export default function BlogPage() {
  const posts = [
    {
      slug: "getting-started-nextjs",
      title: "Getting Started with Next.js",
      date: "January 15, 2025",
      excerpt: "Learn how to build modern web applications with Next.js and React.",
    },
    {
      slug: "web-dev-best-practices",
      title: "Web Development Best Practices",
      date: "January 10, 2025",
      excerpt: "Essential tips and practices for building scalable web applications.",
    },
    {
      slug: "typescript-tips",
      title: "TypeScript Tips and Tricks",
      date: "January 5, 2025",
      excerpt: "Improve your TypeScript skills with these useful tips and tricks.",
    },
  ];

  return (
    <div>
      <div className={styles.blogHeader}>
        <h2>Blog Posts</h2>
      </div>
      <div className={styles.blogGrid}>
        {posts.map((post) => (
          <article
            key={post.slug}
            className={styles.blogListItem}
          >
            <time className={styles.blogDate}>{post.date}</time>
            <h3 className={styles.blogTitle}>{post.title}</h3>
            <p className={styles.blogExcerpt}>{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug}`}
              className={styles.blogReadLink}
            >
              Read More
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
