---
created: 2026-01-13 10:30:00
status: completed
tags:
  - AI/Generated/ClaudeCode
  - React/Components
  - TypeScript
  - Fuzzy-Matching
  - State-Management
  - DOM-Refs
model: claude-haiku-4-5-20251001
related:
  - "[[2026-01-13_tagslist-keyboard-navigation]]"
---

# TagsList Implementation - Technical Details

## 概要

TagsListコンポーネントの実装パターン、アーキテクチャの決定、およびメンテナンス観点での重要な制約を記録。キーボードナビゲーションはUXノート参照。

- 目的: fuzzy matchベースのオートコンプリート＋複数選択UI実装
- 結果: 成功 - React hook + DOM ref 管理パターン確立

## コンポーネント設計

### Props インターフェース

```typescript
interface TagsListProps {
  tags: string[]           // 補完対象の候補リスト（親から与える）
  setSelectedTags(selected: string[]): void  // 選択確定時のコールバック
}
```

> [!Info]
> Props のデフォルト値を設定し、単体テスト時のコンポーネント生成を簡略化。`TagsList()` で即座に使用可能

### State 構成

| State | 型 | 役割 | 初期値 |
|-------|-----|------|--------|
| `inputValue` | `string` | 現在の入力値 | `''` |
| `selectedTags` | `string[]` | 確定済みタグ配列 | `[]` |
| `filteredTags` | `string[]` | fuzzy match結果 | `[]` |
| `highlightedIndex` | `number` | 現在ハイライト中のサジェスト位置 | `0` |
| `showSuggestions` | `boolean` | ドロップダウン表示フラグ | `false` |
| `focusedBadgeIndex` | `number \| null` | キーボード選択中のバッジ位置 | `null` |

> [!Important]
> `focusedBadgeIndex` と `highlightedIndex` は異なる目的の state
>
> - `highlightedIndex`: マウスホバー / キーボード上下移動のドロップダウン内指定位置
> - `focusedBadgeIndex`: キーボード操作中に実際にフォーカスを受けたバッジ（クリック非関与）

### Ref 管理

```typescript
const inputRef = useRef<HTMLInputElement>(null)
const suggestionsRef = useRef<HTMLDivElement>(null)
const badgeRefs = useRef<(HTMLSpanElement | null)[]>([])
```

> [!Attention]
> `badgeRefs` は配列。selectedTags と sync を取るため useEffect でサイズ管理が必須
>
> ```typescript
> useEffect(() => {
>   badgeRefs.current = badgeRefs.current.slice(0, selectedTags.length)
> }, [selectedTags])
> ```
>
> これなしだと、タグ削除時に stale ref が残り、後続のキーボードナビゲーションでインデックス不一致バグが発生

## Fuzzy Match アルゴリズム

### 実装

```typescript showLineNumbers
const fuzzyMatch = (query: string, target: string): boolean => {
  if (!query) return true

  const lowerQuery = query.toLowerCase()
  const lowerTarget = target.toLowerCase()

  let queryIndex = 0
  for (let i = 0; i < lowerTarget.length && queryIndex < lowerQuery.length; i++) {
    if (lowerTarget[i] === lowerQuery[queryIndex]) {
      queryIndex++
    }
  }

  return queryIndex === lowerQuery.length
}
```

### アルゴリズム特性

- **モデル**: subsequence matching
- **複雑度**: O(n) per match (n = target.length)
- **特徴**:
    - 大文字小文字区別なし
    - 連続する必要なし（`dt` は `Docker` にマッチ）
    - スコアリングなし（候補の優先度付けなし）

> [!Warning]
> 同じ query に対して複数マッチする候補が同じ位置に並ぶ。スコアリング（先頭マッチを優先など）実装しないと、候補順が不規則に見える可能性
>
> **改善案**: query の各文字が target に何番目で現れるかの "スパン" を計測し、スパンが短い（=連続に近い）順に候補をソート

### フィルタリング流れ

```typescript
useEffect(() => {
  if (inputValue) {
    const filtered = props.tags.filter(tag =>
      !selectedTags.includes(tag) && fuzzyMatch(inputValue, tag)
    )
    setFilteredTags(filtered)
    setHighlightedIndex(0)
    setShowSuggestions(filtered.length > 0)
  } else {
    setFilteredTags([])
    setShowSuggestions(false)
  }
}, [inputValue, props.tags, selectedTags])
```

> [!Tip]
> 依存配列に `[inputValue, props.tags, selectedTags]` を指定。親から tags が更新されるか、selectedTags が変わる（重複排除が必要）たびに再計算

## ドロップダウン表示制御

### 表示条件

```typescript
showSuggestions && filteredTags.length > 0
```

- `showSuggestions` が true かつ
- `filteredTags` が空でない場合のみドロップダウン描画

### 表示 / 非表示トリガー

| イベント | 動作 |
|---------|------|
| `inputValue` 変更 + match有り | ドロップダウン表示 |
| `inputValue` 空 | ドロップダウン非表示 |
| `onFocus` (input) | 前回のフォーカスから値が変わっていれば復表示 |
| `onBlur` (input) | 200ms 後に非表示 |

> [!Info]
> `onBlur` に 200ms delay を設ける理由: クリック選択時に blur → click event の順番が未定義。遅延により click handler が先に実行される確率が高まる
>
> この処理パターンはHTML select element の実装でも採用される古典的パターン

## サジェスト選択フロー

### クリック選択

```typescript
<div onClick={() => selectTag(tag)}>
```

### キーボード選択（Enter）

```typescript
case 'Enter':
  e.preventDefault()
  if (filteredTags[highlightedIndex]) {
    selectTag(filteredTags[highlightedIndex])
  }
```

