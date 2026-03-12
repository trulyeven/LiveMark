import * as vscode from 'vscode';
import * as path from 'path';
import { Worker } from 'worker_threads';
import { MarkdownParser, DecorationRange } from './MarkdownParser';

export class ParserManager {
    private parser: MarkdownParser;
    private worker: Worker | undefined;
    private cache = new Map<string, { version: number; ranges: DecorationRange[] }>();
    private lastRequestId: number = 0;
    private onDidParseEmitter = new vscode.EventEmitter<{ uri: vscode.Uri; ranges: DecorationRange[] }>();
    public readonly onDidParse = this.onDidParseEmitter.event;

    constructor() {
        this.parser = new MarkdownParser();
        this.initWorker();
    }

    private initWorker() {
        try {
            const workerPath = path.join(__dirname, 'parserWorker.js');
            this.worker = new Worker(workerPath);
            this.worker.on('message', (data: { requestId: string; ranges?: DecorationRange[]; error?: string }) => {
                // Find the document associated with this request
                // In a real scenario, we'd map requestId to URI.
                // For now, we apply to active editor or use a map if we want to be robust.
                if (data.ranges) {
                    const activeEditor = vscode.window.activeTextEditor;
                    if (activeEditor) {
                        this.cache.set(activeEditor.document.uri.toString(), {
                            version: activeEditor.document.version,
                            ranges: data.ranges
                        });
                        this.onDidParseEmitter.fire({ uri: activeEditor.document.uri, ranges: data.ranges });
                    }
                }
            });
            this.worker.on('error', (err) => {
                console.error('Markdown Parser Worker Error:', err);
                this.worker = undefined;
            });
        } catch (err) {
            console.error('Failed to initialize Markdown Parser Worker:', err);
        }
    }

    public getRanges(document: vscode.TextDocument): DecorationRange[] | undefined {
        const cached = this.cache.get(document.uri.toString());
        if (cached && cached.version === document.version) {
            return cached.ranges;
        }

        // If not in cache or version mismatch, trigger parse
        this.parse(document);
        return undefined; // Do not return stale ranges, let VS Code naturally shift existing decorations
    }

    private parseTimeout: NodeJS.Timeout | undefined;

    public parse(document: vscode.TextDocument) {
        if (this.parseTimeout) {
            clearTimeout(this.parseTimeout);
        }

        this.parseTimeout = setTimeout(() => {
            const text = document.getText();
            if (this.worker) {
                this.lastRequestId++;
                this.worker.postMessage({
                    text: text,
                    requestId: String(this.lastRequestId)
                });
            } else {
                const ranges = this.parser.parse(text);
                this.cache.set(document.uri.toString(), { version: document.version, ranges });
                this.onDidParseEmitter.fire({ uri: document.uri, ranges });
            }
        }, 300); // 300ms debounce
    }

    public dispose() {
        if (this.worker) {
            this.worker.terminate();
        }
        this.onDidParseEmitter.dispose();
    }
}
