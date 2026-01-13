Obsidian plugin development experiment project

## environment

- bun: javascript runtime
- vitest: unit & UI testing (jsdom environment)
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

### Testing

- jsdom: DOM environment for tests
- react testing-library: component testing utilities
  - user-event: human-like event simulation
- @testing-library/jest-dom: custom matchers

## Files

- `src/*`: typescript sources
    - input.css: tailwindcss-cli input file
    - output.css
    - `components/ui/*.tsx`: shadcn ui components
    - `*.test.tsx`: component tests (vitest)
    - test-setup.ts: jest-dom + polyfills for test environment
    - polyfills.ts: polyfill for obsidian mobile
    - theme-provider.tsx: light/dark theme provider for tailwindcss, shad/cn ui
    - settings.ts: obsidian plugin setting tab ui
- `components.json`: shad/cn ui components configuration file
- `manifest.json`: obsidian plugin manifest(name, plugin-id, author information, version, ...)
- `fleke.nix`: configuration for nix development
- styles.css: obsidian plugin ui design css, main
- `vite.config.ts`: configuration for vite
- `vitest.config.ts`: vitest configuration (jsdom + React plugin)

## Task

- build: `just build`
- build(with debug information): `just build-debug`
- test: `bun run test` (runs vitest)
- test watch: `bun run test --watch`
- check: `bun run check`
