<script lang="ts">
	import { files } from './stores';

	interface FileWithBlobUrl {
		file: File;
		blobUrl: string;
	}

	let canvasElements: HTMLCanvasElement[] = [];

	function drawImageOnCanvas(blobUrl: string, canvas: HTMLCanvasElement): void {
		const ctx = canvas.getContext('2d');
		const img = new Image();
		img.onload = () => {
			// Set the canvas size to the image size, adjust this logic if needed
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			ctx?.clearRect(0, 0, canvas.width, canvas.height);
			ctx?.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
		};
		img.src = blobUrl;
	}

	$: if ($files.length && canvasElements) {
		$files.forEach((file, index) => {
			const canvas = canvasElements[index];
			if (canvas) {
				drawImageOnCanvas(file.blobUrl, canvas);
			}
		});
	}
</script>

<div class="canvas-container">
	{#each $files as { blobUrl }, index}
		<canvas bind:this={canvasElements[index]}></canvas>
	{/each}
</div>

<style>
	.canvas-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 0;
	}

	canvas {
		max-width: 130px; /* Sensible max width, similar to 'page' */
		max-height: 184px; /* Sensible max height, similar to 'page' */
		width: auto;
		height: auto;
		object-fit: cover; /* This does not directly apply to <canvas>, but it guides the logic */
	}
</style>
