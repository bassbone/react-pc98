# react-pc98

PC-98風UIコンポーネントライブラリ。Next.js / React 向けに構築されたレトロスタイルのUIセットです。

## コンポーネント一覧

| コンポーネント | 説明 |
|---|---|
| `Window` | タイトルバー付きウィンドウ |
| `Button` | ボタン（通常 / プライマリ / 危険） |
| `TextInput` | テキスト入力フィールド |
| `Checkbox` | チェックボックス |
| `Select` | セレクトボックス |
| `MenuBar` | メニューバー（ドロップダウン付き） |
| `Dialog` | モーダルダイアログ |
| `ProgressBar` | プログレスバー |
| `Terminal` | ターミナルエミュレータ |
| `StatusBar` | ステータスバー |
| `Desktop` | デスクトップ背景（壁紙パターン対応） |

## 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でデモが確認できます。

## 使い方

```tsx
import { Window, Button, Desktop } from './lib';

export default function App() {
  return (
    <Desktop wallpaper="dots">
      <Window title="はじめてのウィンドウ" x={50} y={50} width={300} height={200} onClose={() => {}}>
        <Button variant="primary">クリック</Button>
      </Window>
    </Desktop>
  );
}
```

## 技術スタック

- [Next.js](https://nextjs.org) 16
- [React](https://react.dev) 19
- TypeScript
