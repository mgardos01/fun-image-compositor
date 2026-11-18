/// <reference lib="webworker" />
// Multiplies a group of images together (like stacking layers set to "multiply") and posts back
// the result. Images are decoded by the browser, so any format it can open is supported.

import initPhoton, { PhotonImage, blend } from '@silvia-odwyer/photon';
import photonWasmUrl from '@silvia-odwyer/photon/photon_rs_bg.wasm?url';

export interface CompositeRequest {
	jobId: number;
	batchIndex: number;
	images: { name: string; url: string }[];
}

export type CompositeResponse =
	| { jobId: number; batchIndex: number; ok: true; imageData: ImageData }
	| { jobId: number; batchIndex: number; ok: false; error: string };

const ready = initPhoton({ module_or_path: photonWasmUrl });

async function decode(image: { name: string; url: string }): Promise<PhotonImage> {
	let bitmap: ImageBitmap;
	try {
		const blob = await (await fetch(image.url)).blob();
		bitmap = await createImageBitmap(blob);
	} catch {
		throw new Error(`Couldn't read "${image.name}". It may not be a supported image format.`);
	}
	const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(bitmap, 0, 0);
	bitmap.close();
	const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	return new PhotonImage(new Uint8Array(pixels.buffer), canvas.width, canvas.height);
}

async function composite({ images }: CompositeRequest): Promise<ImageData> {
	await ready;
	const base = await decode(images[0]);
	try {
		for (const image of images.slice(1)) {
			const layer = await decode(image);
			try {
				const [bw, bh, lw, lh] = [
					base.get_width(),
					base.get_height(),
					layer.get_width(),
					layer.get_height()
				];
				// photon reads the layer at every pixel of the base, so it can't be smaller.
				if (lw < bw || lh < bh) {
					throw new Error(
						`"${image.name}" (${lw}×${lh}) is smaller than "${images[0].name}" (${bw}×${bh}). ` +
							`Layers must be at least as large as the first image in their group.`
					);
				}
				blend(base, layer, 'multiply');
			} finally {
				layer.free();
			}
		}
		// Copy the pixels out of wasm memory so the buffer can be transferred to the page.
		const result = base.get_image_data();
		return new ImageData(new Uint8ClampedArray(result.data), result.width, result.height);
	} finally {
		base.free();
	}
}

self.onmessage = async (event: MessageEvent<CompositeRequest>) => {
	const { jobId, batchIndex } = event.data;
	let response: CompositeResponse;
	try {
		const imageData = await composite(event.data);
		response = { jobId, batchIndex, ok: true, imageData };
		self.postMessage(response, [imageData.data.buffer]);
	} catch (error) {
		response = {
			jobId,
			batchIndex,
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		};
		self.postMessage(response);
	}
};
