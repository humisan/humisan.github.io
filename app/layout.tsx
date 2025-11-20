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
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23663EEA' width='100' height='100' rx='20'/><text x='50' y='65' font-size='60' font-weight='700' text-anchor='middle' fill='white' font-family='Arial'>H</text></svg>",
        type: "image/svg+xml",
      },
    ],
    apple: {
      url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><rect fill='%23663EEA' width='180' height='180' rx='40'/><text x='90' y='135' font-size='100' font-weight='700' text-anchor='middle' fill='white' font-family='Arial'>H</text></svg>",
      type: "image/svg+xml",
    },
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
