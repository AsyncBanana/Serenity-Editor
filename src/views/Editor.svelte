<script type="module">
	// Other
	import { onMount, onDestroy } from "svelte";
	import { Editor } from "@tiptap/core";
	import NavDropdown from "../components/NavDropdown.svelte";
	import Modal from "../components/Modal.svelte";
	import Input from "../components/Input.svelte";
	import Welcome from "../components/welcome.js";
	import { readFile, saveFile } from "fileDialog";
	import { convertToMarkdown } from "../components/parsers/markdownExporter.js";
	// Nodes
	import Document from "@tiptap/extension-document";
	import Paragraph from "@tiptap/extension-paragraph";
	import Text from "@tiptap/extension-text";
	import Blockquote from "@tiptap/extension-blockquote";
	import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
	import lowlight from "../components/lowLightBuild.js";
	import Heading from "@tiptap/extension-heading";
	import Image from "@tiptap/extension-image";
	import BulletList from "@tiptap/extension-bullet-list";
	import OrderedList from "@tiptap/extension-ordered-list";
	import ListItem from "@tiptap/extension-list-item";
	import Table from "@tiptap/extension-table";
	import TableRow from "@tiptap/extension-table-row";
	import TableCell from "@tiptap/extension-table-cell";
	import TableHeader from "@tiptap/extension-table-header";
	import TaskList from "@tiptap/extension-task-list";
	import TaskItem from "@tiptap/extension-task-item";
	import HorizontalRule from "@tiptap/extension-horizontal-rule";
	// Marks
	import Bold from "@tiptap/extension-bold";
	import Code from "@tiptap/extension-code";
	import Italic from "@tiptap/extension-italic";
	import Link from "@tiptap/extension-link";
	import Strike from "@tiptap/extension-strike";
	// Extensions
	import BubbleMenu from "@tiptap/extension-bubble-menu";
	import FloatingMenu from "@tiptap/extension-floating-menu";
	import History from "@tiptap/extension-history";
	import DropCursor from "@tiptap/extension-dropcursor";
	import Typography from "@tiptap/extension-typography";
	import Placeholder from "@tiptap/extension-placeholder";
	let element;
	let editor;
	let modal = false;
	let imageUrl = "";
	// Settings
	let settings = {};
	let settingsDefaults = {
		Typography: true,
		NewlineMenu: true,
		PickUpFromExit: true,
	};
	let localStorageRes = JSON.parse(localStorage.getItem("Settings"));
	if (!localStorageRes) {
		settings = settingsDefaults;
	} else {
		settings = localStorageRes;
	}
	Object.entries(settingsDefaults).forEach(([key, value]) => {
		if (settings[key] === undefined || settings[key] === null) {
			settings[key] = value;
		}
	});
	function setSetting(name, value) {
		settings[name] = value;
		localStorage.setItem("Settings", JSON.stringify(settings));
		return value;
	}
	let savedText = "";
	if (settings.PickUpFromExit) {
		savedText = localStorage.getItem("Text");
	}
	// Editor
	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				Document,
				Paragraph,
				Text,
				Blockquote,
				CodeBlockLowlight.configure({
					lowlight: lowlight,
				}),
				Heading,
				Image,
				BulletList,
				OrderedList,
				ListItem,
				Table,
				TableRow,
				TableCell,
				TableHeader,
				TaskList,
				TaskItem,
				HorizontalRule,
				Bold,
				Code,
				Italic,
				Link,
				Strike,
				BubbleMenu.configure({
					element: document.querySelector("#bubble-menu"),
				}),
				FloatingMenu.configure({
					element: document.querySelector("#floating-menu"),
				}),
				History,
				DropCursor,
				settings.Typography === true ? Typography : null,
				Placeholder.configure({
					placeholder: "Write the next big thing...",
				}),
			],
			content: savedText ? savedText : "<h1></h1>",
			onTransaction: () => {
				editor = editor;
			},
		});
	});
	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
	addEventListener("visibilitychange", () => {
		localStorage.setItem("Text", editor.getHTML());
	});
	Welcome();
