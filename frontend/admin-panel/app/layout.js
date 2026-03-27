import "./globals.css";
import { ThemeSync } from "@/admin/components/theme-sync";
import { PwaRegister } from "@/admin/components/pwa-register";
import { metadata as siteMetadata, themeScript } from "@/admin/services/site-config";

export const metadata = {
  ...siteMetadata,
  title: "GossipGo | Admin Panel"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="application-name" content="GossipGo Admin" />
        <meta name="theme-color" content="#7f1d1d" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GossipGo Admin" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeSync />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
