import * as vscode from 'vscode';

import { PackageContext } from '../../shared/interfaces/package-context.js';
import { CANCEL } from '../../settings/constants.js';

export default async function showPackageQuickPick(searchResults: PackageContext[]): Promise<PackageContext> {
    const packageNames = searchResults.map(p => p.name);

    const selectedPackageName = await vscode.window.showQuickPick(packageNames);
    const selectedPackage = searchResults.find(p => p.name === selectedPackageName);

    if (selectedPackage) {
        selectedPackage.selectedPackageName = selectedPackageName;
    }

    if (!selectedPackage) {
        return Promise.reject(CANCEL);
    }

    return Promise.resolve(selectedPackage);
}
