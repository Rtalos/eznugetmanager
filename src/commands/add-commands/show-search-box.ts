import * as vscode from 'vscode';
import { CANCEL } from '../../settings/constants';

export default function showSearchBox(feedName: string | undefined, statusText: string = 'Enter a package name or search term to search for a NuGet package'
): Thenable<{ feedName: string | undefined, input: string }> {
    if (feedName === undefined) {
        return Promise.reject(CANCEL);
    }

    let response = vscode.window.showInputBox({
        placeHolder: statusText
    });

    return response.then(input => ({ feedName, input: input || '' }));
}
