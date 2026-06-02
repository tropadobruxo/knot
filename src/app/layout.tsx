import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Knot",
  description:
    "Rede social de conexão para a comunidade kink/fetichista adulta.",
  manifest: "/api/manifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col pb-16 sm:pb-0">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
