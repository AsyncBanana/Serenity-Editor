const markHandlers = {
	bold: (text) => `**${text}**`,
	italic: (text) => `*${text}*`,
	strike: (text) => `~~${text}~~`,
	code: (text) => `\`${text}\``,
	link: (text, attrs) => `[${text}](${attrs.href})`,
};
const typeHandlers = {
	paragraph: {
		gen: (obj) => {
			return convertSubSectionArray(obj.content);
		},
		inline: false,
	},
	text: {
		gen: (text) => {
			if (text.marks) {
				let spacesStart = text.text.length - text.text.trimStart().length;
				let spacesEnd = text.text.length - text.text.trimStart().length;
				text.text = text.text.trim();
				text.marks.forEach(
					(mark) => (text.text = markHandlers[mark.type](text.text, mark.attrs))
				);
				text.text = `${" ".repeat(spacesStart)}${text.text}${" ".repeat(
					spacesEnd
				)}`;
			}
			return text.text;
		},
		inline: true,
	},
	codeBlock: {
		gen: (obj) => {
			return `\`\`\`${obj.attrs?.language || ""}\n ${convertSubSectionArray(
				obj.content
			)} \n \`\`\``;
		},
		inline: false,
	},
	heading: {
		gen: (obj) => {
			return `${"#".repeat(obj.attrs.level)} ${convertSubSectionArray(
				obj.content
			)}`;
		},
		inline: false,
	},
	image: {
		gen: (obj) => {
			return `![${obj.attrs.alt || ""}](${obj.attrs.src}${
				obj.attrs.title ? ` "${obj.attrs.title}"` : ""
			})`;
		},
		inline: false,
	},
	horizontalRule: {
		gen: () => {
			return `---`;
		},
		inline: false,
	},
	orderedList: {
		gen: (obj) => {
			let result = "";
			let listNumber = obj.attrs.start;
			obj.content.forEach((element) => {
				result += `${listNumber}. ${convertSubSection(element)}`;
				listNumber++;
			});
			return result;
		},
		inline: false,
	},
	bulletList: {
		gen: (obj) => {
			let result = "";
			obj.content.forEach((element) => {
				result += `- ${convertSubSection(element)}`;
			});
			return result;
		},
		inline: false,
	},
	listItem: {
		gen: (obj) => {
			return convertSubSectionArray(obj.content);
		},
		inline: true,
	},
	blockQuote: {
		gen: (obj) => {
			return `> ${convertSubSection(obj.content)}`;
		},
	},
};

function convertSubSection(section) {
	return `${typeHandlers[section.type].gen(section)}${
		typeHandlers[section.type].inline ? "" : "\n\n"
	}`;
}
function convertSubSectionArray(sectionArray) {
	if (!sectionArray) {
		return "";
	}
	let result = "";
	sectionArray.forEach((element) => {
		result += convertSubSection(element);
	});
	return result;
}

/**
 * Converts a ProseMirror JSON document
 * @param {Object} doc The ProseMirror JSON document
 * @returns {String} markdown
 */
export default function convertToMarkdown(doc) {
	if (doc.type !== "doc" || !doc.content) {
		throw new Error("Invalid JSON");
	}
	return convertSubSectionArray(doc.content).trimEnd();
}
