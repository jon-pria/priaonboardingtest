import "../styles/globals.css";  // ✅ Corrected path
import { Public_Sans } from "next/font/google";

const publicSans = Public_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "PRIA Dashboard",
  description: "Your personalized PRIA insights",
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body className={publicSans.className}>{children}</body>
    </html>
  );
}
