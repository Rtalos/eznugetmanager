import { PackageContext } from "../interfaces/package-context";

export class PackageContextImpl implements PackageContext {
    name: string;
    selectedPackageName?: string | undefined;
    azurePackageId?: string;
    packageUrl?: string;
    feedName?: string | undefined;
    isAzureFeedPackage?: boolean | undefined;
    version?: string | undefined;
    csprojPaths?: { [key: string]: string } | undefined;
    selectedCSProjs?: string[] | undefined;

    constructor(name: string, version: string) {
        this.name = name;
        this.version = version;
        this.csprojPaths = {};
    }
}