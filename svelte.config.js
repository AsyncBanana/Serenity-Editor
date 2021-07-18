import preprocess from "svelte-preprocess";
import adapterStatic from "@sveltejs/adapter-static";
import { defineConfig as defineViteConfig } from "vite";
import WindiCSS from "vite-plugin-windicss";
import { VitePWA } from "vite-plugin-pwa";
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
				plugins: [
					WindiCSS.default(),
					visualizer.default(),
					VitePWA({
						manifest: {
							dir: "ltr",
							lang: "en",
							name: "Serenity Editor",
							short_name: "Serenity Editor",
							display: "standalone",
							background_color: "#3d4451",
							theme_color: "#5711f8",
							scope: "/Editor",
							start_url: "/Editor",
							description: "The lightest rich text editor you have ever seen",
							orientation: "any",
							related_applications: [],
							prefer_related_applications: false,
							icons: [
								{
									src: "/favicon.ico",
									sizes: "32x32",
								},
								{
									src: "/serenity-logo.png",
									sizes: "512x512",
								},
							],
							screenshots: [],
							categories: ["productivity", "utilities", "editing"],
						},
					}),
				],
			});
		},
	},
};
