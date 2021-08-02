<script>
	import { registerSW } from "virtual:pwa-register";
	let serviceWorkerUpdate = false;
	let updateSW = () => {};
	updateSW = registerSW({
		onNeedRefresh() {
			serviceWorkerUpdate = true;
		},
	});
</script>

{#if serviceWorkerUpdate === true}
	<div
		class="alert alert-info z-50 bottom-0 fixed rounded-b-none w-full"
		on:transition
	>
		<div class="flex-1 z-50">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="#2196f3"
				class="w-6 h-6 mx-2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<p>Please reload the page to install the latest update</p>
		</div>
		<div class="flex-none z-50">
			<button
				class="btn btn-sm mr-2"
				on:click={() => {
					updateSW();
					serviceWorkerUpdate = false;
				}}>Reload</button
			>
		</div>
	</div>
{/if}
