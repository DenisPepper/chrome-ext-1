import { injectScript } from './util/scripting.js';

export async function handleGetTitle() {
    const title = await injectScript('ext/inject/get-title.js');
    const url = await injectScript('ext/inject/get-url.js');

    return `${url}: ${title}`;
}