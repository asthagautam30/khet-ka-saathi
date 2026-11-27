import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Khet Ka Saathi | खेत का साथी",
  description: "A simple, multilingual and offline-friendly farming companion for Indian farmers.",
  manifest: "/manifest.webmanifest",
  applicationName: "Khet Ka Saathi",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "खेत का साथी" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" }
};
export const viewport = { themeColor: "#2f6844", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="hi"><body>{children}</body></html>;
}
