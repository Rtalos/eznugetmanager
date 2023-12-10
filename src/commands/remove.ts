//do I need to check where the package is installed?
import * as vscode from 'vscode';

import { CANCEL } from '../settings/constants.js';
import { clearStatusBar } from '../shared/index.js';
import uninstallNuGetPackage from './remove-commands/remove-nuget-package.js';
import showInstalledPackagesQuickPick from './remove-commands/show-installed-packages-quick-pick.js';
import showCSProjQuickPick from '../shared/show-csproj-quick-pick.js';

export function removeNuGetPackage() {
    showInstalledPackagesQuickPick()
        .then(showCSProjQuickPick)
        .then(uninstallNuGetPackage)
        .then(undefined, (err) => {
            clearStatusBar();
            if (err !== CANCEL) {
                vscode.window.showErrorMessage(err.message || err || 'Something went wrong! Please try again.');
            }
        });
}