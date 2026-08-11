// в content.js (который работает прямо на странице сайта) стандартные ESM-импорты через манифест до сих пор официально
// не поддерживаются из коробки, там логика подключения модулей немного сложнее.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "update-config") {
    //const { es } = message.data;
    console.dir(message.data);
    // Здесь только читаем, не патчим window
  }
});

window.addEventListener("trigger-title-check", () => {
  // Игнорируем, если вкладка не активна или не видна
  if (document.hidden) return;

  // Игнорируем iframe (если нужно)
  if (window !== window.top) return;

  const titleTag = document.querySelector("head title");
  const msg = titleTag ? titleTag.textContent : "no title on this page";

  // Отправляем текст обратно в расширение (его поймает sidepanel.js)
  chrome.runtime.sendMessage({ action: "send-title", data: msg });
});


chrome.runtime.sendMessage({ action: "ready-for-action" });