import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | BlissCards",
    default: "BlissCards"
  },
  description: "A free alternative to Quizlet, allowing you to create your own flashcard sets and review as much as you need!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies saved theme before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('blisscards_theme');if(t==='light'||t==='dark'||t==='ocean'||t==='rose'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();` }} />
      </head>
      <body className={`${josefinSans.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
