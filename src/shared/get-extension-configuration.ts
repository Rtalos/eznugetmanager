import * as vscode from 'vscode';

interface Feed {
    name: string;
    org: string;
    project: string;
    pat: string;
}

export function getExtensionsConfigurationFeeds() : Feed[] {
    let config = vscode.workspace.getConfiguration('ezNuget');

    if (!config) {
        return [];
    }

    let feeds: Feed[] = config.azure.feeds.map((feed: vscode.WorkspaceConfiguration) => {
        return {
            name: feed['ezNuget.azure.feeds.name'],
            org: feed['ezNuget.azure.feeds.org'],
            project: feed['ezNuget.azure.feeds.project'],
            pat: feed['ezNuget.azure.feeds.pat']
        };
    });

    return feeds as Feed[];
}