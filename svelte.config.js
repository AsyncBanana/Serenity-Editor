import preprocess from "svelte-preprocess";
import adapterStatic from "@sveltejs/adapter-static";
import { defineConfig as defineViteConfig } from "vite";
import WindiCSS from "vite-plugin-windicss";
import { VitePWA } from 'vite-plugin-pwa'
import visualizer from "rollup-plugin-visualizer";
/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: preprocess({
		preserve: ["module"],
	}),
	kit: {
		adapter: adapterStatic(),
		vite: () => {
			return defineViteConfig({
				plugins: [WindiCSS.default(), visualizer.default(),VitePWA()],
			})
		}
	}
}
