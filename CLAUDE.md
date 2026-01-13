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

## Task

- build: `just build`
- test: `bun test`
- check: `bun run check`
