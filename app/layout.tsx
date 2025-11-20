import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import styles from "./components/Layout.module.css";

export const metadata: Metadata = {
  title: "My Bio",
  description: "My personal bio website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <Link href="/" className={styles.navBrand}>
              BIO
            </Link>
            <ul className={styles.navLinks}>
              <li><Link href="/" className={styles.navLink}>Home</Link></li>
              <li><Link href="/blog" className={styles.navLink}>Blog</Link></li>
            </ul>
          </div>
        </nav>
        <main className={styles.mainContent}>
          {children}
        </main>
        <footer className={styles.footer}>
          <div className="max-w-4xl mx-auto px-4">
            <p className={styles.footerText}>&copy; 2025. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
