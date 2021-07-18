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
		return pushMarks(
			{
				type: "code",
			},
			section.tokens
		);
	},
	space: () => {
		return {
			type: "paragraph"
		}
	},
	hr: () => {
		return {
			type: "horizontalLine"
		}
	},
	link: () => {

	},
	list: (section) => {
		return {
			type: section.ordered?"orderedList":"bulletList",
			attrs: {
				start: section.start
			},
			content: convertSubSectionArray(section.items)
		}
	},
	list_item: (section) => {
		let tokens = section.tokens
		section.tokens = null;
		return {
			type: "listItem",
			content: [{
				type: "paragraph",
				content: convertSubSectionArray(tokens)
			}]
		}
	}
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
	console.log(section)
	console.log(section.type);
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

export function convertFromMarkdown(markdown) {
	const res = {
		type: "doc",
		content: [],
	};
	res.content = convertSubSectionArray(new marked.Lexer().lex(markdown));
	console.log(res);
	return res;
}
