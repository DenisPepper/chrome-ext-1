// в content.js (который работает прямо на странице сайта) стандартные ESM-импорты через манифест до сих пор официально
// не поддерживаются из коробки, там логика подключения модулей немного сложнее.

function addTabChecking(fn) {
  return function (...args) {
    // Игнорируем, если вкладка не активна или не видна
    if (document.hidden) return;
    // Игнорируем iframe (если нужно)
    if (window !== window.top) return;
    fn.apply(this, args);
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