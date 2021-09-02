<script>
	// Other
	import { onMount, onDestroy } from "svelte";
	import { Editor } from "@tiptap/core";
	import NavDropdown from "$lib/components/NavDropdown.svelte";
	import Modal from "$lib/components/Modal.svelte";
	import Input from "$lib/components/Input.svelte";
	import Welcome from "$lib/modules/welcome.js";
	import { fileOpen, fileSave } from "browser-fs-access";
	import convertToMarkdown from "$lib/modules/parsers/markdownExporter.js";
	import convertFromMarkdown from "$lib/modules/parsers/markdownImporter.js";
	import watchMedia from "svelte-media";
	import { user, auth0Client } from "$lib/modules/authStore.js";
	import { init, login, logout, authorizedFetch } from "$lib/modules/auth0.js";
	import { pack, unpack } from "msgpackr";
	import { Compress, Decompress } from "$lib/modules/tiptap-compress";
	import deepClone from "$lib/modules/deepCopy";
	// Nodes
	import Document from "@tiptap/extension-document";
	import Paragraph from "@tiptap/extension-paragraph";
	import Text from "@tiptap/extension-text";
	import Blockquote from "@tiptap/extension-blockquote";
	import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
	import lowlight from "$lib/modules/lowLightBuild.js";
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
	let tableRows = 3;
	let tableColumns = 3;
	let currentFile = null;
	let apiBase = import.meta.env.dev ? "http://localhost:8787/" : "/";
	let screenSize = watchMedia({ large: "(min-width: 768px)" });
	const cloudDialog = {
		type: 0,
		items: { "Example Document": true, "Another example": true },
		current: "",
	};
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
					tippyOptions: {
						zIndex: 30,
						maxWidth: 500,
					},
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
	let auth0 = auth0Client;
	let userVal = user;
	auth0Client.subscribe((val) => {
		auth0 = val;
	});
	user.subscribe((val) => {
		userVal = val;
	});
	init();
</script>

