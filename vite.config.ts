import { UserConfig, defineConfig } from "vite";
import path from "path";
import builtins from "builtin-modules";

export default defineConfig(({ mode }) => {
  const resolve = path.resolve;
  const prod = mode === "production";

  return {
    plugins: [],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "es2018",
      lib: {
        entry: resolve(__dirname, "src/main.ts"),
        name: "main",
        fileName: () => "main.js",
        formats: ["cjs"],
      },
      minify: prod,
      sourcemap: prod ? false : "inline",
      cssCodeSplit: false,
      emptyOutDir: false,
      outDir: "build",
      rolldownOptions: {
        input: {
          main: resolve(__dirname, "src/main.ts"),
        },
        output: {
          entryFileNames: "main.js",
          assetFileNames: "styles.css",
        },
        treeshake: true,
        external: [
          "obsidian",
          "electron",
          "@codemirror/autocomplete",
          "@codemirror/collab",
          "@codemirror/commands",
          "@codemirror/language",
          "@codemirror/lint",
          "@codemirror/search",
          "@codemirror/state",
          "@codemirror/view",
          "@lezer/common",
          "@lezer/highlight",
          "@lezer/lr",
          ...builtins,
        ],
      },
    },
  } as UserConfig;
});
