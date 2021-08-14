<script>
  import { stop_propagation } from 'svelte/internal';
import { fly, fade } from 'svelte/transition';
  export let exit;
</script>
<div class="modal visible opacity-100 pointer-events-auto" transition:fade="{{duration: 200}}" on:click={exit}>
  <div class="modal-box" transition:fly="{{duration: 200, y:20}}" style="--tw-translate-y: 0" on:click={(e)=>e.stopPropagation()}>
    <span><slot name="body" /></span>
    <div class="modal-action">
      <slot name="actions" />
    </div>
  </div>
</div>

<style>
  @media (min-width: 640px) {
    .modal-box {
      max-width: 32rem;
      --tw-scale-x: 0.9;
      --tw-scale-y: 0.9;
      --tw-translate-y: 0px;
      border-bottom-left-radius: var(--rounded-box, 1rem);
      border-bottom-right-radius: var(--rounded-box, 1rem);
    }
    .modal {
      align-items: center;
    }
  }
</style>
