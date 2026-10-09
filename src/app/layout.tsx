import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ variable: "--font-app-sans", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-app-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});
const mono = JetBrains_Mono({ variable: "--font-app-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "EduSphere SMS — Super Admin",
    template: "%s · EduSphere SMS",
  },
  description:
    "Super Admin console for the multi-campus School Management System.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
