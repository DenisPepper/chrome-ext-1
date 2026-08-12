import { EventStore } from "./common/event-store.js"

// фоновый скрипт (Service Worker)


// Разрешаем открывать боковую панель по клику на иконку расширения
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Ошибка активации панели:", error));


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "CONTENT_SCRIPT_READY") {
    const tabId = sender.tab.id;
    chrome.tabs.sendMessage(tabId, {
      action: "UPDATE_CONTENT_CONFIG",
      data: { es: EventStore }
    }).catch(() => { });
  }
});