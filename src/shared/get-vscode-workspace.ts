// activeWorkspace.ts
import * as vscode from 'vscode';

export function getActiveWorkspaceFolder(): Promise<vscode.WorkspaceFolder> {
    return new Promise((resolve, reject) => {
        let workspaceFolder = undefined;
        let activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            workspaceFolder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
        }

        if (workspaceFolder === undefined) {
            reject('No workspace is open.');
        } else {
            resolve(workspaceFolder);
        }
    });
}