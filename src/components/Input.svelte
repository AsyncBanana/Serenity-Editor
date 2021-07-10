<script>
	import { createEventDispatcher } from "svelte";
	export let placeholder = "Enter here";
	export let name;
	export let centered = false;
	export let value = "";
	export let bordered = false;
	export let validate = (value) => true;
	const dispatch = createEventDispatcher();
	let invalid = false;
	$: {
		if (!validate(value)) {
			invalid = true;
		} else {
			invalid = false;
		}
		dispatch("change", { invalid: invalid, value: value });
	}
</script>

<div class="form-control" class:centered>
	<label class="label" for={name}>
		<p class="label-text">{placeholder}</p>
	</label>
	<input
		type="text"
		{placeholder}
		id={name}
		bind:value
		class={`input ${invalid ? "input-error" : ""} ${
			bordered ? "input-bordered" : ""
		}`}
	/>
</div>
