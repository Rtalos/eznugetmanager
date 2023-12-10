import * as vscode from 'vscode';
import clearStatusBar from './clear-status-bar.js';

const showInformationMessage = vscode.window.showInformationMessage.bind(vscode.window);

export {
    clearStatusBar,
    showInformationMessage,
};