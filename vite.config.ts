import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
	plugins: [sveltekit(), wasm()],
	build: {
		// photon's wasm glue code uses top-level await
		target: 'es2022'
	},
	worker: {
		// the image-processing worker imports photon, so it needs the wasm plugin too
		format: 'es',
		plugins: () => [wasm()]
	}
});
