<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import EchoWorker from '$lib/echoWorker?worker';

	let worker: Worker;

	onMount(() => {
		worker = new EchoWorker();
		worker.onmessage = (e) => {
			console.log('Main thread received echo:', e.data.message);
		};

		// Send a test message to the worker
		worker.postMessage({ message: 'Hello, worker!' });
	});

	// Clean up
	onDestroy(() => {
        if (worker) {
            worker.terminate();
        }
	});
</script>

<h1>Check the console for worker communication.</h1>
