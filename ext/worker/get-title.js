import { getActiveTab, isInjectableTab } from './util/tabs.js';

export async function handleGetTitle() {
    const tab = await getActiveTab();
    if (!isInjectableTab(tab)) throw new Error("not injectable tab");

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['ext/inject/get-title.js']
    });

    return results[0].result;
}