export async function handleGetTitle() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
        throw new Error('Активная вкладка не найдена');
    }

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['ext/inject/get-title.js']
    });

    return results[0].result;
}