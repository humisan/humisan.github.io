import Link from "next/link";

export async function generateStaticParams() {
  return [
    { slug: "getting-started-nextjs" },
    { slug: "web-dev-best-practices" },
    { slug: "typescript-tips" },
  ];
}

const blogPosts: Record<string, { title: string; date: string; content: string }> = {
  "getting-started-nextjs": {
    title: "Getting Started with Next.js",
    date: "2025-01-15",
    content: `
      # Getting Started with Next.js

      Next.js is a React framework that enables you to build full-stack web applications
      with ease. In this guide, we'll explore the basics of Next.js and how to get started.

      ## What is Next.js?

      Next.js provides a framework for building React applications with additional features
      like server-side rendering, static site generation, and API routes.

      ## Installation

      To get started, you can use the following command:

      \`\`\`bash
      npx create-next-app@latest my-app
      \`\`\`

      ## File-based Routing

      Next.js uses file-based routing, which means the file structure of your \`app\` directory
      determines your application's routes.

      ## Conclusion

      This is just the beginning! Explore the official Next.js documentation to learn more.
    `,
  },
  "web-dev-best-practices": {
    title: "Web Development Best Practices",
    date: "2025-01-10",
    content: `
      # Web Development Best Practices

      Building scalable and maintainable web applications requires following best practices.

      ## Performance Optimization

      - Minimize HTTP requests
      - Compress assets
      - Lazy load images
      - Use CDN for static assets

      ## Security

      - Validate user input
      - Use HTTPS
      - Protect against XSS attacks
      - Keep dependencies updated

      ## Code Quality

      - Write clean, readable code
      - Use version control
      - Write tests
      - Follow consistent coding standards

      These practices help ensure your applications are fast, secure, and maintainable.
    `,
  },
  "typescript-tips": {
    title: "TypeScript Tips and Tricks",
    date: "2025-01-05",
    content: `
      # TypeScript Tips and Tricks

      TypeScript can help you write more reliable JavaScript code. Here are some tips:

      ## Use Strict Mode

      Enable strict mode in your tsconfig.json to catch more errors at compile time.

      ## Type Inference

      TypeScript can often infer types, so you don't always need to write explicit type annotations.

      ## Union Types

      Use union types to represent values that can be one of several types:

      \`\`\`typescript
      type Status = 'success' | 'error' | 'pending';
      \`\`\`

      ## Utility Types

      TypeScript provides utility types like \`Partial\`, \`Record\`, and \`Readonly\` to help
      you work with types more effectively.

      Keep exploring the TypeScript documentation to learn more advanced features!
    `,
  },
};

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Post not found</h2>
        <p className="text-gray-600 mt-2">The blog post you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/blog" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="bg-white rounded-lg shadow p-8 max-w-3xl mx-auto">
      <Link href="/blog" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Blog
      </Link>
      <header className="mb-8">
        <time className="text-gray-500">{post.date}</time>
        <h1 className="text-4xl font-bold mt-2">{post.title}</h1>
      </header>
      <div className="prose max-w-none">
        {post.content.split('\n').map((line, index) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
                {line.replace('# ', '')}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={index} className="text-2xl font-bold mt-6 mb-3">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <li key={index} className="ml-6 mb-2 text-gray-700">
                {line.replace('- ', '')}
              </li>
            );
          }
          if (line.startsWith('```')) {
            return null;
          }
          if (line.trim() === '') {
            return <div key={index} className="h-2" />;
          }
          return (
            <p key={index} className="text-gray-700 mb-4 leading-relaxed">
              {line}
            </p>
          );
        })}
      </div>
    </article>
  );
}
