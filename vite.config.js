import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import WindiCSS from "vite-plugin-windicss";
import {resolve} from "path";
import visualizer from "rollup-plugin-visualizer";
// https://vitejs.dev/config/
export default ({ command, mode }) => {
  return defineConfig({
    plugins: [svelte(), WindiCSS.default(), visualizer.default()],
    resolve: {
      alias: {
        fileDialog: resolve(
          process.cwd(),
          "src",
          "components",
          "fileDialog",
          mode === "tauri" ? "tauri" : "web"
        ),
      },
    },
    build: {
      outDir: mode === "tauri" ? "dist" : "docs"
    }
  });
};
