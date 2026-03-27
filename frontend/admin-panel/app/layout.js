import "./globals.css";
import { ThemeSync } from "@/admin/components/theme-sync";
import { metadata as siteMetadata, themeScript } from "@/admin/services/site-config";

export const metadata = {
  ...siteMetadata,
  title: "GossipGo | Admin Panel"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
