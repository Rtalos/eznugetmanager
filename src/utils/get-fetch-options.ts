import * as vscode from 'vscode';
import * as url from 'url';
import { HttpsProxyAgent } from 'https-proxy-agent';

import { fetchSettings } from '../settings/fetch-settings.js';
import { getExtensionsConfigurationFeeds } from '../shared/get-extension-configuration.js';

// Cache a few things since this stuff will rarely change, and there's no need to recreate an agent
// if no change has occurred, etc.
let lastProxy = '';
let lastProxyStrictSSL: boolean | undefined;
let lastHttpsProxyAgent: any;

interface ProxyConfiguration {
    proxy?: string;
    proxyAuthorization?: string | null;
    proxyStrictSSL?: boolean;
}

export default function getFetchOptions(feedName?: string | undefined) {
    const { proxy, proxyAuthorization, proxyStrictSSL } = vscode.workspace.getConfiguration('http') || {} as ProxyConfiguration;
    const fetchOptions: any = { timeout: fetchSettings.responseTimeout };

    fetchOptions.headers = {};

    if (feedName !== undefined && typeof feedName === 'string') {
        const feeds = getExtensionsConfigurationFeeds();
        const feed = feeds.find(f => f.name === feedName);

        if (!feed) {
            throw new Error(`Could not find feed with name "${feedName}"`);
        }

        const pat = Buffer.from(':' + feed.pat).toString('base64');

        if (!pat) {
            throw new Error(`Could not find PAT for feed with name "${feedName}"`);
        }

        fetchOptions.headers['Authorization'] = 'Basic ' + pat;
    }

    if (!proxy) {
        lastProxy = '';
        return fetchOptions; // no proxy, so ignore everything but timeout
    }

    if (proxy === lastProxy && proxyStrictSSL === lastProxyStrictSSL) {
        fetchOptions.agent = lastHttpsProxyAgent;
    }
    else {
        const parsedProxy = url.parse(proxy);
        const useStrictSSL = !!proxyStrictSSL; // coerce to boolean just in case

        fetchOptions.agent = new HttpsProxyAgent(parsedProxy.href);

        fetchOptions.rejectUnauthorized = useStrictSSL;

        fetchOptions.agent.secureEndpoint = useStrictSSL;

        lastHttpsProxyAgent = fetchOptions.agent;
        lastProxyStrictSSL = proxyStrictSSL;
        lastProxy = proxy;
    }

    if (proxyAuthorization) {
        fetchOptions.headers['Proxy-Authorization'] = proxyAuthorization;
    }

    return fetchOptions;
}
