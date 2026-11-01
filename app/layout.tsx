import type { Metadata } from "next";
import "./globals.css";

// The "layout" wraps every page in the app: anything here (fonts, colors,
// a nav bar later) shows up on every screen.
export const metadata: Metadata = {
  title: "Lineup",
  description: "See which shows your friends are going to.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0F0F12] text-[#F2F2F0] font-sans">
        {children}
      </body>
    </html>
  );
}
