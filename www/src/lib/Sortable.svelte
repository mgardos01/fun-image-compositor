<script lang="ts">
	import Sortable, { type Options } from 'sortablejs';
	import { onMount, onDestroy } from 'svelte';
	import { files } from './stores';
	import EditIcon from './icons/EditIcon.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';

	let list: HTMLElement;
	let sortable: Sortable;
	let fileInput: HTMLInputElement;

	const removeAtIndex = (index: number) => {
		files.update((list) => {
			if (index < 0 || index >= list.length) {
				// Index is out of bounds
				console.warn(
					`Index ${index} is out of bounds for array of length ${list.length}. No item removed.`
				);
			} else {
				// Remove 1 item at index i
				list.splice(index, 1);
			}
			return list;
		});
	};

	const sortCurrentFiles = () => {
		files.update((list) =>
			list.sort((a, b) => {
				if (a.name < b.name) {
					return -1;
				}
				if (a.name > b.name) {
					return 1;
				}
				return 0;
			})
		);
	};

	onMount(() => {
		sortable = Sortable.create(list, {
			animation: 150,
			draggable: '.page:not(.placeholder)',
			onMove: (event) => {
				return !event.related.classList.contains('.placeholder');
			}
		});
	});

	onDestroy(() => {
		if (sortable) sortable.destroy();
	});

	function handleFileInput(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input && input.files) {
			const fileList: FileList = input.files;
			files.update((list) => list.concat(Array.from(fileList)));
			// Manually reset the file input to allow re-uploading the same file
			input.value = '';
		}
	}
</script>

<div>
	<div class="page-container" bind:this={list}>
		{#each $files as file, index}
			<div class="page" style="background image: {undefined}">
				<div class="label">
					{file.name}
				</div>

				<div class="middle">+</div>

				<button class="edit">
					<div class="icon-container">
						<EditIcon></EditIcon>
					</div>
				</button>

				<button on:click={() => removeAtIndex(index)} class="close">
					<div class="icon-container">
						<CloseIcon></CloseIcon>
					</div>
				</button>
			</div>
		{/each}

		<input
			type="file"
			multiple
			style="display:none;"
			on:change={handleFileInput}
			bind:this={fileInput}
			accept=".jpg, .jpeg, .png, .gif, .jfif"
		/>

		<button class="page placeholder" on:click={() => fileInput.click()}>
			<div class="icon-container">
				<EditIcon></EditIcon>
			</div>
		</button>
	</div>

	{#if $files.length != 0}
		<button class="button" on:click={sortCurrentFiles}>Quick sort</button>
		<button class="button" on:click={() => files.set([])}>Remove all pages</button>
	{/if}
</div>

<style>
	.page-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: left;
		gap: 24px; /* Adjusts the space between items */
		margin: 12px;
	}

	.page {
		align-items: center;
		background-position: 50%;
		background-repeat: no-repeat;
		background-size: contain;
		border-radius: 4px;
		border-top-left-radius: 4px;
		border-top-right-radius: 4px;
		border-bottom-right-radius: 4px;
		border-bottom-left-radius: 4px;
		cursor: pointer;
		display: flex;
		height: 184px;
		justify-content: center;
		position: relative;
		/* transition: all 0.15s ease-out; */
		-webkit-user-select: none;
		-moz-user-select: none;
		user-select: none;
		width: 130px;
	}

	.page.placeholder {
		border: 1px dashed #4d4d4d;
	}

	.page.placeholder:hover {
		background-color: #2c2c2c;
	}

	.page .label {
		background-color: #494949;
		border-radius: 11px;
		bottom: 4px;
		color: #fff;
		font-size: 0.75rem;
		left: 4px;
		max-width: calc(100% - 8px);
		overflow: hidden;
		padding: 2px 8px;
		position: absolute;
		text-overflow: ellipsis;
		white-space: nowrap;
		z-index: 1;
	}

	.icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
	}

	.page .edit,
	.page .close {
		position: absolute;
		width: 24px;
		height: 24px;
		top: -4px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-color: #282b30;
	}

	.page .edit:hover,
	.page .close:hover {
		background-color: #505660;
	}

	.page .edit {
		left: -4px; /* Positions the edit button on the top right corner */
	}

	.page .close {
		right: -4px; /* Positions the close button on the top left corner */
	}

	.middle {
		align-items: center;
		background-color: #fff;
		border-radius: 50%;
		color: #4d4d4d;
		display: flex;
		height: 2.75rem;
		justify-content: center;
		left: 50%;
		opacity: 0.8;
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 2.75rem;
	}
</style>
