import * as vscode from 'vscode';

import { getExtensionsConfigurationFeeds } from '../../shared/get-extension-configuration.js';
import handleError from '../../utils/handle-error.js';
import { PUBLIC_NUGET } from '../../settings/constants.js';

const errorMessage = 'No feeds found. Please add a feed to your settings.json file.';

export default function showFeedQuickPick(): Thenable<string | undefined> | Promise<never> {

    const feeds = getExtensionsConfigurationFeeds();

    if (!feeds || feeds.length < 1) {
        return handleError<Promise<never>>(null, errorMessage, Promise.reject.bind(Promise));
    }

    let names = feeds.map(feed => feed.name);

    names.push(PUBLIC_NUGET);

    return vscode.window.showQuickPick(names);
}
