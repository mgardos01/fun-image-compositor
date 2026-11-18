import type { Page } from './pages.svelte';
import type { CompositeRequest, CompositeResponse } from './imageProcessor';
import ImageWorker from './imageProcessor.ts?worker';

export type GroupResult =
	| { status: 'loading'; pages: Page[] }
	| { status: 'done'; pages: Page[]; image: ImageData }
	| { status: 'error'; pages: Page[]; error: string };

/** Splits the pages into groups that are multiplied together, then tiles the groups into one image. */
class Compositor {
	/** How many consecutive images are multiplied together into one tile. */
	layersPerImage = $state(3);
	/** How many tiles go in each row of the final image. */
	columns = $state(3);

	groups = $state<GroupResult[]>([]);
	/** The stitched image, once every group has finished without errors. */
	final = $state<HTMLCanvasElement | null>(null);

	busy = $derived(this.groups.some((group) => group.status === 'loading'));
	errors = $derived(this.groups.filter((group) => group.status === 'error'));

	#workers: Worker[] = [];
	#jobId = 0;

	#pool(): Worker[] {
		if (this.#workers.length === 0) {
			// Each worker holds its own copy of the wasm module, so keep the pool small on phones.
			const size = Math.min(navigator.hardwareConcurrency || 2, 4);
			for (let i = 0; i < size; i++) {
				const worker = new ImageWorker();
				worker.onmessage = (event: MessageEvent<CompositeResponse>) => this.#receive(event.data);
				this.#workers.push(worker);
			}
		}
		return this.#workers;
	}

	run(pages: Page[]) {
		const jobId = ++this.#jobId;
		const size = Math.max(1, Math.floor(this.layersPerImage));
		const groups: GroupResult[] = [];
		for (let i = 0; i < pages.length; i += size) {
			groups.push({ status: 'loading', pages: pages.slice(i, i + size) });
		}
		this.groups = groups;
		this.final = null;

		const workers = this.#pool();
		groups.forEach((group, batchIndex) => {
			const request: CompositeRequest = {
				jobId,
				batchIndex,
				images: group.pages.map((page) => ({ name: page.file.name, url: page.url }))
			};
			workers[batchIndex % workers.length].postMessage(request);
		});
	}

	reset() {
		this.#jobId++;
		this.groups = [];
		this.final = null;
	}

	#receive(response: CompositeResponse) {
		// Ignore results from an earlier run.
		if (response.jobId !== this.#jobId) return;
		const group = this.groups[response.batchIndex];
		if (!group) return;
		this.groups[response.batchIndex] = response.ok
			? { status: 'done', pages: group.pages, image: response.imageData }
			: { status: 'error', pages: group.pages, error: response.error };
		if (!this.busy) this.#stitch();
	}

	#stitch() {
		if (this.groups.length === 0 || this.errors.length > 0) return;
		const images = this.groups.map((group) => (group as { image: ImageData }).image);
		// Size every cell to the largest tile so differently sized tiles never overlap.
		const cellWidth = Math.max(...images.map((image) => image.width));
		const cellHeight = Math.max(...images.map((image) => image.height));
		const columns = Math.max(1, Math.min(Math.floor(this.columns), images.length));
		const rows = Math.ceil(images.length / columns);

		const canvas = document.createElement('canvas');
		canvas.width = columns * cellWidth;
		canvas.height = rows * cellHeight;
		const ctx = canvas.getContext('2d')!;
		images.forEach((image, index) => {
			const x = (index % columns) * cellWidth;
			const y = Math.floor(index / columns) * cellHeight;
			ctx.putImageData(image, x, y);
		});
		this.final = canvas;
	}

	destroy() {
		for (const worker of this.#workers) worker.terminate();
		this.#workers = [];
	}
}

export const compositor = new Compositor();
