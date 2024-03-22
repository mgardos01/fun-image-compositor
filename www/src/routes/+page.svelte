<script lang="ts">
	import 'bulma/css/bulma.css';
	import FullscreenFileDrop from '$lib/FullscreenFileDrop.svelte';
	import Sortable from '$lib/Sortable.svelte';
</script>

<div>
	<FullscreenFileDrop></FullscreenFileDrop>
</div>

<div>
	<h1>Welcome to SvelteKit</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
</div>

<Sortable></Sortable>