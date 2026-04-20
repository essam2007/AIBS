import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import ClientLayout from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: "Gulf Oil Desk — Global Energy Terminal",
  description: "Professional oil & energy market terminal with live prices, news, and analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <div style={{ marginLeft: 72, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <ClientLayout>{children}</ClientLayout>
        </div>
      </body>
    </html>
  );
}
