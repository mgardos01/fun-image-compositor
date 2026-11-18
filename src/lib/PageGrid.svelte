<!-- The images to composite: add, remove and drag to reorder. -->
<script lang="ts">
	import Sortable from 'sortablejs';
	import Fa from 'svelte-fa';
	import { faXmark, faPlus, faArrowDownAZ, faTrash } from '@fortawesome/free-solid-svg-icons';
	import { pages } from './pages.svelte';
	import { compositor } from './compositor.svelte';

	interface Props {
		onfiles: (files: File[]) => void;
	}

	let { onfiles }: Props = $props();

	let fileInput: HTMLInputElement;

	const layers = $derived(Math.max(1, Math.floor(compositor.layersPerImage)));

	/** Lets SortableJS handle the drag, then puts the DOM back and reorders the state instead. */
	function sortable(list: HTMLElement) {
		const instance = Sortable.create(list, {
			animation: 150,
			draggable: '.tile',
			// On touch screens, press and hold to drag so that swiping still scrolls the page.
			delay: 250,
			delayOnTouchOnly: true,
			touchStartThreshold: 5,
			ghostClass: 'is-ghost',
			chosenClass: 'is-chosen',
			// Keep the "add" tile at the end.
			onMove: (event) => !event.related.classList.contains('add'),
			onEnd: (event) => {
				const from = event.oldDraggableIndex;
				const to = event.newDraggableIndex;
				if (from === undefined || to === undefined || from === to) return;
				// Undo SortableJS's DOM move so Svelte stays in charge of the DOM.
				event.item.remove();
				list.insertBefore(event.item, list.children[event.oldIndex!] ?? null);
				pages.move(from, to);
			}
		});
		return () => instance.destroy();
	}

	function handleFileInput() {
		if (fileInput.files?.length) onfiles(Array.from(fileInput.files));
		fileInput.value = '';
	}
</script>

<input
	type="file"
	multiple
	hidden
	accept="image/*"
	bind:this={fileInput}
	onchange={handleFileInput}
/>

{#if pages.items.length === 0}
	<button class="empty" onclick={() => fileInput.click()}>
		<span class="icon is-large"><Fa icon={faPlus} size="2x" /></span>
		<strong>Add images</strong>
		<span class="has-text-grey pointer-fine">or drop them anywhere on this page</span>
		<span class="has-text-grey pointer-coarse">from your photos or files</span>
	</button>
{:else}
	<div class="toolbar buttons">
		<button class="button is-primary" onclick={() => fileInput.click()}>
			<span class="icon"><Fa icon={faPlus} /></span><span>Add images</span>
		</button>
		<button class="button" onclick={() => pages.sortByName()}>
			<span class="icon"><Fa icon={faArrowDownAZ} /></span><span>Sort by name</span>
		</button>
		<button class="button is-danger is-outlined" onclick={() => pages.clear()}>
			<span class="icon"><Fa icon={faTrash} /></span><span>Remove all</span>
		</button>
	</div>

	<p class="hint has-text-grey">
		<span class="pointer-fine">Drag thumbnails to reorder them.</span>
		<span class="pointer-coarse">Press and hold a thumbnail to drag it.</span>
		The badge shows which result each image goes into: every {layers}
		{layers === 1 ? 'image makes' : 'images are multiplied into'} one tile.
	</p>

	<div class="grid-list" {@attach sortable}>
		{#each pages.items as page, index (page.id)}
			{@const group = Math.floor(index / layers)}
			<div class="tile" class:alt={group % 2 === 1}>
				<img src={page.url} alt={page.file.name} draggable="false" />
				<span class="badge" title="Result {group + 1}, layer {(index % layers) + 1}">
					{group + 1}{#if layers > 1}<small>.{(index % layers) + 1}</small>{/if}
				</span>
				<button
					class="remove"
					onclick={() => pages.remove(page.id)}
					aria-label="Remove {page.file.name}"
				>
					<Fa icon={faXmark} />
				</button>
				<span class="name">{page.file.name}</span>
			</div>
		{/each}

		<button class="add" onclick={() => fileInput.click()} aria-label="Add images">
			<Fa icon={faPlus} size="lg" />
		</button>
	</div>
{/if}

<style>
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		min-height: 12rem;
		padding: 1.5rem;
		border: 2px dashed var(--bulma-border);
		border-radius: var(--bulma-radius-large);
		background: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.empty:hover {
		border-color: var(--bulma-primary);
		background: var(--bulma-background);
	}

	.hint {
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.grid-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(7rem, 30%), 1fr));
		gap: 0.75rem;
	}

	.tile,
	.add {
		position: relative;
		aspect-ratio: 5 / 7;
		border-radius: var(--bulma-radius);
	}

	.tile {
		border: 2px solid var(--bulma-border);
		background: var(--bulma-background);
		cursor: grab;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
		touch-action: manipulation;
	}

	.tile.alt {
		border-color: var(--bulma-primary);
	}

	.tile:global(.is-chosen) {
		box-shadow: 0 0.5rem 1rem rgb(0 0 0 / 0.3);
	}

	.tile:global(.is-ghost) {
		opacity: 0.4;
	}

	.tile img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
	}

	.badge {
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

	.badge small {
		font-weight: 400;
		opacity: 0.8;
	}

	.remove {
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		/* Large enough to tap; the visible circle is drawn by ::before. */
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		background: none;
		color: #fff;
		cursor: pointer;
		isolation: isolate;
	}

	.remove::before {
		content: '';
		position: absolute;
		inset: 0.375rem;
		z-index: -1;
		border-radius: 50%;
		background: rgb(0 0 0 / 0.7);
	}

	.remove:hover::before,
	.remove:focus-visible::before {
		background: var(--bulma-danger);
	}

	.name {
		position: absolute;
		right: 0.25rem;
		bottom: 0.25rem;
		left: 0.25rem;
		overflow: hidden;
		padding: 0 0.5rem;
		border-radius: 999px;
		background: rgb(0 0 0 / 0.7);
		color: #fff;
		font-size: 0.75rem;
		line-height: 1.5rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.add {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px dashed var(--bulma-border);
		background: none;
		color: var(--bulma-text-weak);
		cursor: pointer;
	}

	.add:hover {
		border-color: var(--bulma-primary);
		color: var(--bulma-primary);
	}

	/* Mouse users get desktop wording; touch users get touch wording. */
	.pointer-coarse {
		display: none;
	}

	@media (pointer: coarse) {
		.pointer-fine {
			display: none;
		}

		.pointer-coarse {
			display: inline;
		}
	}
</style>
