import * as vscode from 'vscode';
import * as qs from 'querystring';
import fetch, { Response as FetchResponse } from 'node-fetch';

import { getExtensionsConfigurationFeeds } from '../../shared/get-extension-configuration.js';
import { nugetSettings } from '../../settings/nuget-settings.js';
import getFetchOptions from '../../utils/get-fetch-options.js';
import { CANCEL, NOT_FOUND, PUBLIC_NUGET } from '../../settings/constants.js';
import { PackageContext } from '../../shared/interfaces/package-context.js';
import handleError from '../../utils/handle-error.js';


export default async function fetchNugetPackages({ feedName, input }: { feedName: string | undefined, input: string | undefined }): Promise<PackageContext[]> {
    if (!input || input === undefined) {
        // Search canceled.
        return Promise.reject(CANCEL);
    }

    vscode.window.setStatusBarMessage('Searching NuGet...');

    let response: FetchResponse;
    let json: any;

    if (feedName !== PUBLIC_NUGET) {
        const feeds = getExtensionsConfigurationFeeds();
        const feed = feeds.find(f => f.name === feedName);
        if (!feed) {
            return handleError<Promise<never>>(null, `Feed ${feedName} not found.`, Promise.reject.bind(Promise));
        }

        const organization = feed.org;

        let feedId: string;
        let feedsResponse = await fetch(`${nugetSettings.getFeedsUrl.replace('{organization}', organization)}`, getFetchOptions(feedName));
        if (!feedsResponse.ok) {
            return handleError<Promise<never>>(null, `Error connecting to feed: ${feedsResponse.statusText}`, Promise.reject.bind(Promise));
        }
        let feedData = await feedsResponse.json();

        feedId = feedData.value.find((f: any) => f.name === feedName).id;

        response = await fetch(`${nugetSettings.nugetAzureFeedUrl.replace('{organization}', organization).replace('{feedId}', feedId)}&packageNameQuery=${encodeURIComponent(input)}`, getFetchOptions(feedName));
        if (!response.ok) {
            return handleError<Promise<never>>(null, `Error searching NuGet: ${response.statusText}`, Promise.reject.bind(Promise));
        }
        json = await response.json();
    } else if (feedName === PUBLIC_NUGET) {

        const queryParams = qs.stringify({
            q: input,
            prerelease: 'true',
            take: '100'
        });

        response = await fetch(`${nugetSettings.nugetSearchUrl}?${queryParams}`, getFetchOptions());
        if (!response.ok) {
            return handleError<Promise<never>>(null, `Error searching NuGet: ${response.statusText}`, Promise.reject.bind(Promise));
        }
        json = await response.json();

        const data = json.data.map((p: any) => ({ name: p }));

        if (data.length === 0) {
            return Promise.reject(NOT_FOUND);
        }

        return Promise.resolve(data);
    }

    const searchResults = json.value.map((p: any) => ({ name: p.name, azurePackageId: p.id, packageUrl: p.url, feedName: feedName, isAzureFeedPackage: true }));

    if (searchResults.length === 0) {
        return Promise.reject(NOT_FOUND);
    }

    return Promise.resolve(searchResults);
}