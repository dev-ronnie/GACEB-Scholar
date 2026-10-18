import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { GacebProvider } from "@/lib/gaceb";
import { Shell } from "@/components/shell";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GACEB Scholar" },
      { name: "description", content: "Uganda curriculum learning for O-Level and A-Level students." },
      { name: "theme-color", content: "#0e5c43" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/brand/icon-192.png" },
      { rel: "apple-touch-icon", href: "/brand/icon-192.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600;700&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <GacebProvider>
            <Shell>
              <Outlet />
            </Shell>
          </GacebProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
