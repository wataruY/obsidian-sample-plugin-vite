import { UserConfig, defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite"
import builtins from "builtin-modules";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const resolve = path.resolve;
  const prod = mode === "production";

  return {
    plugins: [
      react({
        jsxRuntime: "classic",
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "es2020",
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
        define: {
          "process.env.NODE_ENV": JSON.stringify(prod ? "production" : "development"),
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