</script>

{#if editor}
	<div class="btn-group fixed top-3 z-40" id="topMenu">
		<NavDropdown
			first
			buttons={[
				{
					name: "Settings",
					click: () => {
						modal = "settings";
					},
				},
				{
					name: "Open File",
					click: async () => {
						try {
							const file = await readFile({
								fileTypes: ["txt", "html"],
							});
							editor.commands.setContent(await file.text());
						} catch (err) {
							console.log(`Error opening file: ${err}`);
						}
					},
				},
				{
					name: "Save File",
					click: () => {
						saveFile(editor.getHTML(), {
							name: "document.html",
						});
					},
				},
				{
					name: "Export as Markdown",
					click: () => {
						saveFile(convertToMarkdown(editor.getJSON()), {
							name: "document.md",
						});
					},
				},
				{
					name: "About",
					click: () => {
						modal = "about";
					},
				},
			]}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				aria-label="Menu"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
				/>
			</svg>
		</NavDropdown>
		<NavDropdown
			buttons={[
				{
					name: "Heading 1",
					click: () => {
						editor.chain().focus().toggleHeading({ level: 1 }).run();
					},
					active: editor.isActive("heading", { level: 1 }),
				},
				{
					name: "Heading 2",
					click: () => {
						editor.chain().focus().toggleHeading({ level: 2 }).run();
					},
					active: editor.isActive("heading", { level: 2 }),
				},
				{
					name: "Heading 3",
					click: () => {
						editor.chain().focus().toggleHeading({ level: 3 }).run();
					},
					active: editor.isActive("heading", { level: 3 }),
				},
			]}>Headings</NavDropdown
		>
		<button
			on:click={() => {
				modal = "image";
			}}
			class="btn">Add Image</button
		>
		<button
			on:click={() => editor.chain().focus().toggleBold().run()}
			class:btn-active={editor.isActive("bold")}
			class="btn"
		>
			<strong>Bold</strong>
		</button>
		<button
			on:click={() => editor.chain().focus().toggleItalic().run()}
			class:btn-active={editor.isActive("italic")}
			class="btn"
		>
			<i>Italic</i>
		</button>
		<button
			on:click={() => editor.chain().focus().toggleStrike().run()}
			class:btn-active={editor.isActive("strike")}
			class="btn"
		>
			<s>Strike</s>
		</button>
		<button
			on:click={() => editor.chain().focus().toggleCodeBlock().run()}
			class:btn-active={editor.isActive("codeBlock")}
			class="btn"
		>
			&lt;Code/&gt;
		</button>
		<button
			on:click={() => editor.chain().focus().setParagraph().run()}
			class:btn-active={editor.isActive("paragraph")}
			class="btn"
		>
			Plain
		</button>
	</div>
{/if}
<div class="btn-group m-auto" id="bubble-menu">
	<button
		class="btn"
		class:btn-active={editor ? editor.isActive("bold") : false}
		on:click={() => editor.chain().focus().toggleBold().run()}
		><strong>B</strong></button
	>
	<button
		class="btn"
		class:btn-active={editor ? editor.isActive("italic") : false}
		on:click={() => editor.chain().focus().toggleItalic().run()}
		><i>I</i></button
	>
	<button
		class="btn"
		class:btn-active={editor ? editor.isActive("strike") : false}
		on:click={() => editor.chain().focus().toggleStrike().run()}
		><s>S</s></button
	>
	<button
		class="btn"
		class:btn-active={editor ? editor.isActive("code") : false}
		on:click={() => editor.chain().focus().toggleCode().run()}>&lt;/&gt;</button
	>
</div>
<div class="btn-group" id="floating-menu">
	{#if settings.NewlineMenu}
		<button
			class="btn btn-sm"
			class:btn-active={editor
				? editor.isActive("heading", { level: 1 })
				: false}
			on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
			>Heading 1</button
		>
		<button
			class="btn btn-sm"
			class:btn-active={editor
				? editor.isActive("heading", { level: 2 })
				: false}
			on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
			>Heading 2</button
		>
		<button
			class="btn btn-sm"
			class:btn-active={editor ? editor.isActive("bulletList") : false}
			on:click={() => editor.chain().focus().toggleBulletList().run()}
			>Bullet List</button
		>
	{/if}
</div>
{#if modal}
	{#if modal === "image"}
		<Modal exit={() => (modal = false)}>
			<span slot="body"
				><h1 class="font-bold text-xl">Insert Image</h1>
				<Input
					bind:value={imageUrl}
					name="ImgUrlInput"
					placeholder="Enter image url here"
					bordered={true}
					validate={(value) =>
						value.length === 0 ||
						/http(s)?:\/\/w{0,3}\w*?\.(\w*?\.)?\w{2,3}\S*|www\.(\w*?\.)?\w*?\.\w{2,3}\S*|(\w*?\.)?\w*?\.\w{2,3}[\/\?]\S*/.test(
							value
						)}
				/>
			</span>
			<span slot="actions">
				<button
					class="btn btn-outline"
					on:click={() => {
						modal = false;
					}}>Cancel</button
				>
				<button
					class="btn"
					on:click={() => {
						if (
							/http(s)?:\/\/w{0,3}\w*?\.(\w*?\.)?\w{2,3}\S*|www\.(\w*?\.)?\w*?\.\w{2,3}\S*|(\w*?\.)?\w*?\.\w{2,3}[\/\?]\S*/.test(
								imageUrl
							)
						) {
							editor.chain().focus().setImage({ src: imageUrl }).run();
							modal = false;
						}
					}}>Add Image</button
				>
			</span>
		</Modal>
	{:else if modal === "settings"}
		<Modal exit={() => (modal = false)}>
			<span slot="body">
				<h1 class="font-bold text-xl">Settings</h1>
				<div class="form-control">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="cursor-pointer label">
						<span class="label-text">Enable Typography (requires reload)</span>
						<div>
							<input
								type="checkbox"
								checked={settings.Typography}
								on:change={() => setSetting("Typography", !settings.Typography)}
								name="Typography"
								class="toggle toggle-primary"
							/>
							<span class="toggle-mark" />
						</div>
					</label>
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="cursor-pointer label">
						<span class="label-text">New line menu</span>
						<div>
							<input
								type="checkbox"
								checked={settings.NewlineMenu}
								on:change={() =>
									setSetting("NewlineMenu", !settings.NewlineMenu)}
								name="NewlineMenu"
								class="toggle toggle-primary"
							/>
							<span class="toggle-mark" />
						</div>
					</label>
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="cursor-pointer label">
						<span class="label-text">Save where you left off</span>
						<div>
							<input
								type="checkbox"
								checked={settings.PickUpFromExit}
								on:change={() =>
									setSetting("PickUpFromExit", !settings.PickUpFromExit)}
								name="NewlineMenu"
								class="toggle toggle-primary"
							/>
							<span class="toggle-mark" />
						</div>
					</label>
				</div>
			</span>
			<span slot="actions">
				<button
					class="btn"
					on:click={() => {
						modal = false;
					}}>Exit</button
				>
			</span>
		</Modal>
	{:else if modal === "about"}
		<Modal exit={() => (modal = false)}>
			<span slot="body">
				<h1 class="font-bold text-xl">About</h1>
				<p>For more information and documentation on Serenity Editor, please visit the GitHub link below</p>
			</span>
			<span slot="actions">
				<button
					class="btn btn-outline"
					on:click={() => {
						modal = false;
					}}>Exit</button
				>
				<a class="btn" href="https://github.com/AsyncBanana/Serenity-Editor" alt="Link to GitHub" target="_blank">
					GitHub
				</a>
			</span>
		</Modal>
	{/if}
{/if}
<div bind:this={element} class="mt-30" />

<style global>
	.ProseMirror {
		outline: none;
	}
	/*table td,
  table th {
    padding: 1rem;
    white-space: nowrap;
  }
  table tfoot td,
  table tfoot th,
  table thead td,
  table thead th {
    --tw-bg-opacity: 1;
    background-color: hsla(var(--b2) / var(--tw-bg-opacity, 1));
    font-weight: 700;
    font-size: 0.75rem;
    line-height: 1rem;
    text-transform: uppercase;
  }{
        body: 'Enter the url of the image you want to insert',

      }
  table thead th:last-child {
    border-top-right-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }
  table {
    display: table;
    text-align: left;
    position: relative;
    border-collapse: collapse;
    text-indent: 0;
    border-color: inherit;
  }
  table:not(.table-zebra) tbody tr:not(:last-child) td,
  table:not(.table-zebra) tbody tr:not(:last-child) th,
  table:not(.table-zebra) tfoot tr:not(:last-child) td,
  table:not(.table-zebra) tfoot tr:not(:last-child) th,
  table:not(.table-zebra) thead tr:not(:last-child) td,
  table:not(.table-zebra) thead tr:not(:last-child) th {
    --tw-border-opacity: 1;
    border-color: hsla(var(--b2) / var(--tw-border-opacity, 1));
    border-bottom-width: 1px;
  }
  table th:first-child {
    position: sticky;
    position: -webkit-sticky;
    left: 0;
    z-index: 10;
  }
  table tbody td,
  table tbody th {
    --tw-bg-opacity: 1;
    background-color: hsla(var(--b1) / var(--tw-bg-opacity, 1));
  }*/
	.ProseMirror h1,
	.ProseMirror h2,
	.ProseMirror h3,
	.ProseMirror h4,
	.ProseMirror h5,
	.ProseMirror h6 {
		font-weight: bolder;
	}
	.ProseMirror h1 {
		font-size: 2em;
	}
	.ProseMirror h2 {
		font-size: 1.5em;
	}
	.ProseMirror h3 {
		font-size: 1.17em;
	}
	.ProseMirror h4 {
		font-size: 1em;
	}
	.ProseMirror h5 {
		font-size: 0.83em;
	}
	.ProseMirror h6 {
		font-size: 0.67em;
	}
	.ProseMirror pre {
		background-color: #0d0d0d;
		color: white;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		font-family: monospace;
	}
	.ProseMirror code {
		color: inherit;
		padding: 0;
		background: none;
		font-size: 0.8rem;
	}
	.ProseMirror hr {
		border: gray 1px solid;
	}
	.ProseMirror ul {
		list-style: disc;
		margin-left: 50px;
	}
	.ProseMirror *.is-empty:first-child::before {
		content: attr(data-placeholder);
		float: left;
		color: #c1c1c2;
		pointer-events: none;
		height: 0;
		opacity: 0.75;
	}
	.hljs-comment,
	.hljs-quote {
		color: #616161;
	}

	.hljs-variable,
	.hljs-template-variable,
	.hljs-attribute,
	.hljs-tag,
	.hljs-name,
	.hljs-regexp,
	.hljs-link,
	.hljs-name,
	.hljs-selector-id,
	.hljs-selector-class {
		color: #f98181;
	}

	.hljs-number,
	.hljs-meta,
	.hljs-built_in,
	.hljs-builtin-name,
	.hljs-literal,
	.hljs-type,
	.hljs-params {
		color: #fbbc88;
	}

	.hljs-string,
	.hljs-symbol,
	.hljs-bullet {
		color: #b9f18d;
	}

	.hljs-title,
	.hljs-section {
		color: #faf594;
	}

	.hljs-keyword,
	.hljs-selector-tag {
		color: #70cff8;
	}

	.hljs-emphasis {
		font-style: italic;
	}

	.hljs-strong {
		font-weight: 700;
	}
</style>
