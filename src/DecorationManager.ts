import * as vscode from 'vscode';
import { DecorationType } from './MarkdownParser';

export class DecorationManager {
    private decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();

    constructor() {
        this.registerDecorations();
    }

    private registerDecorations() {
        // Hide - using font-size: 0px and transparent color is the reliable way to vanish markers
        this.decorationTypes.set('hide', vscode.window.createTextEditorDecorationType({
            textDecoration: 'none; font-size: 0px !important; letter-spacing: -1ch !important;',
            before: {
                contentText: '',
                width: '0'
            }
        }));

        // Formatting
        this.decorationTypes.set('bold', vscode.window.createTextEditorDecorationType({
            fontWeight: 'bold',
        }));
        this.decorationTypes.set('italic', vscode.window.createTextEditorDecorationType({
            fontStyle: 'italic'
        }));
        this.decorationTypes.set('strikethrough', vscode.window.createTextEditorDecorationType({
            textDecoration: 'line-through'
        }));
        this.decorationTypes.set('code', vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('textCodeBlock.background'),
            borderRadius: '2px',
            textDecoration: 'none; display: inline-block !important;' // display: inline-block helps with background visibility
        }));
        this.decorationTypes.set('codeBlock', vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            backgroundColor: new vscode.ThemeColor('textCodeBlock.background'),
        }));
        this.decorationTypes.set('link', vscode.window.createTextEditorDecorationType({
            color: new vscode.ThemeColor('textLink.foreground'),
            textDecoration: 'underline'
        }));
        this.decorationTypes.set('image', vscode.window.createTextEditorDecorationType({
            opacity: '0',
            textDecoration: 'none; color: transparent !important; font-size: 0px;',
        }));

        // blockquote
        this.decorationTypes.set('blockquote_bg', vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(128, 128, 128, 0.05)',
            isWholeLine: true
        }));
        this.decorationTypes.set('blockquote_marker', vscode.window.createTextEditorDecorationType({
            textDecoration: 'none; color: transparent !important; display: inline-block; border-left: 6px solid #40a9ff;'
        }));

        // Lists
        this.decorationTypes.set('ul_bullet_1', vscode.window.createTextEditorDecorationType({
            before: {
                contentText: '●',
                color: new vscode.ThemeColor('editor.foreground'),
                textDecoration: 'none; display: inline-block; vertical-align: middle; margin-right: 0.5em;'
            }
        }));
        this.decorationTypes.set('ul_bullet_2', vscode.window.createTextEditorDecorationType({
            before: {
                contentText: '○',
                color: new vscode.ThemeColor('editor.foreground'),
                textDecoration: 'none; display: inline-block; vertical-align: middle; margin-right: 0.5em;'
            }
        }));
        this.decorationTypes.set('ul_bullet_3', vscode.window.createTextEditorDecorationType({
            before: {
                contentText: '■',
                color: new vscode.ThemeColor('editor.foreground'),
                textDecoration: 'none; display: inline-block; vertical-align: middle; margin-right: 0.5em;'
            }
        }));
        this.decorationTypes.set('ul_bullet_4', vscode.window.createTextEditorDecorationType({
            before: {
                contentText: '□',
                color: new vscode.ThemeColor('editor.foreground'),
                textDecoration: 'none; display: inline-block; vertical-align: middle; margin-right: 0.5em;'
            }
        }));

        // Headings
        this.decorationTypes.set('heading1', vscode.window.createTextEditorDecorationType({
            fontWeight: 'bold',
            color: new vscode.ThemeColor('symbolIcon.classForeground'),
            textDecoration: 'none; font-size: 2rem !important;',
            before: {
                contentText: 'H1',
                fontWeight: 'bold',
                color: '#888888',
                margin: '0 5px 0 0'
            },
        }));
        this.decorationTypes.set('heading2', vscode.window.createTextEditorDecorationType({
            fontWeight: 'bold',
            color: new vscode.ThemeColor('symbolIcon.classForeground'),
            textDecoration: 'none; font-size: 1.5em !important;'
        }));
        this.decorationTypes.set('heading3', vscode.window.createTextEditorDecorationType({
            fontWeight: 'bold',
            color: new vscode.ThemeColor('symbolIcon.classForeground'),
            textDecoration: 'none; font-size: 1.17em !important;'
        }));
        this.decorationTypes.set('heading4', vscode.window.createTextEditorDecorationType({
            fontWeight: 'bold'
        }));
        this.decorationTypes.set('heading5', vscode.window.createTextEditorDecorationType({
            fontWeight: 'bold',
            textDecoration: 'none; font-size: 0.83em !important;'
        }));
        this.decorationTypes.set('heading6', vscode.window.createTextEditorDecorationType({
            before: {
                contentText: 'H6',
                fontWeight: 'bold',
                color: '#888888',
                margin: '0 5px 0 0'
            },
            fontWeight: 'bold',
            textDecoration: 'none; font-size: 0.67em !important;'
        }));

        // HR
        this.decorationTypes.set('hr', vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            after: {
                contentText: '',
                textDecoration: `none; font-size: 0px; display: inline-block; position: absolute; bottom: 50%; width: 100vw; height: 10%; background-color: #666;`,
            }
        }));
    }

    public getDynamicTableCellDecoration(diff: number, align?: string, empty?: boolean, isHeader?: boolean): string {
        const alg = align || 'left';
        const key = `tableCell-d${diff}-${alg}${empty ? '-empty' : ''}${isHeader ? '-head' : ''}`;

        if (this.decorationTypes.has(key)) return key;

        const half = alg === 'center' ? Math.floor(diff / 2) : 0;
        const leftPad = 2 + (alg === 'right' ? diff : alg === 'center' ? half : 0);
        const rightPad = 2 + (alg === 'right' ? 0 : alg === 'center' ? diff - half : diff);

        const borderStyle = isHeader
            ? 'none; padding-bottom: 6px; box-sizing: border-box; vertical-align: middle; font-weight: bold;'
            : 'none; padding-bottom: 0px; box-sizing: border-box; vertical-align: middle;';

        const spacer = (n: number) => ({
            contentText: '\u00A0'.repeat(n),
            textDecoration: borderStyle
        });

        const decOpts: vscode.DecorationRenderOptions = {
            textDecoration: borderStyle,
            ...(empty && { color: 'transparent' }),
            ...(leftPad > 0 && { before: spacer(leftPad) }),
            ...(rightPad > 0 && { after: spacer(rightPad) }),
        };

        this.decorationTypes.set(key, vscode.window.createTextEditorDecorationType(decOpts));
        return key;
    }

    public getDynamicTableHeaderRowDecoration(width: number): string {
        const key = `tableHeaderRow-w${width}`;
        if (this.decorationTypes.has(key)) return key;

        this.decorationTypes.set(key, vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            textDecoration: 'none; font-size: 0px !important; letter-spacing: -1ch !important;',
            before: {
                contentText: '',
                // ch 단위를 사용하여 테이블 너비만큼만 선이 그려지도록 설정
                textDecoration: `none; display: inline-block; position: absolute; width: ${width}ch; border-top: 8px double #666; top: 30%;`,
            }
        }));
        return key;
    }

    public getDynamicTableRowDecoration(width: number): string {
        const key = `tableRow-w${width}`;
        if (this.decorationTypes.has(key)) return key;

        this.decorationTypes.set(key, vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            before: {
                contentText: '',
                textDecoration: `none; display: inline-block; position: absolute; width: ${width}ch; border-top: 1px solid #666; top: 0;`,
            }
        }));
        return key;
    }

    public getDecorationType(type: string): vscode.TextEditorDecorationType | undefined {
        return this.decorationTypes.get(type);
    }

    public getAllDecorationTypes(): IterableIterator<vscode.TextEditorDecorationType> {
        return this.decorationTypes.values();
    }

    public getTypes(): IterableIterator<string> {
        return this.decorationTypes.keys();
    }

    public dispose() {
        for (const dt of this.decorationTypes.values()) {
            dt.dispose();
        }
        this.decorationTypes.clear();
    }
}
