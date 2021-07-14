import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import WindiCSS from "vite-plugin-windicss";
import {resolve} from "path";
import { VitePWA } from 'vite-plugin-pwa'
import visualizer from "rollup-plugin-visualizer";
// https://vitejs.dev/config/

export default ({ command, mode }) => {
  return defineConfig({
    plugins: [svelte(), WindiCSS.default(), visualizer.default(),VitePWA()],
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
  });
};
