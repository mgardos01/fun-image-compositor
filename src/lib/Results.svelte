<!-- Settings, the Composite button, each group's result and the final stitched image. -->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import Fa from 'svelte-fa';
	import {
		faLayerGroup,
		faDownload,
		faShareNodes,
		faTriangleExclamation
	} from '@fortawesome/free-solid-svg-icons';
	import { pages } from './pages.svelte';
	import { compositor } from './compositor.svelte';

	onDestroy(() => compositor.destroy());

	const count = $derived(pages.items.length);
	const stale = $derived(
		compositor.groups.length > 0 && compositor.lastRun !== compositor.key(pages.items)
	);

	let canShare = $state(false);
	$effect(() => {
		const final = compositor.final;
		const file = final && new File([final.blob], 'composite.png', { type: 'image/png' });
		canShare = !!file && !!navigator.canShare?.({ files: [file] });
	});

	async function share() {
		if (!compositor.final) return;
		const file = new File([compositor.final.blob], 'composite.png', { type: 'image/png' });
		try {
			await navigator.share({ files: [file], title: 'Composite image' });
		} catch (error) {
			// Closing the share sheet rejects with AbortError, which is fine.
			if ((error as Error).name !== 'AbortError') console.error(error);
		}
	}

	/** Draws an ImageData into the canvas it is attached to. */
	const draw = (image: ImageData) => (canvas: HTMLCanvasElement) => {
		canvas.width = image.width;
		canvas.height = image.height;
		canvas.getContext('2d')?.putImageData(image, 0, 0);
	};
</script>

<div class="settings">
	<label class="field">
		<span class="label is-small">Layers per image</span>
		<input
			class="input"
			type="number"
			inputmode="numeric"
			min="1"
			max="50"
			bind:value={compositor.layersPerImage}
		/>
	</label>
	<label class="field">
		<span class="label is-small">Images per row</span>
		<input
			class="input"
			type="number"
			inputmode="numeric"
			min="1"
			max="50"
			bind:value={compositor.columns}
		/>
	</label>
	<button
		class="button is-primary composite"
		class:is-loading={compositor.busy}
		disabled={count === 0 || compositor.busy}
		onclick={() => compositor.run(pages.items)}
	>
		<span class="icon"><Fa icon={faLayerGroup} /></span>
		<span>Composite {count} {count === 1 ? 'image' : 'images'}</span>
	</button>
</div>

{#if compositor.busy}
	<p class="has-text-grey">Processing {compositor.done} of {compositor.groups.length}…</p>
{:else if stale}
	<p class="notification is-warning is-light">
		The images or settings have changed. Composite again to update the result.
	</p>
{/if}

{#if compositor.errors.length > 0}
	<div class="notification is-danger is-light">
		<p class="has-text-weight-semibold">
			<span class="icon"><Fa icon={faTriangleExclamation} /></span>
			{compositor.errors.length === 1 ? 'One result' : `${compositor.errors.length} results`} couldn't
			be made, so there's no final image yet.
		</p>
		<ul>
			{#each compositor.errors as group, index (index)}
				<li>{group.status === 'error' && group.error}</li>
			{/each}
		</ul>
	</div>
{/if}

{#if compositor.groups.length > 0}
	<div class="grid-list">
		{#each compositor.groups as group, index (index)}
			<figure class="result" class:is-error={group.status === 'error'}>
				{#if group.status === 'loading'}
					<span class="loader" aria-label="Processing"></span>
				{:else if group.status === 'error'}
					<Fa icon={faTriangleExclamation} size="lg" />
				{:else}
					<canvas {@attach draw(group.image)}></canvas>
				{/if}
				<figcaption>{index + 1}</figcaption>
			</figure>
		{/each}
	</div>
{/if}

{#if compositor.final}
	<div class="final">
		<h3 class="title is-5">Final image</h3>
		<p class="has-text-grey is-size-7">
			{compositor.final.width} × {compositor.final.height} px. Tap or click it to open full size.
		</p>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- a blob: URL for the generated image, not a route -->
		<a href={compositor.final.url} target="_blank" rel="noopener">
			<img src={compositor.final.url} alt="The final composite" />
		</a>
		<div class="buttons">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- a blob: URL for the generated image, not a route -->
			<a class="button is-primary" href={compositor.final.url} download="composite.png">
				<span class="icon"><Fa icon={faDownload} /></span><span>Download</span>
			</a>
			{#if canShare}
				<button class="button" onclick={share}>
					<span class="icon"><Fa icon={faShareNodes} /></span><span>Share</span>
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.settings {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.settings .field {
		flex: 1 1 8rem;
		max-width: 10rem;
		margin: 0;
	}

	.settings .label {
		margin-bottom: 0.25rem;
	}

	.composite {
		flex: 1 1 12rem;
	}

	.grid-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(7rem, 30%), 1fr));
		gap: 0.75rem;
	}

	.result {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 5 / 7;
		margin: 0;
		overflow: hidden;
		border: 2px solid var(--bulma-border);
		border-radius: var(--bulma-radius);
		background: var(--bulma-background);
	}

	.result.is-error {
		border-color: var(--bulma-danger);
		color: var(--bulma-danger);
	}

	.result canvas {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.result figcaption {
		position: absolute;
		top: 0.25rem;
		left: 0.25rem;
		padding: 0 0.4rem;
		border-radius: 999px;
		background: rgb(0 0 0 / 0.7);
		color: #fff;
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.5rem;
	}

	.final {
		margin-top: 1.5rem;
	}

	.final .title {
		margin-bottom: 0.25rem;
	}

	.final img {
		display: block;
		max-width: 100%;
		max-height: 80vh;
		margin: 0.75rem 0;
		border: 1px solid var(--bulma-border);
		border-radius: var(--bulma-radius);
	}

	.notification ul {
		margin: 0.5rem 0 0 1.25rem;
		list-style: disc;
	}
</style>
