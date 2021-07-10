import preprocess from "svelte-preprocess";

const config = {
	preprocess: preprocess({
		preserve: ["module"],
	}),
};

export default config;
