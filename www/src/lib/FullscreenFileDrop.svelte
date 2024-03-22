<!-- FullScreenFileDrop.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
    import { files } from './stores';

	let isDragging: boolean = false;
	let dragCounter: number = 0; // Counter to manage drag enter/leave events

	onMount(() => {
		window.addEventListener('dragover', handleDragOver);
		window.addEventListener('dragenter', handleDragEnter);
		window.addEventListener('dragleave', handleDragLeave);
		window.addEventListener('drop', handleDrop);

		return () => {
			window.removeEventListener('dragover', handleDragOver);
			window.removeEventListener('dragenter', handleDragEnter);
			window.removeEventListener('dragleave', handleDragLeave);
			window.removeEventListener('drop', handleDrop);
		};
	});

	const handleDragOver = (event: DragEvent) => {
		event.preventDefault();
	};

	const handleDragEnter = (event: DragEvent) => {
		event.preventDefault();
		
		if (event.dataTransfer && event.dataTransfer.types && event.dataTransfer.types.includes('Files')) {
            dragCounter++;
			isDragging = true;
		}
	};

	const handleDragLeave = (event: DragEvent) => {
		event.preventDefault();
		dragCounter--;
		if (dragCounter === 0) {
			isDragging = false;
		}
	};

	const handleDrop = (event: DragEvent) => {
		event.preventDefault();
		isDragging = false;
		dragCounter = 0; // Reset the counter

		const dropped_files = event.dataTransfer?.files;
		if (dropped_files && dropped_files.length > 0) {
            console.log('DROPPED FILES:')
            console.log(dropped_files)
            files.update((list) => list.concat(Array.from(dropped_files)))
		}
	};
</script>

{#if isDragging}
	<div class="drop-zone visible">Drop files here...</div>
{/if}

<style>
	:global(body) {
		overflow: hidden;
	}
	.drop-zone {
		align-items: center;
		background: rgba(0, 0, 0, 0.75);
		display: flex;
		justify-content: center;
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		font-size: 20px;
		color: #fff;
		z-index: 10000;
		transition:
			opacity 0.3s,
			visibility 0.3s;
		visibility: hidden;
		opacity: 0;
	}
	.drop-zone.visible {
		visibility: visible;
		opacity: 1;
	}
</style>
