import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Construtor de Roteiros - Planejador de Viagens",
  description: "Monte roteiros de viagem de forma interativa com preços em tempo real",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
          {children}
        </main>
      </body>
    </html>
  );
}