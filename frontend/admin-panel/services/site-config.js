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
      const storedTheme = localStorage.getItem("theme");
      const resolvedTheme =
        storedTheme === "dark" || storedTheme === "light"
          ? storedTheme
          : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

      localStorage.setItem("theme", resolvedTheme);
      document.documentElement.setAttribute("data-theme", resolvedTheme);
      document.documentElement.style.colorScheme = resolvedTheme;
      document.documentElement.style.backgroundColor =
        resolvedTheme === "dark" ? "rgb(18 20 27)" : "rgb(246 244 237)";
    } catch (e) {}
  })();
`;
