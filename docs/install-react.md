---
created: 2026-01-12 00:00:00
tags:
  - AI/Generated/ClaudeCode
  - Obsidian/Plugin
  - React
  - TypeScript
model: claude-haiku-4-5-20251001
related:
  - "[[Obsidian Plugin Development]]"
---

# Obsidian プラグインへの React 導入

Obsidian プラグイン開発に React を統合する手順と設定方法。

## 依存パッケージの追加

package.json に以下を追加：

```json {3-7}
"dependencies": {
  "obsidian": "latest",
  "@types/react": "^19.2.8",
  "@types/react-dom": "^19.2.3",
  "react": "^19.2.3",
  "react-dom": "^19.2.3"
}
```

> [!IMPORTANT]
> `@types/react` と `@types/react-dom` は TypeScript の型安全性のために必須

## TypeScript 設定

tsconfig.json に JSX サポートを追加：

```json {16}
{
  "compilerOptions": {
    "jsx": "react",
    "lib": ["DOM", "ES5", "ES6", "ES7"],
    "paths": {
      "*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts"]
}
```

> [!Important]
> `"jsx": "react"` 設定により TypeScript が `.tsx` ファイルを正しくコンパイル

## Modal クラスで React コンポーネントをレンダリング

Modal 内で React コンポーネントを使用する場合：

```typescript title="src/modal.ts"
import { App, Modal } from 'obsidian';
import { createRoot } from 'react-dom/client';
import { Foo } from './components/Foo';
import { createElement } from 'react';

export class ExampleModal extends Modal {
  constructor(app: App) {
    super(app);
    const root = createRoot(this.contentEl);
    root.render(createElement(Foo, { initialValue: 10 } as any));
  }
}
```

> [!Info]
> `createRoot` により React アプリケーションを Modal の DOM ノードにマウント

## React コンポーネントの作成

`.tsx` ファイルで React コンポーネントを定義：

```typescript title="src/components/Foo.tsx"
import React, { FC, useState } from "react";

export const Foo: FC = (_props: { initialValue: number | null }) => {
  const [index, setIndex] = useState(_props.initialValue ?? 0);
  return (
    <button onClick={() => { setIndex(index + 1) }}>
      <h1>Count: {index}</h1>
    </button>
  );
};
```

> [!Success]
> Hooks（`useState`）による状態管理が使用可能

## プラグイン主ファイルでの統合

src/main.ts でコマンドを追加して Modal を呼び出し：

```typescript title="src/main.ts" ins={2,3,9-16}
import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, MyPluginSettings, SampleSettingTab } from "./settings";
import { ExampleModal } from "./modal";

export default class MyPlugin extends Plugin {
  onload() {
    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.addCommand({
      id: 'display-modal',
      name: 'Display Modal',
      callback: () => {
        new ExampleModal(this.app).open();
      },
    });
  }
}
```

> [!Info]
> `addCommand` でユーザーがコマンドパレットからモーダルを開けるようになる

## ビルド設定

vite.config.ts は既存設定を維持。エクスターナル依存は不要：

- `react` と `react-dom` は bundled として含まれる
- Obsidian の CodeMirror/Electron モジュールは external

> [!Warning]
> vite.config.ts の `external` に React ライブラリを追加しない。これらはプラグイン内で使用されるため bundled すること

## ポイント

- `createRoot` + `createElement` でコンポーネントをレンダリング
- Modal の `this.contentEl` が React マウント対象
- `as any` で型チェックを一時的に回避することで柔軟性確保
- `.tsx` ファイルと `jsx: "react"` 設定で JSX 構文が有効になる
