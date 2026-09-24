import "~/styles/globals.css";
import { type Metadata } from "next";
export const metadata: Metadata = { title: "SUE Clinical Notes", description: "Sue 的私密诊疗病历工作台", robots: { index: false, follow: false } };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="zh-CN"><body>{children}</body></html>; }
