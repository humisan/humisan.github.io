import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Profile Section */}
      <section className="bg-white rounded-lg shadow p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-2">Your Name</h2>
            <p className="text-xl text-gray-600 mb-4">Your Title / Role</p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Welcome to my bio website! This is where you can share your story,
              skills, and experience with the world. Update this content with your
              own information.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline">Twitter</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline">GitHub</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline">LinkedIn</a>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="bg-white rounded-lg shadow p-8">
        <h3 className="text-2xl font-bold mb-6">Skills</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Frontend</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• React</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• Next.js</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Backend</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Node.js</li>
              <li>• Python</li>
              <li>• PostgreSQL</li>
              <li>• REST API</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <section>
        <h3 className="text-2xl font-bold mb-6">Recent Blog Posts</h3>
        <div className="grid gap-6">
          <article className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition">
            <h4 className="text-xl font-semibold mb-2">Getting Started with Next.js</h4>
            <p className="text-gray-600 mb-4">Learn how to build modern web applications with Next.js and React.</p>
            <Link href="/blog/getting-started-nextjs" className="text-blue-600 hover:underline">
              Read More →
            </Link>
          </article>
          <article className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition">
            <h4 className="text-xl font-semibold mb-2">Web Development Best Practices</h4>
            <p className="text-gray-600 mb-4">Essential tips and practices for building scalable web applications.</p>
            <Link href="/blog/web-dev-best-practices" className="text-blue-600 hover:underline">
              Read More →
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
