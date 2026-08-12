// в content.js (который работает прямо на странице сайта) стандартные ESM-импорты через манифест до сих пор официально
// не поддерживаются из коробки, там логика подключения модулей немного сложнее.

const useCopyButtonHandler = (es) => {
  window.addEventListener(es.TRIGGER_TITLE_CHECK, () => {
    // Игнорируем, если вкладка не активна или не видна
    if (document.hidden) return;

    // Игнорируем iframe (если нужно)
    if (window !== window.top) return;

    const titleTag = document.querySelector("head title");
    const msg = titleTag ? titleTag.textContent : "no title on this page";

    // Отправляем текст обратно в расширение (его поймает sidepanel.js)
    chrome.runtime.sendMessage({ action: es.RETURN_PAGE_TITLE, data: msg });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "UPDATE_CONTENT_CONFIG") {
    const { es } = message.data;
    useCopyButtonHandler(es)
  }
});

chrome.runtime.sendMessage({ action: "CONTENT_SCRIPT_READY" });