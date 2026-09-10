import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retail Store Analytics",
  description: "Store-level sales and inventory intelligence for regional retail teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
