<script>
  import "virtual:windi.css";
  import PWA from "$lib/components/PWA.svelte";
  import {browser} from '$app/env'
</script>
{#if browser}
   <PWA></PWA>
{/if}
<slot></slot>
