const _defaultTypeNames = {
	doc: 0,
	heading1: 1,
	heading2: 2,
	heading3: 3,
	heading4: 4,
	heading5: 5,
	heading6: 6,
	text: 7,
	paragraph: 8,
	image: 9,
	taskList: 10,
	taskItem: 11,
	table: 12,
	tableRow: 13,
	tableCell: 14,
	codeBlock: 15,
	bulletList: 16,
	orderedList: 17,
	hardBreak: 18,
	horizontalRule: 19,
	blockQuote: 20,
	emoji: 21,
	hashTag: 22,
	mention: 23,
	listItem: 24,
};
const _defaultMarkNames = {
	bold: 0,
	italic: 1,
	code: 2,
	highlight: 3,
	link: 4,
	strike: 5,
	subscript: 6,
	superscript: 7,
	textstyle: 8,
	underline: 9,
};
/*
const _propertyNames = {
	type: "a",
	text: "b",
	content: "c",
	marks: "d"
}; */
export function Compress(obj) {
	const newObj = { a: 0, d: obj.marks, e: obj.attrs, b: obj.text };
	// use type enum
	// heading size opt
	if (obj.type === "heading" && obj.attrs?.level) {
		newObj.a = _defaultTypeNames[`heading${obj.attrs.level}`];
		newObj.e.level = undefined;
	} else {
		if (_defaultTypeNames[obj.type] === undefined) {
			throw new Error(
				`No type enum for element with type ${obj.type}. Please add this the custom element type dictionary, or file an issue if you think ${obj.type} should be included in the default dictionary`
			);
		}
		newObj.a = _defaultTypeNames[obj.type];
	}
	// use mark enum
	for (const mark in obj.marks) {
		if (_defaultMarkNames[obj.marks[mark].type] === undefined) {
			throw new Error(
				`No type enum for mark with type ${obj.marks[mark].type}. Please add this the custom mark type dictionary, or file an issue if you think ${obj.marks[mark].type} should be included in the default dictionary`
			);
		}
		newObj.d[mark].type = _defaultMarkNames[obj.marks[mark].type];
	}
	if (obj.content) {
		newObj.c = [];
		for (const child in obj.content) {
			newObj.c[child] = Compress(obj.content[child]);
		}
	}
	return newObj;
}
export function Decompress(obj) {
	const newObj = { type: "" };
	if (obj.d) {
		newObj.marks = obj.d;
	}
	if (obj.e) {
		newObj.attrs = obj.e;
	}
	if (obj.b) {
		newObj.text = obj.b;
	}
	// use type enum
	if (this.typeNumbers[obj.a] === undefined) {
		throw new Error(
			`No type enum for element with type ${obj.a}. Please add this the custom element type dictionary, or file an issue if you think ${obj.a} should be included in the default dictionary`
		);
	}
	newObj.type = this.typeNumbers[obj.a];
	// heading size opt
	if (newObj.type.startsWith("heading")) {
		newObj.attrs.level = parseInt(newObj.type.split("g").pop());
		newObj.type = "heading";
	}
	// optimize content
	if (obj.c) {
		newObj.content = obj.c;
		for (const child in obj.c) {
			newObj.content[child] = Decompress(obj.c[child]);
		}
	}
	// use mark enum
	for (const mark in obj.d) {
		if (this.markNumbers[obj.d[mark].type] === undefined) {
			throw new Error(
				`No type enum for mark with type ${obj.d[mark].type}. Please add this the custom mark type dictionary, or file an issue if you think ${obj.d[mark].type} should be included in the default dictionary`
			);
		}
		newObj.marks[mark].type = this.markNumbers[obj.d[mark].type];
	}
	return newObj;
}
