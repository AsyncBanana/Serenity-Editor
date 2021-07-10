import { saveAs } from "file-saver";
import { Options } from "svelte-preprocess/dist/types";
/**
 * Reads a file
 * @param {Object} Options
 * @returns {Promise<FileList|File>}
 */
export function readFile(options = {}) {
	const input = document.createElement("input");
	input.setAttribute("type", "file");
	if (options.multiple) {
		input.setAttribute("multiple", "");
	}
	if (options.fileTypes) {
		options.fileTypes[0] = "." + options.fileTypes[0];
		input.setAttribute("accept", options.fileTypes.join(", ."));
	}
	return new Promise((resolve, reject) => {
		input.addEventListener("change", () => {
			const files = input.files;
			input.remove();
			if (!files) {
				reject("No files specified");
			} else {
				if (options.multiple) {
					resolve(files);
				} else {
					resolve(files[0]);
				}
			}
		});
		input.click();
	});
}
export function saveFile(text, options = {}) {
	saveAs(new Blob([text]), options.name);
}
