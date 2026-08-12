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

  /*
  Метод chrome.scripting.executeScript используется:
   
  1. Запуск кода по требованию (On-Demand) — выполнение логики строго в нужный момент (например, по клику на кнопку в боковой панели), а не автоматически при загрузке страницы.
  2. Динамический выбор скрипта (Runtime) — возможность расширения на лету решать, какой именно код, в какую конкретно вкладку и при каких условиях нужно отправить прямо сейчас.
  3. Мгновенный сбор данных — срочное извлечение информации со страницы (текст, ссылки, метаданные) и возврат результата обратно в расширение через return функции.
  4. Взаимодействие с контекстом сайта (world: "MAIN") — внедрение кода напрямую в среду страницы для работы с её внутренними JS-переменными, функциями, библиотеками (React, Vue) или генерации событий.
  5. Внедрение кода на любые сайты (activeTab) — выполнение скриптов на страницах без необходимости запрашивать постоянный доступ ко всем сайтам в манифесте.

  */
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
