import * as vscode from 'vscode';

import { CANCEL } from '../../settings/constants.js';
import { PackageContext } from '../../shared/interfaces/package-context.js';

export default async function showVersionsQuickPick({ versions, packageContext }: { versions: any, packageContext: PackageContext }): Promise<any | never> {
    // TODO: This could probably use more error handling.
    const slicedVersions = versions.slice().concat('Latest version (Wildcard *)');

    const versionSelection = await vscode.window.showQuickPick(slicedVersions, { placeHolder: 'Select the version to add.' });

    if (!versionSelection) {
        // User canceled.
        return Promise.reject(CANCEL);
    }

    packageContext.version = versionSelection;

    return packageContext;
}