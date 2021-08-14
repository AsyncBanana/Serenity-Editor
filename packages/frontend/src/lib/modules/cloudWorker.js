import {
	Compress as CompressClass,
	Decompress as DecompressClass,
} from "tiptap-compression";
global = {};
const Compress = new CompressClass().Compress();
const Decompress = new DecompressClass().Compress();
onmessage = function (event) {
	console.log("test");
	console.log(Compress(event.data));
};
