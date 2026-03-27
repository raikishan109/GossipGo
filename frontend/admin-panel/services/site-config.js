export const metadata = {
  title: "GossipGo Admin Panel",
  description: "Moderation, reporting, and user management for GossipGo.",
  applicationName: "GossipGo Admin Panel",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/admin-favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/admin-favicon.svg"]
  },
};

export const themeScript = `
  (function() {
    try {
      const theme = localStorage.getItem("theme") || "system";
      const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      const resolvedTheme = dark ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", resolvedTheme);
      document.documentElement.style.colorScheme = resolvedTheme;
      document.documentElement.style.backgroundColor = dark ? "rgb(18 20 27)" : "rgb(246 244 237)";
    } catch (e) {}
  })();
`;
