import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			// The whole app runs in the browser, so it is built as plain static files.
			adapter: adapter(),
			paths: {
				// Set by the GitHub Pages workflow, where the site is served from /<repo-name>.
				base: (process.env.BASE_PATH ?? '') as '' | `/${string}`
			}
		})
	],
	worker: {
		format: 'es'
	}
});
