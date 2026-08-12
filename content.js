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
    fn(...args);
  };
}

const useCopyButtonHandler = (es) => {
  const fn = () => {
    const titleTag = document.querySelector("head title");
    const msg = titleTag ? titleTag.textContent : "no title on this page";
    chrome.runtime.sendMessage({ action: es.RETURN_PAGE_TITLE, data: msg });
  }
  const handler = addTabChecking(fn)
  window.addEventListener(es.TRIGGER_TITLE_CHECK, handler);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "UPDATE_CONTENT_CONFIG") {
    const { es } = message.data;
    useCopyButtonHandler(es)
  }
});

chrome.runtime.sendMessage({ action: "CONTENT_SCRIPT_READY" });