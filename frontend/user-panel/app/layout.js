import "@/user/styles/globals.css";
import { ThemeSync } from "@/user/components/theme-sync";
import { metadata as siteMetadata, themeScript } from "@/user/services/site-config";

export const metadata = siteMetadata;

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
