import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Libra — Secure, AI-powered notes",
  description:
    "Libra is a security-first, AI-powered note-taking and collaboration workspace. Block-based editing, a freeform canvas, and a built-in AI assistant — private by design.",
  keywords: [
    "Libra",
    "secure notes",
    "Notion alternative",
    "AI notes",
    "block editor",
    "privacy",
  ],
};

/* Applied before first paint so the saved theme never flashes. */
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("libra-theme");
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
