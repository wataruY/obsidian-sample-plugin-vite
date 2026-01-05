# Obsidian plugin template

## Features

- bun: javascript runtime
- vite(rolldown): bundler
- oxlint: linter
- nix flake
- treefmt: formatter
- prek: pre-commit hook
- just: task runner

## Contents(project specific)

- .env.sample: .env example
- .watch: watchexec chase directories

## Prepare to Develop

- Modify ./manifest.json
- Rename MyPlugin, MyPluginSettings to appropriate names
- Setting up INSTALL_PATH to your test vault root in .env
- Check setup by `just prepare` (TODO: check correctly setup development environment, and bun install)

## Build

- build: `just build`
- install: `just install`
- auto install along modification(for debug): `just watch`
