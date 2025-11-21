import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
import styles from "./components/Layout.module.css";
import { RootClientLayout } from "./components/RootClientLayout";

export const metadata: Metadata = {
  title: "humisan - Developer",
  description: "Creative developer exploring web design and code",
  metadataBase: new URL("https://hanyuu.lol"),
  openGraph: {
    title: "humisan - Developer",
    description: "Creative developer exploring web design and code",
    url: "https://hanyuu.lol",
    siteName: "humisan",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "humisan - Developer",
    description: "Creative developer exploring web design and code",
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootClientLayout>
          <main className={styles.mainContent}>
            {children}
          </main>
          <footer className={styles.footer}>
            <p className={styles.footerText}>&copy; 2025 All Rights Reserved</p>
          </footer>
        </RootClientLayout>
      </body>
    </html>
  );
}
