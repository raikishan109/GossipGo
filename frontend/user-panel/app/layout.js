import "@/user/styles/globals.css";
import { ThemeSync } from "@/user/components/theme-sync";
import { PwaRegister } from "@/user/components/pwa-register";
import { metadata as siteMetadata, themeScript } from "@/user/services/site-config";

export const metadata = siteMetadata;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="application-name" content="GossipGo" />
        <meta name="theme-color" content="#b91c1c" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GossipGo" />
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
