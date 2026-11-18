<script lang="ts">
	import { onDestroy } from 'svelte';
	import { pages } from './pages.svelte';
	import { compositor } from './compositor.svelte';

	let modalActive = $state(false);

	onDestroy(() => compositor.destroy());

	/** Draws an ImageData into the canvas it is attached to. */
	const draw = (image: ImageData) => (canvas: HTMLCanvasElement) => {
		canvas.width = image.width;
		canvas.height = image.height;
		canvas.getContext('2d')?.putImageData(image, 0, 0);
	};

	/** Shows the stitched canvas inside the element it is attached to. */
	const mount = (canvas: HTMLCanvasElement) => (container: HTMLElement) => {
		container.append(canvas);
		return () => canvas.remove();
	};
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && (modalActive = false)} />

<div class="canvas-container">
	{#each compositor.groups as group, index (index)}
		<div class="canvas-wrapper">
			{#if group.status === 'loading'}
				<div class="placeholder">Loading...</div>
			{:else if group.status === 'error'}
				<div class="placeholder error" title={group.error}>{group.error}</div>
			{:else}
				<canvas class="list" {@attach draw(group.image)}></canvas>
			{/if}
		</div>
	{/each}
</div>

{#if pages.items.length !== 0 || compositor.groups.length !== 0}
	<button class="button" onclick={() => compositor.run(pages.items)}>Update Batches</button>
{/if}

{#if compositor.final}
	<button class="button is-info" onclick={() => (modalActive = true)}>Toggle Final Canvas</button>
{/if}

<div class:is-active={modalActive} class="modal">
	<button class="modal-background" aria-label="Close" onclick={() => (modalActive = false)}
	></button>
	<div class="modal-content">
		{#if compositor.final}
			<div {@attach mount(compositor.final)}></div>
		{/if}
	</div>
</div>

<style>
	.canvas-container {
		display: flex;
		flex-wrap: wrap;
	}

	.canvas-wrapper {
		position: relative;
		width: 130px;
		height: 184px;
	}

	.list {
		max-width: 130px;
		max-height: 184px;
	}

	.placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #eee;
	}

	.placeholder.error {
		overflow: auto;
		padding: 6px;
		background-color: #feecf0;
		color: #cc0f35;
		font-size: 0.7rem;
	}

	.modal-background {
		border: none;
	}

	.modal-content :global(canvas) {
		max-width: 100%;
	}
</style>
