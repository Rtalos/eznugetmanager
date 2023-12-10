import * as vscode from 'vscode';

import * as util from 'util';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { PackageContext } from '../../shared/interfaces/package-context';
import { PackageContextImpl } from '../../shared/implementations/package-context-impl';
import { CANCEL, csProjGlobPattern } from '../../settings/constants';
import path from 'path';

interface PackageReference {
    $: {
        Include: string;
        Version: string;
    };
}

interface ItemGroup {
    PackageReference?: PackageReference[];
}

interface Project {
    ItemGroup: ItemGroup[];
}

interface Result {
    Project: Project;
}

export default async function showInstalledPackagesQuickPick(): Promise<PackageContext> {
    const readFile = util.promisify(fs.readFile);
    const parseString = util.promisify(xml2js.parseString);

    const csprojFiles = await vscode.workspace.findFiles(csProjGlobPattern);

    if (csprojFiles.length === 0) {
        return Promise.reject(new Error('No csproj found. Please try again.'));
    }

    const csprojFileDict: { [key: string]: string } = csprojFiles.reduce((dict: any, f) => {
        const basename = path.basename(f.fsPath);
        dict[basename] = f.fsPath;
        return dict;
    }, {});

    let packageContexts: PackageContext[] = [];
    for (const [key, csProjPath] of Object.entries(csprojFileDict)) {
        const data = await readFile(csProjPath);
        const result = await parseString(data.toString()) as Result;
        const packageReferences = result['Project']['ItemGroup'].flatMap(itemGroup => itemGroup['PackageReference'] || []);
        const packages = packageReferences.map(ref => ({
            name: ref['$'].Include,
            version: ref['$'].Version
        }));

        //TODO: this will overwrite the version if the package is already added
        for (const pkg of packages) {
            if (packageContexts.some(pc => pc.name === pkg.name)) {
                const packageContext = packageContexts.find(pc => pc.name === pkg.name);

                if (packageContext && packageContext?.csprojPaths) {
                    packageContext.csprojPaths[key] = csProjPath;
                }

                continue;
            }

            let packageContext = new PackageContextImpl(pkg.name, pkg.version);

            if (packageContext && packageContext?.csprojPaths) {
                packageContext.csprojPaths[key] = csProjPath;
            }

            packageContexts.push(packageContext);
        }
    }

    const selectedPackageName = await vscode.window.showQuickPick(packageContexts.map(pc => pc.name), { canPickMany: false });

    if (!selectedPackageName) {
        return Promise.reject(CANCEL);
    }

    const selectedPackage = packageContexts.find(pc => pc.name === selectedPackageName);

    if (!selectedPackage) {
        return Promise.reject(new Error('Something went wrong when searching for the package internally! Please try again.'));
    }

    selectedPackage.selectedPackageName = selectedPackageName;
    return Promise.resolve(selectedPackage);
}