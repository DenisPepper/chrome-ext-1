import { injectScript, injectFunction } from '../util/scripting.js';

// Этот код выполняется в контексте страницы.
// Аргументы передаются через массив args в executeScript.
async function getUrlWithPrefix(prefix) {
    try {
        const res = await fetch('https://cad.stilkuhni.com/ecadweb/BaseElements/ViewElementLimits?type=1&t=1732&e=22224', {
            credentials: "include",
        });
        const text = await res.text();
        return `${prefix}: ${window.location.href} | ${text.slice(0, 10)}`;
    } catch (error) {
        return null;
    }
}

export async function copyPageData(payload) {
    // 1. Заголовок получаем через файл (аргументы не нужны)
    const title = await injectScript('ext/inject/get-title.js');

    // 2. URL получаем через функцию, передавая аргумент из панели
    const prefix = payload?.prefix || 'Default';
    const url = await injectFunction(getUrlWithPrefix, [prefix]);

    return `${url} | ${title}`;
}