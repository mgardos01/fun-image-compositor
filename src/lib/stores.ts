import { writable } from 'svelte/store';

interface FileWithBlobUrl {
    file: File;
    blobUrl: string;
  }

export const files = writable<FileWithBlobUrl[]>([]);