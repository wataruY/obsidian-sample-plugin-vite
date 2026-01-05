set dotenv-load

# Extract plugin ID from manifest.json
ID := `cat manifest.json | jq -r '.id'`

build:
  bun run build

# install plugin with .hotreload(hot-reload plugin)
install: build
  #!/usr/bin/bash
  if [[ -z "$INSTALL_PATH" ]]; then
    echo "Error: INSTALL_PATH environment variable is not set"
    exit 1
  fi

  DIST=$INSTALL_PATH/.obsidian/plugins/{{ID}}
  echo "Installing to: $DIST"

  if [[ ! -d "$DIST" ]]; then
    mkdir -p "$DIST"
    echo "Created directory: $DIST"
  fi

  cp -r build/* "$DIST/"
  cp styles.css "$DIST/"
  cp manifest.json "$DIST/"
  touch "$DIST/.hotreload"
  echo "Installation complete"

# uninstall from vault
uninstall:
  #!/usr/bin/bash
  if [[ -z "$INSTALL_PATH" ]]; then
    echo "Error: INSTALL_PATH environment variable is not set"
    exit 1
  fi

  DIST=$INSTALL_PATH/.obsidian/plugins/{{ID}}

  # Validate directory is really a plugin-dir (check for manifest.json and main.js/main.cjs)
  if [[ ! -f "$DIST/manifest.json" ]]; then
    echo "Error: $DIST does not appear to be a valid plugin directory (missing manifest.json)"
    exit 1
  fi

  if [[ ! -f "$DIST/main.js" && ! -f "$DIST/main.cjs" ]]; then
    echo "Error: $DIST does not appear to be a valid plugin directory (missing main.js or main.cjs)"
    exit 1
  fi

  # Prompt user for confirmation with folder information
  echo "About to delete plugin directory:"
  echo "  Path: $DIST"
  du -sh "$DIST" 2>/dev/null && echo "  Size: $(du -sh "$DIST" 2>/dev/null | cut -f1)"
  echo ""
  read -p "Are you sure you want to delete this folder? (yes/no): " confirmation

  if [[ "$confirmation" != "yes" ]]; then
    echo "Deletion cancelled"
    exit 0
  fi

  # delete!!!
  rm -rf "$DIST"
  echo "Plugin uninstalled successfully"

# hot reload dev
watch: build
  watchexec --no-vcs-ignore --exts "ts,tsx,js,tsx,json,css" -F .watch just install
