## Sahdcnを入れる

- [ ] Installing Tailwind CSS
    - [ ] Install tailwind CLI
    - [ ] import tailwind in css
    - [ ] Build CSS using tailwind cli
    - [ ] Using tailwind outputted CSS in module
- [ ] Add dependencies
- [ ] configure tsconfig.json to add paths
- [ ] Add src/styles/globals.css
- [ ] Add cn helper
- [ ] create components.json

## component.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/input.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
```

> [!WARNING]
> `*/lib/components`というサンプルがあるがこれは間違
> `src/*/components`以下にコンポーネントがダウンロードされてしまう