### selectTag 関数

```typescript
const selectTag = (tag: string) => {
  const newSelected = [...selectedTags, tag]
  setSelectedTags(newSelected)           // 内部 state 更新
  props.setSelectedTags(newSelected)    // 親へ通知
  setInputValue('')                      // 入力リセット
  setShowSuggestions(false)              // ドロップダウン閉じる
  inputRef.current?.focus()              // 次のタグ入力へ即座に遷移
}
```

> [!Success]
> 選択後の自動フォーカス復帰により、ユーザーはリズム良く複数タグを連続入力可能

## バッジ（選択済みタグ）の管理

### 削除（removeTag）

```typescript
const removeTag = (tagToRemove: string) => {
  const newSelected = selectedTags.filter(tag => tag !== tagToRemove)
  setSelectedTags(newSelected)
  props.setSelectedTags(newSelected)
  setFocusedBadgeIndex(null)
}
```

> [!Attention]
> `focusedBadgeIndex` を null にリセット。存在しないバッジへのフォーカスアクセス防止

### クリック削除

```tsx
<Badge
  onClick={() => removeTag(tag)}
  ...
>
```

### キーボード削除

削除キー: `Enter`, `Space`（詳細は [[2026-01-13_tagslist-keyboard-navigation]] 参照）

### バッジの視覚的フォーカス

```tsx
className={`... ${
  focusedBadgeIndex === index ? 'ring-2 ring-ring' : ''
}`}
```

- Tailwind の `ring-2 ring-ring` で focus 状態を outline 表示
- style.css に custom CSS variables 定義必須

## スクロール自動化

### ハイライト要素の view into view

```typescript
useEffect(() => {
  if (suggestionsRef.current && showSuggestions) {
    const highlightedElement = suggestionsRef.current.children[highlightedIndex] as HTMLElement
    if (highlightedElement) {
      highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }
}, [highlightedIndex, showSuggestions])
```

> [!Tip]
> `block: 'nearest'` により、既に view 内なら scroll 不要。下端超過なら下スクロール、上端超過なら上スクロール
>
> `behavior: 'smooth'` でアニメーション表示（体感的に UI が応答している感覚向上）

- 依存配列: `[highlightedIndex, showSuggestions]`

## Input フィールド の CSS

```css
className="flex-1 min-w-[120px] outline-none bg-transparent"
```

- `flex-1`: 親 flex 内で残り空間を埋める
- `min-w-[120px]`: 最小幅確保（ユーザーが文字入力可能な視認領域）
- `outline-none`: デフォルト outline を消す（親の focus-within:ring で管理）
- `bg-transparent`: 親の背景色に統一

## ドロップダウン配置

```tsx
className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
```

> [!Info]
>
> - `absolute z-50`: 親相対位置で最前面配置
> - `w-full`: 親（input + badges コンテナ）と幅揃え
> - `mt-1`: input のすぐ下に配置
> - `max-h-60`: 過度な高さ防止、overflow で scroll 対応
> - `bg-popover text-popover-foreground`: tailwind/shadcn の semantic color 使用

## 親コンポーネント との契約

### 入力値変更への反応性

> [!Attention]
> `props.tags` が変わると filter が再計算される。親が tags 配列を mutation する（同一参照で内容だけ変更）と反応しない
>
> **ベストプラクティス**: 常に新しい配列参照を渡す
>
> ```typescript
> // ❌ NG
> const tags = [...]
> tags.push(newTag)
> setTags(tags)
>
> // ✅ OK
> setTags([...tags, newTag])
> ```

### onBlur イベント遅延の影響

`onBlur` で 200ms setTimeout を使用：

```typescript
onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
```

> [!Warning]
> 非同期遅延により、blur event から suggestions 非表示までのタイムラグが発生。親が blur 直後に input value を読み取る場合、ドロップダウンの状態不一致が起きる可能性
>
> **対策**: suggestions state ではなく selected tags state を単一の真実の源として親が扱う

## 今後のメンテナンス観点

### 拡張性

- **複数候補スコアリング**: fuzzyMatch に priority score 実装可能（複雑度増加）
- **カスタマイズ可能な match ロジック**: props 経由で match 関数を外部注入可能
- **ハイライト色のカスタマイズ**: className を props 化

### パフォーマンス

現在の実装は tags 数 < 1000 程度なら問題なし。それ以上の場合：

- fuzzyMatch を Web Worker へ移行（並列計算）
- 仮想スクロール導入（max-h-60 の代わり）
- debounce 追加（inputValue 変更時の filter 計算遅延）

### テスト

- fuzzyMatch unit test
- state 遷移 (input → filtered → selection)
- keyboard navigation (各 key code のシーケンス)
- ref sync (selectedTags 変更時の badgeRefs 整合性)

## 設計判断の根拠

| 決定 | 理由 |
|------|------|
| Fuzzy match のみ（regex 非使用） | 単純性 + パフォーマンス。複雑な検索は後で追加可能 |
| `focusedBadgeIndex` 明示的管理 |複数フォーカスターゲット間のstate一貫性を state で管理することで保守性向上 |
| `onBlur` の 200ms delay | blur と click event の race condition 回避。UI framework では標準パターン |
| `badgeRefs` 配列の useEffect sync | React strict mode や SSR 対応、ref 不一致バグ防止 |
| Tailwind semantic colors 使用 | shadcn/ui との統一、ダークモード自動対応 |

## 関連ファイル

- `/src/tags-list.tsx`: コンポーネント本体
- `/styles.css`: ring focus style 定義
- `/components.json`: shadcn/ui Badge コンポーネント設定
