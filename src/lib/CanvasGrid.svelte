<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { writable, get } from 'svelte/store';
	import { files } from './stores';
	import MyWorker from '$lib/imageProcessor?worker';
	// Removed import for PhotonImage since it's not directly used here
	interface FileWithBlobUrl {
		file: File;
		blobUrl: string;
	}

	interface Batch {
		files: FileWithBlobUrl[];
		canvas: HTMLCanvasElement;
		isLoading: boolean;
	}

	const batches = writable<Batch[]>([]);

	// Define a pool of workers
	let workers: Worker[] = [];
	let nextWorkerIndex = 0; // Keep track of which worker to use next
	let numWorkers = navigator.hardwareConcurrency || 4; // Default to 4, or use the number of logical processors

	function updateBatches() {
		const newBatches = Array(Math.ceil(get(files).length / 3)) // Use get() to access the store value
			.fill(null)
			.map((_, i) => {
				const batchFiles = get(files).slice(i * 3, i * 3 + 3); // Access files store value
				const batchCanvas = document.createElement('canvas');
				return { files: batchFiles, canvas: batchCanvas, isLoading: true };
			});

		batches.set(newBatches);

		get(batches).forEach((batch, index) => {
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
						console.log(ctx);
						ctx?.putImageData(imageData, 0, 0);
					}
					return allBatches;
				});
			};

			workers.push(worker);
		}
	});

	onDestroy(() => {
		// Terminate all workers when the component is destroyed
		workers.forEach((worker) => worker.terminate());
	});
</script>

<div class="canvas-container">
	{#each $batches as batch}
		<div class="canvas-wrapper">
			{#if batch.isLoading}
				<div class="placeholder">Loading...</div>
			{/if}
			<canvas bind:this={batch.canvas} class:hide={batch.isLoading}></canvas>
		</div>
	{/each}
</div>

<button class="button" on:click={updateBatches}>Update Batches</button>

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

	canvas {
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
</style>
