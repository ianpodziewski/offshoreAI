import type { Metadata } from "next";
import { PAGE_TITLE, PAGE_DESCRIPTION } from "@/configuration/ui";
import "./globals.css";
import { ErrorWrapper } from "./parts/error/error-wrapper";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Make sure this is only called on the server side
  if (typeof window === 'undefined') {
    const requiredEnvVars = [
      { name: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY },
      { name: 'PINECONE_API_KEY', value: process.env.PINECONE_API_KEY }
    ];
    
    for (const { name, value } of requiredEnvVars) {
      if (!value) {
        console.error(`⚠️ Warning: ${name} environment variable is not set`);
      } else {
        console.log(`✅ ${name} environment variable is set`);
      }
    }
  }

  return (
    <html lang="en">
      <TooltipProvider>
        <body className="bg-background text-foreground antialiased">
          <ErrorWrapper>{children}</ErrorWrapper>
        </body>
      </TooltipProvider>
    </html>
  );
}