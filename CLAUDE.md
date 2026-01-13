Obsidian plugin development experiment project

## environment

- bun: javascript runtime
    - `bun:test`: testing
- vite(rolldown): bundler
- oxlint: linter
- nix flake
- treefmt: formatter
- prek: pre-commit hook
- just: task runner

### Obsidian Plugin

- obsidian: plugin api
- react: UI framework
- tailwindcss: css
    - tailwind-cli: proprocessor
- shadcn/ui: UI

## Files

- `src/*`: typescript sources
    - input.css:  tailwindcss-cli input file
    - output.css
    - `components/ui/*.tsx`: shadcn ui components
    - polyfills.ts: polyfill for obsidian mobile
    - theme-provider.tsx: light/dark theme provider for tailwindcss, shad/cn ui
    - settings.ts: obsidian plugin setting tab ui
- `components.json`: shad/cn ui components configuration file
- `manifest.json`: obsidian plugin manifest(name, plugin-id, author information, version, ...)
- `fleke.nix`: configuration for nix development
- styles.css: obsidian plugin ui design css, main
- `vite.config.ts`: configuration for vite

## Task

- build: `just build`
- build(with debug information): `just build-debug`
- test: `bun test`
- check: `bun run check`
