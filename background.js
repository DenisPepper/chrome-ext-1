import { EventStore } from "./common/event-store.js"

// фоновый скрипт (Service Worker)


// Разрешаем открывать боковую панель по клику на иконку расширения
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Ошибка активации панели:", error));


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, {
      action: "update-config",
      data: { es: EventStore }
    });
  }
});