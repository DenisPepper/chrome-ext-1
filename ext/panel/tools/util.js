export const logit = (msg) => {
  console.log(msg);
};

/**
 * Возвращает активную вкладку в последнем сфокусированном окне браузера.
 * @returns {Promise<chrome.tabs.Tab | null>}
 */
export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab && tab.id ? tab : null;
}

/**
 * Проверяет, можно ли внедрять скрипты в данную вкладку.
 * @param {chrome.tabs.Tab | null} tab - Объект вкладки.
 * @returns {boolean}
 */
export function isInjectableTab(tab) {
  if (!tab || !tab.url || !tab.id) return false;

  try {
    const url = new URL(tab.url);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

export function getPageTitle() {
  // Этот код выполнится на странице и вернет результат
  const titleTag = document.querySelector("head title");
  return titleTag ? titleTag.textContent : "no title on this page";
}