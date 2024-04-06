<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { writable, get } from 'svelte/store';
	import { files, batches } from './stores';
	import MyWorker from '$lib/imageProcessor?worker';
	// Removed import for PhotonImage since it's not directly used here

	// Define a pool of workers
	let workers: Worker[] = [];
	let nextWorkerIndex = 0; // Keep track of which worker to use next
	let numWorkers = navigator.hardwareConcurrency || 4; // Default to 4, or use the number of logical processors

	function updateBatches() {
		const newBatches = Array(Math.ceil($files.length / 3)) // Use get() to access the store value
			.fill(null)
			.map((_, i) => {
				const batchFiles = $files.slice(i * 3, i * 3 + 3); // Access files store value
				const batchCanvas = document.createElement('canvas');
				return { files: batchFiles, canvas: batchCanvas, isLoading: true };
			});

		batches.set(newBatches);

		$batches.forEach((batch, index) => {
			const worker = workers[nextWorkerIndex];
			const blobUrls = batch.files.map((file) => file.blobUrl);
			worker.postMessage({ batchIndex: index, blobUrls });
			nextWorkerIndex = (nextWorkerIndex + 1) % numWorkers;
		});
	}

	onMount(() => {
		// Initialize workers inside onMount
		for (let i = 0; i < numWorkers; i++) {
			const worker = new MyWorker();

			worker.onmessage = (e) => {
				const { batchIndex, imageData } = e.data;
				batches.update((allBatches) => {
					const batch = allBatches[batchIndex];
					if (batch) {
						batch.isLoading = false;
						const ctx = batch.canvas.getContext('2d');
						batch.canvas.width = imageData.width;
						batch.canvas.height = imageData.height;
						ctx?.putImageData(imageData, 0, 0);

						// Call stitchCanvases here to check if it's time to stitch
						stitchCanvases();
					}
					return allBatches;
				});
			};

			workers.push(worker);
		}

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			workers.forEach((worker) => worker.terminate());
		};
	});

	let finalCanvas: HTMLCanvasElement;
	let showModal = false;
	let modalActive = false;
	let images_per_row = 3; // Or make it reactive based on some conditions

	const closeModal = () => (modalActive = false);
	function handleKeyDown(event: KeyboardEvent) {
		// Check if the Enter key was pressed
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	function stitchCanvases() {
		// Ensure all batches are loaded
		if ($batches.some((batch) => batch.isLoading)) return;

		if (!finalCanvas) {
			console.error('finalCanvas is not defined yet.');
			return;
		}
		// Assuming all batch canvases have the same dimensions
		const { width, height } = $batches[0].canvas;
		const totalImages = $batches.length;
		const rows = Math.ceil(totalImages / images_per_row);
		const stitchedCanvasWidth = images_per_row * width;
		const stitchedCanvasHeight = rows * height;

		finalCanvas.width = stitchedCanvasWidth;
		finalCanvas.height = stitchedCanvasHeight;
		const ctx = finalCanvas.getContext('2d');

		$batches.forEach((batch, index) => {
			const row = Math.floor(index / images_per_row);
			const col = index % images_per_row;
			ctx?.drawImage(batch.canvas, col * width, row * height);
		});

		showModal = true;
	}
</script>

<div class="canvas-container">
	{#each $batches as batch}
		<div class="canvas-wrapper">
			{#if batch.isLoading}
				<div class="placeholder">Loading...</div>
			{/if}
			<canvas class="list" bind:this={batch.canvas} class:hide={batch.isLoading}></canvas>
		</div>
	{/each}
</div>

{#if $files.length != 0 || $batches.length != 0}
	<button class="button" on:click={updateBatches}>Update Batches</button>
{/if}

{#if showModal}
	<button class="button is-info" on:click={() => (modalActive = true)}>Toggle Final Canvas</button>
{/if}

<div class:is-active={modalActive} class="modal">
	<div
		class="modal-background"
		role="button"
		on:click={closeModal}
		on:keydown={handleKeyDown}
		tabindex="0"
	></div>
	<div class="modal-content">
		<!-- Final Canvas will be inserted here -->
		<canvas class="image" bind:this={finalCanvas}></canvas>
	</div>
</div>

<style>
	.canvas-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 0;
	}

	.canvas-wrapper {
		position: relative;
		width: 130px;
		height: 184px;
	}

	.list {
		max-width: 130px;
		max-height: 184px;
		width: auto;
		height: auto;
		object-fit: cover;
	}

	.hide {
		display: none;
	}

	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #eee;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.custom-modal-size .modal-content {
		width: 90vw; /* Adjust width as needed */
		max-width: none; /* Override Bulma's default max-width */
	}

	.modal-content canvas {
		max-width: 100%;
		object-fit: contain;
	}
</style>
