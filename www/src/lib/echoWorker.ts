// echoWorker.ts

// TypeScript type for the incoming message
interface EchoMessage {
    message: string;
}

self.onmessage = (e: MessageEvent<EchoMessage>) => {
    console.log("Worker received message:", e.data.message);

    // Echo the message back to the main thread
    self.postMessage({ message: `Echo: ${e.data.message}` });
};
