<script>
	import { onMount } from "svelte";
	import Placeholder from '$lib/components/EditorPlaceholder.svelte'
	let dynamicPage = null;
	onMount(async () => {
		dynamicPage = (await import("$lib/components/EditorComponents.svelte"))
			.default;
	});
</script>
<div class="m-4">
<svelte:component this={dynamicPage} />
</div>
{#if !dynamicPage}
	<Placeholder/>
{/if}
