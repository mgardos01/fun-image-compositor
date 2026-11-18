<script lang="ts">
	import Sortable from 'sortablejs';
	import Fa from 'svelte-fa';
	import { faXmark, faPlus } from '@fortawesome/free-solid-svg-icons';
	import { pages } from './pages.svelte';

	interface Props {
		onfiles: (files: File[]) => void;
	}

	let { onfiles }: Props = $props();

	let fileInput: HTMLInputElement;

	/** Lets SortableJS handle the drag, then puts the DOM back and reorders the state instead. */
	function sortable(list: HTMLElement) {
		const instance = Sortable.create(list, {
			animation: 150,
			draggable: '.page',
			// On touch screens, press and hold to drag so that swiping still scrolls the page.
			delay: 250,
			delayOnTouchOnly: true,
			touchStartThreshold: 5,
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

<div>
	<div class="page-container" {@attach sortable}>
		{#each pages.items as page (page.id)}
			<div class="page" style:background-image="url({page.url})">
				<div class="label">{page.file.name}</div>
				<button
					class="close"
					onclick={() => pages.remove(page.id)}
					aria-label="Remove {page.file.name}"
				>
					<Fa size="sm" icon={faXmark} />
				</button>
			</div>
		{/each}

		<button class="page add" onclick={() => fileInput.click()} aria-label="Add images">
			<Fa icon={faPlus} />
		</button>
	</div>

	<input
		type="file"
		multiple
		hidden
		accept="image/*"
		bind:this={fileInput}
		onchange={handleFileInput}
	/>

	{#if pages.items.length !== 0}
		<button class="button" onclick={() => pages.sortByName()}>Quick sort</button>
		<button class="button" onclick={() => pages.clear()}>Remove all pages</button>
	{/if}
</div>

<style>
	.page-container {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		margin: 12px;
	}

	.page {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 130px;
		height: 184px;
		border-radius: 4px;
		background-position: 50%;
		background-repeat: no-repeat;
		background-size: contain;
		cursor: grab;
		user-select: none;
		-webkit-user-select: none;
	}

	.page.add {
		border: 1px dashed #4d4d4d;
		background: none;
		cursor: pointer;
	}

	.page.add:hover {
		background-color: #2c2c2c;
	}

	.label {
		position: absolute;
		bottom: 4px;
		left: 4px;
		z-index: 1;
		max-width: calc(100% - 8px);
		overflow: hidden;
		padding: 2px 8px;
		border-radius: 11px;
		background-color: #494949;
		color: #fff;
		font-size: 0.75rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.close {
		position: absolute;
		top: -4px;
		right: -4px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border: none;
		border-radius: 50%;
		background-color: #282b30;
		color: #fff;
		cursor: pointer;
	}

	.close:hover {
		background-color: #505660;
	}
</style>
