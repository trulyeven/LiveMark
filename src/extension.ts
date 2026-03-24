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
        vscode.commands.registerCommand('livemark.toggleDecorations', () => {
            const enabled = !vscode.workspace.getConfiguration().get('livemark.hideSyntaxMarkers');
            vscode.workspace.getConfiguration().update('livemark.hideSyntaxMarkers', enabled, vscode.ConfigurationTarget.Global);
        }),
        vscode.commands.registerCommand('livemark.renderMode', () => {
            vscode.workspace.getConfiguration().update('livemark.hideSyntaxMarkers', true, vscode.ConfigurationTarget.Global);
        }),
        vscode.commands.registerCommand('livemark.rawMode', () => {
            vscode.workspace.getConfiguration().update('livemark.hideSyntaxMarkers', false, vscode.ConfigurationTarget.Global);
        })
    );

    // Config Listener
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('livemark.hideSyntaxMarkers')) {
            const enabled = vscode.workspace.getConfiguration().get<boolean>('livemark.hideSyntaxMarkers') ?? true;
            vscode.commands.executeCommand('setContext', 'livemark.decorationsEnabled', enabled);
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
    const defaultMode = config.get<string>('livemark.defaultViewMode') ?? 'rendered';
    const initialEnabled = config.get<boolean>('livemark.hideSyntaxMarkers') ?? (defaultMode === 'rendered');

    vscode.commands.executeCommand('setContext', 'livemark.decorationsEnabled', initialEnabled);

    // Also update the config if hideSyntaxMarkers was undefined to ensure consistency
    if (config.get('livemark.hideSyntaxMarkers') === undefined) {
        config.update('livemark.hideSyntaxMarkers', initialEnabled, vscode.ConfigurationTarget.Global);
    }

    if (vscode.window.activeTextEditor) {
        updateAll(vscode.window.activeTextEditor);
    }

    context.subscriptions.push(parseManager, decorator);
}

export function deactivate() { }
