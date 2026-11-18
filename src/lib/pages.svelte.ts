export interface Page {
	/** Stable id, used to key the list so reordering keeps each thumbnail's DOM node. */
	id: number;
	file: File;
	/** Object URL for the file, used for thumbnails and by the worker. */
	url: string;
}

let nextId = 1;

/** The images the user has added, in compositing order. */
class PageList {
	items = $state<Page[]>([]);

	/** Adds image files and returns the names of any that were skipped because they aren't images. */
	add(files: Iterable<File>): string[] {
		const skipped: string[] = [];
		const added: Page[] = [];
		for (const file of files) {
			if (!file.type.startsWith('image/')) {
				skipped.push(file.name);
				continue;
			}
			added.push({ id: nextId++, file, url: URL.createObjectURL(file) });
		}
		this.items.push(...added);
		return skipped;
	}

	remove(id: number) {
		const index = this.items.findIndex((page) => page.id === id);
		if (index === -1) return;
		URL.revokeObjectURL(this.items[index].url);
		this.items.splice(index, 1);
	}

	clear() {
		for (const page of this.items) URL.revokeObjectURL(page.url);
		this.items = [];
	}

	move(from: number, to: number) {
		if (from === to) return;
		const [page] = this.items.splice(from, 1);
		this.items.splice(to, 0, page);
	}

	sortByName() {
		this.items.sort((a, b) =>
			a.file.name.localeCompare(b.file.name, undefined, { numeric: true, sensitivity: 'base' })
		);
	}
}

export const pages = new PageList();
