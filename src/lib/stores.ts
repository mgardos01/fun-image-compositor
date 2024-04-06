import { writable } from 'svelte/store';

interface FileWithBlobUrl {
    file: File;
    blobUrl: string;
  }

export const files = writable<FileWithBlobUrl[]>([]);

interface Batch {
  files: FileWithBlobUrl[];
  canvas: HTMLCanvasElement;
  isLoading: boolean;
}

export const batches = writable<Batch[]>([]);
