import * as vscode from 'vscode';

import { CANCEL, NOT_FOUND } from '../settings/constants.js';
import { clearStatusBar } from '../shared/index.js';
import {
    showSearchBox,
    fetchPackages,
    showPackageQuickPick,
    fetchPackageVersions,
    showVersionsQuickPick,
    showFeedQuickPick,
    installNuGetPackage
} from './add-commands/index.js';
import showCSProjQuickPick from '../shared/show-csproj-quick-pick.js';
import { PackageContext } from '../shared/interfaces/package-context.js';

function searchAndFetchAggregate(feedName: string | undefined, statusText: string = 'Enter a package name or search term to search for a NuGet package'): Promise<PackageContext> {
    return Promise.resolve(showSearchBox(feedName, statusText))
        .then(fetchPackages)
        .then(showPackageQuickPick)
        .catch((err) => {
            if (err === NOT_FOUND) {
                const notFoundMessage = 'No matching results found. Please try again.';
                vscode.window.showWarningMessage(notFoundMessage);
                return searchAndFetchAggregate(feedName, notFoundMessage);
            } else {
                throw err;
            }
        }) as Promise<PackageContext>;
}

export function addNuGetPackage() {
    showFeedQuickPick()
        .then(searchAndFetchAggregate)
        .then(fetchPackageVersions)
        .then(showVersionsQuickPick)
        .then(showCSProjQuickPick)
        .then(installNuGetPackage)
        .then(undefined, (err) => {
            clearStatusBar();
            if (err !== CANCEL) {
                vscode.window.showErrorMessage(err.message || err || 'Something went wrong! Please try again.');
            }
        });
}