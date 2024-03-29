interface WorkerInputMessage {
    batchIndex: number;
    blobUrls: string[];
}

self.onmessage = async (e) => {
    console.log("Worker received batch:", e.data.batchIndex);
    const batch = e.data;
    try {
        const Photon = await import('@silvia-odwyer/photon');

        const imagesData = await Promise.all(batch.blobUrls.map(blobUrl => {
            console.log(`Converting blob URL to Uint8Array: ${blobUrl}`);
            return convertBlobToUint8Array(blobUrl);
        }));

        let baseImage;
        imagesData.forEach((imgArray, index) => {
            console.log(`Processing image ${index + 1} of batch ${batch.batchIndex}`);
            if (!baseImage) {
                baseImage = Photon.PhotonImage.new_from_byteslice(imgArray);
            } else {
                const tempImage = Photon.PhotonImage.new_from_byteslice(imgArray);
                Photon.blend(baseImage, tempImage, 'multiply');
                tempImage.free();
            }
        });

        const imageData = baseImage.get_image_data();
        const buffer = imageData.data.buffer.slice(0);

        console.log("Processing complete, sending imageData back.");
        // @ts-ignore
        self.postMessage({ batchIndex: batch.batchIndex, imageData }, [buffer]);
    } catch (error) {
        console.error('Error processing images:', error);
    }
};

async function convertBlobToUint8Array(blobUrl: string): Promise<Uint8Array> {
    console.log(`Fetching blob URL: ${blobUrl}`);
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}
