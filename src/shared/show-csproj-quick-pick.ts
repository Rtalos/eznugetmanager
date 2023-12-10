
import * as vscode from 'vscode';
import * as path from 'path';

import handleError from '../utils/handle-error.js';
import { PackageContext } from './interfaces/package-context.js';
import { CANCEL, csProjGlobPattern } from '../settings/constants.js';

const errorMessage = 'No csproj found. Please try again.';

export default async function showCSProjQuickPick(packageContext: PackageContext): Promise<PackageContext> {

    let csprojFileDict: { [key: string]: string } = {};
    if (!packageContext.csprojPaths) {

        const csprojFiles = await vscode.workspace.findFiles(csProjGlobPattern);

        csprojFileDict = csprojFiles.reduce((dict: any, f) => {
            const basename = path.basename(f.fsPath);
            dict[basename] = f.fsPath;
            return dict;
        }, {});
    }

    csprojFileDict = !packageContext.csprojPaths ? csprojFileDict : packageContext.csprojPaths;

    const csprojFileNames = Object.keys(csprojFileDict);

    if (csprojFileNames.length === 0) {
        return handleError<Promise<never>>(null, errorMessage, Promise.reject.bind(Promise));
    }

    const selectedCSProjs = await vscode.window.showQuickPick(csprojFileNames, { canPickMany: true });

    if (!selectedCSProjs) {
        return Promise.reject(CANCEL);
    }

    packageContext.selectedCSProjs = selectedCSProjs.map(name => csprojFileDict[name]);

    return Promise.resolve(packageContext);
}
