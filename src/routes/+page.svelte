<script lang="ts">
	import 'bulma/css/bulma.min.css';
	import FullscreenFileDrop from '#lib/FullscreenFileDrop.svelte';
	import PageGrid from '#lib/PageGrid.svelte';
	import Results from '#lib/Results.svelte';
	import { pages } from '#lib/pages.svelte.ts';

	let skipped = $state<string[]>([]);

	function addFiles(files: File[]) {
		skipped = pages.add(files);
	}
</script>

<svelte:head>
	<title>Image Compositor</title>
	<meta
		name="description"
		content="Multiply layers of images together and tile the results into one picture, right in your browser."
	/>
</svelte:head>

<FullscreenFileDrop onfiles={addFiles} />

<header class="section header">
	<div class="container is-max-desktop">
		<h1 class="title is-3">Image Compositor</h1>
		<p class="subtitle is-6 has-text-grey">
			Stack images in groups, multiply each group together like layers set to <em>multiply</em>, and
			tile the results into one picture. Everything happens in your browser; nothing is uploaded.
		</p>
	</div>
</header>

<main class="section main">
	<div class="container is-max-desktop">
		{#if skipped.length > 0}
			<div class="notification is-warning is-light">
				<button class="delete" aria-label="Dismiss" onclick={() => (skipped = [])}></button>
				Skipped {skipped.length === 1 ? 'a file that isn’t an image' : 'files that aren’t images'}:
				{skipped.join(', ')}
			</div>
		{/if}

		<section class="box">
			<h2 class="title is-5">1. Images</h2>
			<PageGrid onfiles={addFiles} />
		</section>

		<section class="box">
			<h2 class="title is-5">2. Composite</h2>
			<Results />
		</section>
	</div>
</main>

<footer class="footer">
	<div class="content has-text-centered is-size-7 has-text-grey">
		<a href="https://github.com/mgardos01/fun-image-compositor">Source on GitHub</a>
		· Image processing by <a href="https://silvia-odwyer.github.io/photon/">Photon</a>
	</div>
</footer>

<style>
	/* Tighter spacing than Bulma's defaults so more fits on a phone screen. */
	.header {
		padding-bottom: 0;
	}

	.main {
		padding-top: 1.5rem;
	}

	@media (max-width: 768px) {
		.header,
		.main {
			padding-right: 1rem;
			padding-left: 1rem;
		}

		.header {
			padding-top: 1.5rem;
		}

		.footer {
			padding: 1.5rem 1rem;
		}
	}
</style>
