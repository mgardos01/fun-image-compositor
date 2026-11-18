<!-- Lets files be dropped anywhere on the window, with a full-screen overlay while dragging. -->
<script lang="ts">
	interface Props {
		onfiles: (files: File[]) => void;
	}

	let { onfiles }: Props = $props();

	let dragDepth = $state(0);

	/** Only react to files dragged in from outside, not to thumbnails being reordered. */
	const hasFiles = (event: DragEvent) => event.dataTransfer?.types.includes('Files') ?? false;

	function ondragenter(event: DragEvent) {
		if (!hasFiles(event)) return;
		event.preventDefault();
		dragDepth++;
	}

	function ondragleave(event: DragEvent) {
		if (!hasFiles(event)) return;
		dragDepth = Math.max(0, dragDepth - 1);
	}

	function ondragover(event: DragEvent) {
		if (!hasFiles(event)) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
	}

	function ondrop(event: DragEvent) {
		if (!hasFiles(event)) return;
		event.preventDefault();
		dragDepth = 0;
		const files = Array.from(event.dataTransfer?.files ?? []);
		if (files.length > 0) onfiles(files);
	}
</script>

<svelte:window {ondragenter} {ondragleave} {ondragover} {ondrop} />

{#if dragDepth > 0}
	<div class="drop-zone">Drop images to add them</div>
{/if}

<style>
	.drop-zone {
		position: fixed;
		inset: 0;
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.75);
		color: #fff;
		font-size: 1.25rem;
		pointer-events: none;
	}
</style>
