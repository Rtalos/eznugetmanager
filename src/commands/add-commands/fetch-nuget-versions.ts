import * as vscode from 'vscode';
import * as qs from 'querystring';
import fetch, { Response as FetchResponse } from 'node-fetch';

import clearStatusBar from '../../shared/clear-status-bar.js';
import { CANCEL } from '../../settings/constants.js';
import { nugetSettings } from '../../settings/nuget-settings.js';
import getFetchOptions from '../../utils/get-fetch-options.js';
import { PackageContext } from '../../shared/interfaces/package-context.js';

export default function fetchPackageVersions(packageContext: PackageContext): Promise<{ versions: any, packageContext: PackageContext }> {
    if (!packageContext.selectedPackageName) {
        // User has canceled the process.
        // TODO: need to test canceled flow
        return Promise.reject(CANCEL);
    }

    if (!packageContext) {
        return Promise.reject('No package context.');
    }

    if (!packageContext.selectedPackageName) {
        return Promise.reject('No package selected.');
    };

    vscode.window.setStatusBarMessage('Loading package versions...');

    return new Promise((resolve, reject) => {
        let versionsUrl: string;
        let fetchUrl: string = '';

        if (packageContext.selectedPackageName && !packageContext?.packageUrl) {
            versionsUrl = nugetSettings.nugetVersionsUrl;
            fetchUrl = `${versionsUrl}${packageContext.selectedPackageName.toLowerCase()}/index.json`;
        }

        if (packageContext && packageContext.packageUrl) {
            const queryParams = qs.stringify({
                isListed: 'true',
                includeAllVersions: 'true'
            });
            fetchUrl = `${packageContext.packageUrl}?${queryParams}`;
        }

        fetch(fetchUrl, packageContext ? getFetchOptions(packageContext.feedName) : getFetchOptions())
            .then((response: FetchResponse) => {
                clearStatusBar();
                if (!response.ok) {
                    reject('Error fetching package versions');
                }
                return response.json();
            })
            .then((json: any) => {
                if (packageContext?.isAzureFeedPackage) {
                    resolve({ versions: json.versions.map((version: any) => version.normalizedVersion), packageContext: packageContext });
                } else {
                    resolve({ versions: json.versions.map((version: any) => version).reverse(), packageContext: packageContext });
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}