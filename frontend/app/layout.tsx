import type { Metadata } from "next";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastProvider } from "@/components/layout/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeOS",
  description: "A tua plataforma pessoal de organização, produtividade e aprendizagem.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
