import * as vscode from 'vscode';
import { ParserManager } from './ParserManager';
import { DecorationManager } from './DecorationManager';
import { DecorationRange, DecorationType } from './MarkdownParser';

export class Decorator {
    private decorationManager: DecorationManager;
    private parseManager: ParserManager;
    private enabled: boolean = true;
    private perfStatusBar: vscode.StatusBarItem;

    constructor(parseManager: ParserManager) {
        this.parseManager = parseManager;
        this.decorationManager = new DecorationManager();

        this.perfStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.perfStatusBar.text = "$(dashboard) MD Perf";
        this.perfStatusBar.show();

        this.enabled = vscode.workspace.getConfiguration().get<boolean>('livemark.hideSyntaxMarkers') ?? true;

        // Register to parse events
        this.parseManager.onDidParse(({ uri }) => {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.uri.toString() === uri.toString()) {
                this.applyDecorations(editor);
            }
        });
    }

    public updateConfig(enabled: boolean) {
        this.enabled = enabled;
        if (vscode.window.activeTextEditor) {
            this.applyDecorations(vscode.window.activeTextEditor);
        }
    }

    public applyDecorations(editor: vscode.TextEditor) {
        if (!this.enabled || editor.document.languageId !== 'markdown') {
            this.clearDecorations(editor);
            return;
        }

        const startPerf = performance.now();
        const document = editor.document;
        const ranges = this.parseManager.getRanges(document);

        // Wait for updated parse results to avoid applying unaligned decorations
        if (!ranges) {
            return;
        }

        const visibleRanges = editor.visibleRanges;
        const selections = editor.selections;

        // Grouping logic
        const categorizedRanges = new Map<string, (vscode.Range | vscode.DecorationOptions)[]>();
        for (const type of this.decorationManager.getTypes()) {
            categorizedRanges.set(type, []);
        }

        // Optimize VS Code API calls by pre-calculating selection offsets once
        const selOffsets = selections.map(sel => ({
            start: document.offsetAt(sel.start),
            end: document.offsetAt(sel.end)
        }));

        // Active range check helper (Optimized for performance: 0 allocations inside loop)
        const isRangeActive = (range: DecorationRange): boolean => {
            const rangeStart = range.activeRangeStart ?? range.startPos;
            const rangeEnd = range.activeRangeEnd ?? range.endPos;
            for (let i = 0; i < selOffsets.length; i++) {
                if (selOffsets[i].start <= rangeEnd && selOffsets[i].end >= rangeStart) {
                    return true;
                }
            }
            return false;
        };

        const activeBlockIds = new Set<string>();
        for (const range of ranges) {
            if (range.blockId && isRangeActive(range)) {
                activeBlockIds.add(range.blockId);
            }
        }
        for (const range of ranges) {
            // Viewport Optimization
            const isVisible = visibleRanges.some(vr => {
                return (range.startLine >= vr.start.line - 50 && range.startLine <= vr.end.line + 50);
            });

            if (!isVisible && !this.isPersistentType(range.type)) {
                continue;
            }

            const isActive = isRangeActive(range) || (range.blockId && activeBlockIds.has(range.blockId));
            if (isActive) {
                continue; // Raw State
            }

            // Fast tracking positionAt, instead of calling expensive VSCode document.positionAt 
            // thousands of times, use document.positionAt since it's locally fast enough usually, 
            // but store the result directly instead of making an object right away.
            const vsRange = new vscode.Range(
                document.positionAt(range.startPos),
                document.positionAt(range.endPos)
            );

            if (range.type === 'image' && range.metadata?.url) {
                this.pushImageDecoration(categorizedRanges, vsRange, range, document);
            } else if (range.type === 'link' && range.metadata?.url) {
                this.pushLinkDecoration(categorizedRanges, vsRange, range);
            } else if (range.type === 'tableCell') {
                const decType = this.decorationManager.getDynamicTableCellDecoration(
                    range.metadata?.diff || 0,
                    range.metadata?.align,
                    range.metadata?.empty,
                    range.metadata?.isHeader
                );
                if (!categorizedRanges.has(decType)) {
                    categorizedRanges.set(decType, []);
                }
                categorizedRanges.get(decType)?.push(vsRange);
            } else if (range.type === 'tableHeaderRow') {
                const decType = this.decorationManager.getDynamicTableHeaderRowDecoration(
                    range.metadata?.totalWidth || 100
                );
                if (!categorizedRanges.has(decType)) {
                    categorizedRanges.set(decType, []);
                }
                categorizedRanges.get(decType)?.push(vsRange);
            } else if (range.type === 'tableRow') {
                const decType = this.decorationManager.getDynamicTableRowDecoration(
                    range.metadata?.totalWidth || 100
                );
                if (!categorizedRanges.has(decType)) {
                    categorizedRanges.set(decType, []);
                }
                categorizedRanges.get(decType)?.push(vsRange);
            } else {
                categorizedRanges.get(range.type)?.push(vsRange);
            }
        }

        // Apply to editor
        for (const [type, typeRanges] of categorizedRanges.entries()) {
            const decorationType = this.decorationManager.getDecorationType(type);
            if (decorationType) {
                editor.setDecorations(decorationType, typeRanges as any);
            }
        }

        this.updatePerfStatus(startPerf);
    }

    private isPersistentType(type: DecorationType): boolean {
        return ['codeBlock', 'table', 'blockquote_bg', 'hr'].includes(type);
    }

    private pushImageDecoration(categorized: Map<any, any>, vsRange: vscode.Range, range: DecorationRange, document: vscode.TextDocument) {
        const url = range.metadata.url;
        const imageUri = this.resolveImageUri(document, url);
        const altText = range.metadata.alt || 'image';

        categorized.get('image')?.push({
            range: vsRange,
            renderOptions: {
                before: {
                    contentText: `🖼️${altText}`,
                    color: new vscode.ThemeColor('editor.foreground'),
                    margin: '0 4px',
                    textDecoration: 'none; border-bottom: 1px dotted; font-size: 13px !important;'
                }
            },
            hoverMessage: imageUri ? new vscode.MarkdownString(`![preview](${imageUri})\n\n${url}`) : url
        });
    }

    private pushLinkDecoration(categorized: Map<any, any>, vsRange: vscode.Range, range: DecorationRange) {
        categorized.get('link')?.push({
            range: vsRange,
            hoverMessage: new vscode.MarkdownString(range.metadata.url)
        });
    }

    private resolveImageUri(document: vscode.TextDocument, url: string): vscode.Uri | undefined {
        try {
            if (url.startsWith('http')) {
                return vscode.Uri.parse(url);
            }
            return vscode.Uri.joinPath(vscode.Uri.joinPath(document.uri, '..'), url);
        } catch {
            return undefined;
        }
    }

    private clearDecorations(editor: vscode.TextEditor) {
        for (const decorationType of this.decorationManager.getAllDecorationTypes()) {
            editor.setDecorations(decorationType, []);
        }
        this.perfStatusBar.text = `$(dashboard) MD: Off`;
    }

    private updatePerfStatus(startPerf: number) {
        const duration = Math.round(performance.now() - startPerf);
        const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        this.perfStatusBar.text = `$(dashboard) MD: ${duration}ms | ${mem}MB`;
    }

    public dispose() {
        this.decorationManager.dispose();
        this.perfStatusBar.dispose();
    }
}