{#if editor}
	<div class="top-10 z-40 btn-group fixed" id="topMenu">
		<!-- svelte-ignore missing-declaration -->
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
					name: auth0 ? (userVal ? userVal.email : "Login") : "Loading",
					click: () => {
						if (auth0) {
							if (!userVal) {
								login();
							} else {
								// TODO
								authorizedFetch("http://127.0.0.1:8787/api/documents", {
									method: "POST",
									body: pack(Compress(deepClone(editor.getJSON()))),
									headers: {
										"Content-Type": "application/msgpack",
										Title: "Untitled",
									},
								});
							}
						}
					},
				},
				{
					name: "Open File...",
					click: async () => {
						try {
							const file = await fileOpen({
								extensions: [".html", ".html", ".txt", ".md", ".mdtext"],
								description: "Input text, markdown or HTML files",
								multiple: false,
							});
							currentFile = file.handle;
							const extension = file.name.split(".").pop();
							if (extension === "md" || extension === "mdtext") {
								editor.commands.setContent(
									convertFromMarkdown(await file.text())
								);
							} else {
								editor.commands.setContent(await file.text());
							}
						} catch (err) {
							console.log(`Error opening file: ${err}`);
						}
					},
				},
				{
					name: "Save",
					click: async () => {
						if (!currentFile) {
							return;
						}
						const extension = currentFile.name.split(".").pop();
						if (extension === "md" || extension === "mdtext") {
							currentFile = await fileSave(
								new Blob([convertToMarkdown(editor.getJSON())], {
									type: "text/markdown",
								}),
								{
									fileName: "document.md",
									extensions: [".md", ".mdtext"],
								},
								currentFile
							);
						} else {
							currentFile = await fileSave(
								new Blob([editor.getHTML()], { type: "text/html" }),
								{
									fileName: "document.html",
									extensions: [".htm", ".html"],
								},
								currentFile
							);
						}
					},
					disabled: !currentFile,
				},
				/*{
					name: "Save to Cloud...",
					click: async () => {
						cloudDialog.type = 2 // 1 = read, 2 = save
						modal = "clouddialog"
					},
				},*/
				{
					name: "Save As HTML...",
					click: async () => {
						currentFile = await fileSave(
							new Blob([editor.getHTML()], { type: "text/html" }),
							{
								fileName: "document.html",
								extensions: [".html", ".htm"],
							}
						);
					},
				},
				{
					name: "Save As Markdown...",
					click: async () => {
						currentFile = await fileSave(
							new Blob([convertToMarkdown(editor.getJSON())], {
								type: "text/markdown",
							}),
							{
								name: "document.md",
								extensions: [".md", ".mdtext"],
							}
						);
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
		{#if $screenSize.large}
			<button
				on:click={() => {
					modal = "table";
				}}
				class="btn"
			>
				Table
			</button>
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
		{/if}
	</div>
{/if}
<div class="m-auto btn-group" id="bubble-menu">
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
		<button
			class="btn btn-sm"
			class:btn-active={editor ? editor.isActive("orderedList") : false}
			on:click={() => editor.chain().focus().toggleOrderedList().run()}
			>Ordered List</button
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
				<p>
					For more information and documentation on Serenity Editor, please
					visit the GitHub link below
				</p>
			</span>
			<span slot="actions">
				<button
					class="btn btn-outline"
					on:click={() => {
						modal = false;
					}}>Exit</button
				>
				<a
					class="btn"
					href="https://github.com/AsyncBanana/Serenity-Editor"
					alt="Link to GitHub"
					target="_blank"
				>
					GitHub
				</a>
			</span>
		</Modal>
	{:else if modal === "table"}
		<Modal exit={() => (modal = false)}>
			<span slot="body">
				<h1 class="font-bold text-xl">Insert Table (WIP)</h1>
				<Input
					bind:value={tableRows}
					name="tableRowsInput"
					placeholder="Enter number of rows here"
					bordered={true}
					validate={(value) => !isNaN(value)}
				/>
				<Input
					bind:value={tableColumns}
					name="tableColumnsInput"
					placeholder="Enter number of columns here"
					bordered={true}
					validate={(value) => !isNaN(value)}
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
						if (!isNaN(tableRows) && !isNaN(tableColumns)) {
							editor
								.chain()
								.focus()
								.insertTable({
									rows: tableRows || 0,
									columms: tableColumns || 0,
								})
								.run();
							modal = false;
						}
					}}>Add Image</button
				>
			</span>
		</Modal>
	{:else if (modal = "clouddialog")}
		<Modal exit={() => (modal = false)}>
			<span slot="body">
				<h1 class="font-bold text-xl">
					{`${cloudDialog.type === 2 ? "Save to" : "Read from"} Cloud`}
				</h1>
				<div class="w-full grid gap-3 grid-cols-2 lg:grid-cols-2">
					{#each Object.keys(cloudDialog.items) as item}
						<button class="btn">{item}</button>
					{/each}
				</div>
				<div class="flex items-center">
					<Input
						name="cloudFileNameDialog"
						bordered={true}
						placeholder="Enter file name or choose from above"
						validate={(val) => cloudDialog.items[val]}
						bind:value={cloudDialog.current}
					/>
					<button
						class="mt-[1.750rem] ml-3 btn btn-outline"
						on:click={() => (modal = false)}>Cancel</button
					>
					<button
						class="mt-[1.750rem] ml-3 btn"
						on:click={async () => {
							if (cloudDialog.type === 1) {
								if (cloudDialog.items[cloudDialog.current]) {
								}
							}
						}}>{cloudDialog.type === 2 ? "Save as" : "Open"}</button
					>
				</div>
			</span>
			<span slot="actions" />
		</Modal>
	{/if}
{/if}
<div bind:this={element} class="mt-25 md:w-3/4" />

<style global>
	.ProseMirror {
		outline: none;
	}
	table {
		border-collapse: collapse;
		table-layout: fixed;
		width: 100%;
		margin: 0;
		overflow: hidden;
	}
	table tfoot td:first-child,
	table tfoot th:first-child,
	table thead td:first-child,
	table thead th:first-child {
		border-top-left-radius: 0.5rem;
		border-bottom-left-radius: 0.5rem;
	}
	table tfoot td:last-child,
	table tfoot th:last-child,
	table thead td:last-child,
	table thead th:last-child {
		border-top-right-radius: 0.5rem;
		border-bottom-right-radius: 0.5rem;
	}
	td,
	th {
		min-width: 1em;
		border: 2px solid #ced4da;
		padding: 1rem;
		vertical-align: top;
		box-sizing: border-box;
		position: relative;
	}
	td *,
	th * {
		margin-bottom: 0;
	}
	th {
		font-weight: bold;
		text-align: left;
		background-color: hsla(var(--b2) / var(--tw-bg-opacity, 1));
	}
	.ProseMirror a {
		cursor: pointer;
		text-decoration: underline;
	}
	.selectedCell:after {
		z-index: 2;
		position: absolute;
		content: "";
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background: rgba(200, 200, 255, 0.4);
		pointer-events: none;
	}

	.column-resize-handle {
		position: absolute;
		right: -2px;
		top: 0;
		bottom: -2px;
		width: 4px;
		background-color: #adf;
		pointer-events: none;
	}
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
