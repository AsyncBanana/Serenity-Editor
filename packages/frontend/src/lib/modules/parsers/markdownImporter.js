import marked from "marked";

const typeHandlers = {
	text: (section) => {
		return {
			type: "text",
			text: section.text,
		};
	},
	code: (section) => {
		return {
			type: "codeBlock",
			attrs: {
				lang: section.lang,
			},
			content: [
				{
					type: "text",
					text: section.text,
				},
			],
		};
	},
	heading: (section) => {
		return {
			type: "heading",
			attrs: {
				level: section.depth,
			},
		};
	},
	paragraph: () => {
		return {
			type: "paragraph",
		};
	},
	strong: (section) => {
		return pushMarks(
			{
				type: "bold",
			},
			section.tokens
		);
	},
	em: (section) => {
		return pushMarks(
			{
				type: "italic",
			},
			section.tokens
		);
	},
	del: (section) => {
		return pushMarks(
			{
				type: "strike",
			},
			section.tokens
		);
	},
	codespan: (section) => {
		console.log("codespan");
		return {
			type: "text",
			marks: [
				{
					type: "code",
				},
			],
			text: section.text,
		};
	},
	space: () => {
		return {
			type: "paragraph",
		};
	},
	hr: () => {
		return {
			type: "horizontalLine",
		};
	},
	link: (section) => {
		const tokens = section.tokens;
		section.tokens = null;
		return {
			type: "text",
			marks: [
				{
					type: "link",
					attrs: {
						href: section.href,
					},
				},
			],
			text: tokens[0].text,
		};
	},
	list: (section) => {
		return {
			type: section.ordered ? "orderedList" : "bulletList",
			attrs: {
				start: section.start,
			},
			content: convertSubSectionArray(section.items),
		};
	},
	list_item: (section) => {
		let tokens = section.tokens;
		section.tokens = null;
		return {
			type: "listItem",
			content: [
				{
					type: "paragraph",
					content: convertSubSectionArray(tokens[0].tokens),
				},
			],
		};
	},
	image: (section) => {
		return {
			type: "image",
			attrs: {
				src: section.href,
				alt: section.text,
				title: section.title,
			},
		};
	},
};
function pushMarks(mark, content) {
	let result = [];
	content.forEach((item) => {
		item = convertSubSection(item);
		if (item[0]) {
			item.forEach((el) => {
				el.marks = el.marks || [];
				el.marks.push(mark);
				result.push(el);
			});
		} else {
			item.marks = item.marks || [];
			item.marks.push(mark);
			result.push(item);
		}
	});
	return result;
}
function convertSubSection(section) {
	let res = typeHandlers[section.type](section);
	if (res[0]) {
		res.forEach((item, index) => {
			res[index].content = item.content || [];
			if (item.tokens) {
				res[index].content = convertSubSectionArray(section.tokens);
			}
		});
	} else {
		res.content = res.content || [];
		if (section.tokens) {
			res.content = convertSubSectionArray(section.tokens);
		}
	}
	return res;
}
function convertSubSectionArray(sectionArray) {
	if (!sectionArray) {
		return null;
	}
	let result = [];
	sectionArray.forEach((element) => {
		let subSection = convertSubSection(element);
		if (subSection[0]) {
			result.push(...subSection);
		} else {
			result.push(subSection);
		}
	});
	return result;
}
/**
 * Converts a markdown string to a ProseMirror JSON document
 * @param {String} markdown Markdown string
 * @param {Boolean} docWrapper Whether to wrap the JSON in a document
 * @returns {Object} ProseMirror JSON
 */
export default function convertFromMarkdown(markdown, docWrapper = true) {
	if (docWrapper) {
		const res = {
			type: "doc",
			content: [],
		};
		res.content = convertSubSectionArray(new marked.Lexer().lex(markdown));
		return res;
	} else {
		return convertSubSectionArray(new marked.Lexer().lex(markdown));
	}
}
