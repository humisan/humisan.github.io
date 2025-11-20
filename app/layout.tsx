import type { Metadata } from "next";
import "./globals.css";
import styles from "./components/Layout.module.css";

export const metadata: Metadata = {
  title: "humisan | Developer Portfolio",
  description: "Developer portfolio with modern glassmorphism design and Higurashi When They Cry theme",
  metadataBase: new URL("https://hanyuu.lol"),
  openGraph: {
    title: "humisan | Developer Portfolio",
    description: "Developer portfolio with modern glassmorphism design and Higurashi When They Cry theme",
    url: "https://hanyuu.lol",
    siteName: "humisan's Bio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "humisan | Developer Portfolio",
    description: "Developer portfolio with modern glassmorphism design and Higurashi When They Cry theme",
    creator: "@humisan7626",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
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
