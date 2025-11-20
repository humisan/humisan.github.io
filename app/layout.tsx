import type { Metadata } from "next";
import "./globals.css";
import styles from "./components/Layout.module.css";

export const metadata: Metadata = {
  title: "My Bio",
  description: "Modern portfolio with glassmorphism design",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className={styles.mainContent}>
          {children}
        </main>
        <footer className={styles.footer}>
          <p className={styles.footerText}>&copy; 2025 All Rights Reserved</p>
        </footer>
      </body>
    </html>
  );
}
