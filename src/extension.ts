import * as vscode from 'vscode';
import { ParserManager } from './ParserManager';
import { Decorator } from './Decorator';

export function activate(context: vscode.ExtensionContext) {
    const parseManager = new ParserManager();
    const decorator = new Decorator(parseManager);

    const updateAll = (editor: vscode.TextEditor) => {
        if (editor.document.languageId === 'markdown') {
            parseManager.parse(editor.document);
        }
    };

    const updateView = (editor: vscode.TextEditor) => {
        if (editor.document.languageId === 'markdown') {
            decorator.applyDecorations(editor);
        }
    };

    // Toggle Commands
    context.subscriptions.push(
        vscode.commands.registerCommand('obsidian-md-inline.toggleDecorations', () => {
            const enabled = !vscode.workspace.getConfiguration().get('obsidianMdInline.hideSyntaxMarkers');
            vscode.workspace.getConfiguration().update('obsidianMdInline.hideSyntaxMarkers', enabled, vscode.ConfigurationTarget.Global);
        }),
        vscode.commands.registerCommand('obsidian-md-inline.renderMode', () => {
            vscode.workspace.getConfiguration().update('obsidianMdInline.hideSyntaxMarkers', true, vscode.ConfigurationTarget.Global);
        }),
        vscode.commands.registerCommand('obsidian-md-inline.rawMode', () => {
            vscode.workspace.getConfiguration().update('obsidianMdInline.hideSyntaxMarkers', false, vscode.ConfigurationTarget.Global);
        })
    );

    // Config Listener
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('obsidianMdInline.hideSyntaxMarkers')) {
            const enabled = vscode.workspace.getConfiguration().get<boolean>('obsidianMdInline.hideSyntaxMarkers') ?? true;
            vscode.commands.executeCommand('setContext', 'obsidianMdInline.decorationsEnabled', enabled);
            decorator.updateConfig(enabled);
        }
    }));

    // Document & Editor Listeners
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateAll(editor);
            }
        }),
        vscode.workspace.onDidChangeTextDocument(e => {
            const editor = vscode.window.activeTextEditor;
            if (editor && e.document === editor.document) {
                updateAll(editor);
            }
        }),
        vscode.window.onDidChangeTextEditorSelection(e => {
            updateView(e.textEditor);
        }),
        vscode.window.onDidChangeTextEditorVisibleRanges(e => {
            updateView(e.textEditor);
        })
    );

    // Initial pass & Context check
    const config = vscode.workspace.getConfiguration();
    const defaultMode = config.get<string>('obsidianMdInline.defaultViewMode') ?? 'rendered';
    const initialEnabled = config.get<boolean>('obsidianMdInline.hideSyntaxMarkers') ?? (defaultMode === 'rendered');
    
    vscode.commands.executeCommand('setContext', 'obsidianMdInline.decorationsEnabled', initialEnabled);
    
    // Also update the config if hideSyntaxMarkers was undefined to ensure consistency
    if (config.get('obsidianMdInline.hideSyntaxMarkers') === undefined) {
        config.update('obsidianMdInline.hideSyntaxMarkers', initialEnabled, vscode.ConfigurationTarget.Global);
    }

    if (vscode.window.activeTextEditor) {
        updateAll(vscode.window.activeTextEditor);
    }

    context.subscriptions.push(parseManager, decorator);
}

export function deactivate() {}
