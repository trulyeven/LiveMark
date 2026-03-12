import { parentPort } from 'worker_threads';
import { MarkdownParser } from './MarkdownParser';

const parser = new MarkdownParser();

if (parentPort) {
    parentPort.on('message', (data: { text: string; requestId: string }) => {
        try {
            const ranges = parser.parse(data.text);
            parentPort?.postMessage({
                requestId: data.requestId,
                ranges: ranges
            });
        } catch (error) {
            parentPort?.postMessage({
                requestId: data.requestId,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
}
