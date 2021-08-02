<script>
	export let last = false;
	export let first = false;
	export let buttons = [];
</script>

<div class="dropdown dropdown-hover">
	<button
		class={`btn ${first ? "" : "rounded-1-none"} ${
			last ? "" : "rounded-r-none"
		}`}><slot /></button
	>
	<ul
		class="shadow menu dropdown-content bg-base-100 rounded-box w-52"
		id="topBar"
	>
		{#each buttons as button}
			<li>
				<button on:click={button.click} class:active={button.active} disabled={button.disabled} class="btn rounded-none"
					>{button.name}</button
				>
			</li>
		{/each}
	</ul>
</div>
