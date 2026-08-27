import { getActiveTab, isInjectableTab } from './tabs.js';

export async function injectScript(filePath) {
    const tab = await getActiveTab();

    if (!isInjectableTab(tab)) {
        throw new Error('Вкладка не подходит для внедрения скрипта');
    }

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [filePath]
    });

    return results[0].result;
}

export async function injectFunction(func, args = []) {
    const tab = await getActiveTab();

    if (!isInjectableTab(tab)) {
        throw new Error('Вкладка не подходит для внедрения скрипта');
    }

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: func,
        args: args
    });

    return results[0].result;
}