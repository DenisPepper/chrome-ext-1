// в content.js (который работает прямо на странице сайта) стандартные ESM-импорты через манифест до сих пор официально
// не поддерживаются из коробки, там логика подключения модулей немного сложнее.

/* 
Вот сокращенный список главных задач content.js, определяющих его системную функциональность:
1. Запуск до отрисовки (document_start) — внедрение в страницу до загрузки ее HTML и выполнения скриптов сайта [исх. 2].
2. Встраивание элементов (UI Injection) — добавление кастомных кнопок, баннеров и виджетов прямо в интерфейс сайта.
3. Автономная жизнь — непрерывная работа внутри вкладки, даже когда боковая панель полностью закрыта.
4. Постоянный мониторинг — непрерывное отслеживание изменений на сайте через MutationObserver (например, для автоперевода новых сообщений).
5. Перехват действий пользователя — постоянный контроль событий ввода текста (input), копирования (copy) или фокуса на элементах.
6. Внедрение стилей — изоляция интерфейса расширения внутри страницы с помощью Shadow DOM.
*/

export function isTargetPage(target) {
  const element = document.querySelector(".pageheadtext");
  if (!element) return false;
  const text = element.innerText.trim();
  return text === target;
}

function addTabChecking(fn) {
  return function (message, sender, sendResponse, ...args) {
    // Игнорируем, если вкладка не активна или не видна
    if (document.hidden || window !== window.top) {
      sendResponse({ ignored: true, reason: document.hidden ? 'hidden' : 'iframe' });
      return true;
    }
    return fn(message, sender, sendResponse, ...args);
  };
}

const handlers = {
  UPDATE_CONTENT_CONFIG: (message, sender, sendResponse) => {
    console.log('Получены данные от Service Worker', message.data);
    sendResponse({ received: true });
    return true;
  },

  FETCH_WITH_COOKIES: (message, sender, sendResponse) => {
    fetch(message.url, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
      })
      .then((data) => sendResponse({ success: true, data: data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));

    return true;
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handler = handlers[message.action];
  if (!handler) {
    sendResponse({ error: 'Unknown action' });
    return true;
  }

  const wrappedHandler = addTabChecking(handler);
  return wrappedHandler(message, sender, sendResponse);
});

chrome.runtime.sendMessage({ action: "CONTENT_SCRIPT_READY" });