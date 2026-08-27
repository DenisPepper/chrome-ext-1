
import { handleGetTitle } from './get-title.js';

/* 
фоновый скрипт (Service Worker)

В расширениях Manifest V3 Service Worker выполняет роль центрального диспетчера и решает следующие задачи:
1. Маршрутизация сообщений: Пересылка данных между изолированными контекстами (Content Scripts, Side Panel, Popup).
2. Реакция на события браузера: Обработка системных триггеров (обновление вкладок, изменение истории, клики по иконке расширения, переключение окон).
3. Фоновая синхронизация: Загрузка/отправка данных на удаленный сервер в фоновом режиме.
4. Управление жизненным циклом: Первичная инициализация расширения, миграция данных при обновлении версии (chrome.runtime.onInstalled).
5. Контроль контекстных меню: Динамическое создание и обработка кликов по пунктам меню правой кнопки мыши (chrome.contextMenus).
5. Запуск фоновых таймеров: Планирование периодических задач с помощью chrome.alarms (взамен setInterval).
*/


// Разрешаем открывать боковую панель по клику на иконку расширения
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Ошибка активации панели:", error));


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "CONTENT_SCRIPT_READY") {
    const tabId = sender.tab.id;
    chrome.tabs.sendMessage(tabId, {
      action: "UPDATE_CONTENT_CONFIG",
      data: { meta: 'Service Worker data' }
    }).catch(() => { });
  }
  if (message.action === 'COPY_PAGE_DATA') {
    (async () => {
      try {
        const title = await handleGetTitle();
        sendResponse({ success: true, title });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    // ВАЖНО: возвращаем true, чтобы оставить канал сообщений открытым 
    // для асинхронного ответа (sendResponse)
    return true;
  }
});