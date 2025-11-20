import Link from "next/link";
import styles from "./components/Home.module.css";

export default function Home() {
  return (
    <div>
      {/* Profile Section */}
      <section className={styles.profileSection}>
        <div className={styles.profileContainer}>
          <div className={styles.profileImage}>👨‍💻</div>
          <div className={styles.profileContent}>
            <h2>Your Name</h2>
            <p className={styles.title}>Your Title / Role</p>
            <p className={styles.description}>
              Welcome to my bio website! This is where you can share your story,
              skills, and experience with the world. Update this content with your
              own information.
            </p>
            <div className={styles.socialLinks}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                Twitter
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                GitHub
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className={styles.skillsSection}>
        <h3>Skills</h3>
        <div className={styles.skillsGrid}>
          <div className={styles.skillCategory}>
            <h4>Frontend</h4>
            <ul>
              <li>React</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Next.js</li>
            </ul>
          </div>
          <div className={styles.skillCategory}>
            <h4>Backend</h4>
            <ul>
              <li>Node.js</li>
              <li>Python</li>
              <li>PostgreSQL</li>
              <li>REST API</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <section className={styles.blogSection}>
        <h3>Recent Blog Posts</h3>
        <div className={styles.blogGrid}>
          <article className={styles.blogCard}>
            <div className={styles.blogCardDate}>Latest</div>
            <h4 className={styles.blogCardTitle}>Getting Started with Next.js</h4>
            <p className={styles.blogCardExcerpt}>
              Learn how to build modern web applications with Next.js and React.
            </p>
            <Link href="/blog/getting-started-nextjs" className={styles.blogCardLink}>
              Read More
            </Link>
          </article>
          <article className={styles.blogCard}>
            <div className={styles.blogCardDate}>Popular</div>
            <h4 className={styles.blogCardTitle}>Web Development Best Practices</h4>
            <p className={styles.blogCardExcerpt}>
              Essential tips and practices for building scalable web applications.
            </p>
            <Link href="/blog/web-dev-best-practices" className={styles.blogCardLink}>
              Read More
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
