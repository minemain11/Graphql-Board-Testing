import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import ApolloSetting from "@/commons/apollo";
import Layout from "@/commons/layout";
import "./globals.css";

// SUIT 가변 폰트 (https://sun.fo/suit) - 하나의 파일로 모든 굵기(100~900)를 사용합니다.
const suit = localFont({
  src: "../commons/fonts/SUIT-Variable.woff2",
  variable: "--font-suit",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TALKR",
    template: "%s | TALKR",
  },
  description: "자유롭게 이야기를 나누는 게시판, TALKR",
};

export const viewport: Viewport = {
  themeColor: "#6400ff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={suit.variable}>
      <body>
        <ApolloSetting>
          <Layout>{children}</Layout>
        </ApolloSetting>
      </body>
    </html>
  );
}
