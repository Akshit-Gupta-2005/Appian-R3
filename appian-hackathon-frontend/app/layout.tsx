import type React from "react";
import "./globals.css";

export const metadata = {
  title: "ReadEase - Tools for Dyslexic Users",
  description:
    "Text-to-speech, PDF reading, image-to-text and spelling tools for dyslexic Users",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.cdnfonts.com/css/opendyslexic"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange> */}
        {children}
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
