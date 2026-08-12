import { logit } from "./tools/util.js";
import { EventStore as es } from "./common/event-store.js";

// тяжёлые вычисления размещать здесь
// очень тяжёлые передаем в web worker

// Слушаем сообщения от content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === es.RETURN_PAGE_TITLE) {
    logit(`Получен заголовок страницы: ${message.data}`);
  }
});

document.getElementById("show-title").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Проверяем, существует ли вкладка и есть ли у нее URL
  if (!tab || !tab.url) return;

  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      args: [es],
      // ключ args ☝️ передает массив аргументов в callback-функцию ключа func 👇
      // это нужно потому что, callback-функця ключа func исполняется в изолированном контексте
      // не видит импорты этого модуля и прочие идентификаторы
      func: (...args) => {
        const evs = args[0];
        window.dispatchEvent(new CustomEvent(evs.TRIGGER_TITLE_CHECK));
      },
    })
    .catch((err) => {
      // Дополнительный отлов любых других ошибок внедрения
      console.error("Ошибка внедрения скрипта:", err.message);
    });
});
