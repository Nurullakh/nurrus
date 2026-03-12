import type { Metadata } from "next";
import "@/index.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "NURRUS",
  description: "Интернет-магазин кухонь и техники NURRUS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
