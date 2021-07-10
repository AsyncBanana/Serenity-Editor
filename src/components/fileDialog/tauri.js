import { open, save } from "@tauri-apps/api/dialog";
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
export async function readFile(options = {}) {
	const filePath = await open({
		multiple: options.multiple,
		filters: [
			{ name: options.fileTypes.join(", ."), extensions: options.fileTypes },
		],
	});
	const file = await readTextFile(filePath);
	return new File([file], filePath);
}
export async function saveFile(text) {
	const filePath = await save();
	await writeFile({ contents: text, path: filePath });
}
