import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'react-pc98 — PC-98風UIライブラリ',
  description: 'PC-98スタイルのReactコンポーネントライブラリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ height: '100%', overflow: 'hidden' }}>{children}</body>
    </html>
  );
}
