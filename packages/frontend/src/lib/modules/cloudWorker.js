import {
	Compress as CompressClass,
	Decompress as DecompressClass,
} from "tiptap-compression";
const Compress = new CompressClass({}).Compress;
const Decompress = new DecompressClass({}).Decompress;
onmessage = function (event) {
	console.log("test");
	console.log(Compress(event.data));
};
