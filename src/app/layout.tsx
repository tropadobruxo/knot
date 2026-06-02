import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { OnboardingTour } from "@/components/onboarding-tour";
import "./globals.css";

export const metadata: Metadata = {
  title: "Knot",
  description:
    "Rede social de conexão para a comunidade kink/fetichista adulta.",
  manifest: "/api/manifest",
  openGraph: {
    title: "Knot",
    description: "Conexões autênticas para a comunidade kink e fetichista.",
    type: "website",
    siteName: "Knot",
  },
  twitter: {
    card: "summary",
    title: "Knot",
    description: "Conexões autênticas para a comunidade kink e fetichista.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("knot-theme");if(t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();if("serviceWorker"in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw-push.js")})}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col pb-16 sm:pb-0">
        <Navbar />
        <OnboardingTour />
        {children}
      </body>
    </html>
  );
}
