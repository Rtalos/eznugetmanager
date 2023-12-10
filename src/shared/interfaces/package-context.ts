export interface PackageContext {
    name: string;
    selectedPackageName?: string;
    azurePackageId?: string;
    packageUrl?: string;
    feedName?: string;
    isAzureFeedPackage?: boolean;
    version?: string;
    csprojPaths?: { [key: string]: string } | undefined;
    selectedCSProjs?: string[];
}