<script lang="ts">
	import 'bulma/css/bulma.css';
	import FullscreenFileDrop from '$lib/FullscreenFileDrop.svelte';
	import Sortable from '$lib/Sortable.svelte';
	import CanvasGrid from '$lib/CanvasGrid.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
</script>

<section class="hero is-fullheight">
	<div class="hero-head">
		<Navbar></Navbar>
	</div>
	<div class="hero-body is-flex-direction-column">
		<div class="container has-text-left">
			<div>
				<FullscreenFileDrop></FullscreenFileDrop>
			</div>
	
			<div>
				<h1>Welcome to SvelteKit</h1>
				<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
			</div>
	
			<div>
				<Sortable></Sortable>
			</div>
	
			<div>
				<CanvasGrid></CanvasGrid>
			</div>
		</div>
		
	</div>
	<!-- <div class="hero-foot">
		
	</div> -->
</section>

<Footer></Footer>

<style>
	.is-flex-direction-column {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
