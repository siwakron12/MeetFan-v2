import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Prompt } from "next/font/google";
export const metadata: Metadata = {
    title: "Meetfan",
    description: "Next.js app starter with Tailwind CSS"
};
const prompt = Prompt({
    subsets: ["thai", "latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-prompt",
});
export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
  
            <html lang="th">
                 <body className={`${prompt.className} antialiased`}>
                    <AuthProvider>{children}</AuthProvider>
                </body>
            </html>
    
    );
}
