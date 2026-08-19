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

function addTabChecking(fn) {
  return function (...args) {
    // Игнорируем, если вкладка не активна или не видна
    if (document.hidden) return;
    // Игнорируем iframe (если нужно)
    if (window !== window.top) return;
    return fn(...args);
  };
}

const useFetch = (message, sender, sendResponse) => {
  const fn = () => {
    fetch(message.url, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text(); // или res.json(), если там API
      })
      .then((data) => sendResponse({ success: true, data: data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));

    return true; // Важно! Говорит браузеру, что ответ будет асинхронным
  }

  const handler = addTabChecking(fn);
  return handler()
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "UPDATE_CONTENT_CONFIG") {
    console.log('Полученны данные от Service Worker', message.data);
  }

  if (message.action === "FETCH_WITH_COOKIES") {
    return useFetch(message, sender, sendResponse);
  }
});

chrome.runtime.sendMessage({ action: "CONTENT_SCRIPT_READY" });