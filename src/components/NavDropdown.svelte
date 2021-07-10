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
				<button on:click={button.click} class:active={button.active}
					>{button.name}</button
				>
			</li>
		{/each}
	</ul>
</div>

<style>
	#topBar li button {
		display: flex;
		align-items: center;
		transition-property: background-color, border-color, color, fill, stroke,
			opacity, box-shadow, transform;
		transition-duration: 0.15s;
		transition-duration: 0.2s;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		padding: 0.75rem 1.25rem;
		color: currentColor;
		outline: none;
	}
	#topBar li button:hover {
		--tw-bg-opacity: 1;
		--tw-bg-opacity: 0.1;
		background-color: hsla(var(--bc) / var(--tw-bg-opacity, 1));
	}
	#topBar li button:active,
	#topBar li button:focus,
	.acitve {
		background-color: hsla(var(--pf) / var(--tw-bg-opacity, 1));
		--tw-bg-opacity: 1;
		--tw-text-opacity: 1;
		color: hsla(var(--pc) / var(--tw-text-opacity, 1));
	}
</style>
