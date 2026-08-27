import { injectScript, injectFunction } from '../util/scripting.js';

function getUrlWithPrefix(prefix) {
    // Этот код выполняется в контексте страницы.
    // Аргументы передаются через массив args в executeScript.
    return `${prefix}: ${window.location.href}`;
}

export async function copyPageData(payload) {
    // 1. Заголовок получаем через файл (аргументы не нужны)
    const title = await injectScript('ext/inject/get-title.js');

    // 2. URL получаем через функцию, передавая аргумент из панели
    const prefix = payload?.prefix || 'Default';
    const url = await injectFunction(getUrlWithPrefix, [prefix]);

    return `${url} | ${title}`;
}