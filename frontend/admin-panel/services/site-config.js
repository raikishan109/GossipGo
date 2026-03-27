export const metadata = {
  title: "GossipGo",
  description: "Anonymous talking to anyone, anywhere.",
  icons: {
    icon: "/favicon.svg",
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
