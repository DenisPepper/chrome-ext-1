const FIN_COPIER_KEY = "FIN_VARIANTS_DATA";
const COPIER_PROCESS_STATUS_KEY = "COPIER_PROCESS_STATUS";
const COPIER_CURRENT_INDEX_KEY = "COPIER_CURRENT_INDEX";
const COPIER_NEXT_INDEX_KEY = "COPIER_NEXT_INDEX";
const COPIER_EDIT_ID_STATUS_KEY = "COPIER_EDIT_ID_STATUS";
const COPIER_EDIT_ID_INDEX_KEY = "COPIER_EDIT_ID_INDEX";

function useMap() {
  return Object.create(null);
}

function getBlocks() {
  let id = "divfasads";
  let selector = `#${id} > ul > li`;
  const elements = document.querySelectorAll(selector);
  return elements ?? null;
}

function getBlockName(block) {
  const a = block.querySelector("a");
  return a ? a.textContent.trim() : "";
}

function getBlockLink(block) {
  const a = block.querySelector("a");
  return a ? a.href : "";
}

function getBlockEditLink(block) {
  let text = block.querySelector(".divbut").getAttribute("onclick");
  let link = text.split(";").at(2);
  return `https://${location.hostname}${link}`;
}

function isFolded(block) {
  const a = block.querySelector("a");
  return a.style.color === "gray";
}

function useReader(elm) {
  const obj = Object.create(null);
  obj.link = elm.querySelector("a").href;
  obj.code = elm.querySelector("a > span:nth-child(1)").textContent.trim();
  obj.mnemo = elm.querySelector("a > span:nth-child(2)").textContent.trim();
  obj.name = elm.querySelector("a > span:nth-child(3)").textContent.trim();
  return obj;
}

function getSourceList(block) {
  const next = block.nextElementSibling;
  if (!next || next.tagName !== "UL") return null;
  return next.children;
}

function readFins() {
  const result = [];
  const blocks = getBlocks();
  if (blocks === null) return null;
  for (const block of blocks) {
    const name = getBlockName(block);
    if (name.includes("Отделка | OTDELKA")) {
      const item = useMap();
      item.name = name;
      item.link = getBlockLink(block);
      item.editLink = getBlockEditLink(block);
      item.items = [];
      item.folded = isFolded(block);
      if (!item.folded) {
        item.sourceList = getSourceList(block);
      }
      result.push(item);
    }
  }
  return result;
}

async function useFetch(url) {
  try {
    const res = await fetch(url, {
      credentials: "include",
    });
    return await res.text();
  } catch (error) {
    return null;
  }
}

function readFinValues(doc) {
  const data = useMap();
  // price ID
  let sel = `#divdata > .sp-content > .tabledata td.tdval`;
  let td = doc.querySelector(sel);
  let text = td.firstChild.data.trim().split("(").at(0).trim();
  data.price = text;
  // activity
  sel = `#divdata > .sp-content > .tabledata:last-of-type > tbody`;
  let tbody = doc.querySelector(sel);
  const tr = tbody.querySelector("tr:nth-child(4)");
  const name = tr.querySelector("td:nth-child(1)").textContent.trim();
  const isActive = tr.querySelector("td:nth-child(3)").textContent.trim();
  if (name !== "Активность") throw new Error("Element not found!");
  data.active = isActive === "Да";
  //
  return data;
}

async function filter(items) {
  const result = [];
  for (const item of items) {
    const html = await useFetch(getBlockLink(item));
    const doc = new DOMParser().parseFromString(html, "text/html");
    const data = readFinValues(doc);
    if (data.active) {
      result.push({ ...useReader(item), ...data });
    }
  }
  return result;
}

async function copyFins() {
  const addVariants = readFins();
  for (const block of addVariants) {
    //const html = await useFetch(block.editLink);
    //block.data = readFinData(html);
    block.items = await filter(block.sourceList);
  }
  return addVariants;
}

async function copy() {
  const data = await copyFins();
  localStorage.setItem(FIN_COPIER_KEY, JSON.stringify(data));
}

function isTargetPage(title) {
  const titleElement = document.querySelector(".pageheadtext");
  if (!titleElement) return false;
  const pageTitle = titleElement.innerText.trim();
  return title === pageTitle;
}

function setupCurrentIndex() {
  let current = localStorage.getItem(COPIER_CURRENT_INDEX_KEY);
  let next = localStorage.getItem(COPIER_NEXT_INDEX_KEY);
  if (current === null) {
    // первый блок в списке
    current = 0;
  } else if (next === null) {
    // обработка первого не завершена
    current = Number(current);
  } else if (next !== null) {
    // обработка следующего
    current = Number(next);
  }
  localStorage.setItem(COPIER_CURRENT_INDEX_KEY, current);
  return current;
}

function readValSubName(str) {
  const parts = str.split("|");
  const end = parts.at(-1);
  return end.trim();
}

function findBlockByName(name) {
  const newSubName = readValSubName(name);
  const blocks = getBlocks();
  for (const block of blocks) {
    const subName = readValSubName(getBlockName(block));
    if (subName === newSubName) return block;
  }
  return null;
}

function setupStatus() {
  const initialValue = "STARTED";
  const status = localStorage.getItem(COPIER_PROCESS_STATUS_KEY);
  if (status !== null) return status;
  localStorage.setItem(COPIER_PROCESS_STATUS_KEY, initialValue);
  return initialValue;
}

function clickBlockLink(block) {
  let link = block.querySelector("a");
  localStorage.setItem(COPIER_PROCESS_STATUS_KEY, "OPEND_LIST_PAGE");
  link.click();
}

function clickShowAll() {
  let sel = `#MainContent_MainContent_MainContent_MainContent_LBall`;
  let link = document.querySelector(sel);
  localStorage.setItem(COPIER_PROCESS_STATUS_KEY, "OPEND_ALL_LIST");
  link.click();
}

function pickTargetItems(items) {
  //
  const targets = items.map(
    ({ code, mnemo, name }) => `${code} | ${mnemo} | ${name}`,
  );
  //
  let id = `MainContent_MainContent_MainContent_MainContent_GridViewBlock`;
  let sel = "tbody > tr:not(:first-child)";
  let rows = document.getElementById(id).querySelectorAll(sel);
  for (const row of rows) {
    const code = row.querySelector("td:nth-child(3)").textContent.trim();
    const mnemo = row.querySelector("td:nth-child(4)").textContent.trim();
    const name = row.querySelector("td:nth-child(5)").textContent.trim();
    if (targets.includes(`${code} | ${mnemo} | ${name}`)) {
      sel = "td:nth-child(2) > input";
      row.querySelector(sel).checked = true;
    }
  }
  //
  localStorage.setItem(COPIER_PROCESS_STATUS_KEY, "CHECKED_TARGET_ITEMS");
  id = "MainContent_MainContent_MainContent_MainContent_ButAdd";
  document.getElementById(id).click();
}

function clickDeleteListElement(block) {
  let btn = block.querySelector(".divbut");
  let cb1 = () => {
    let btn = block.querySelector('.divbut input[type="button"][value="Да"]');
    btn.click();
  };
  let cb2 = () => {
    let btns = block.querySelectorAll(".butontext");
    btns[0].click();
    setTimeout(cb1, 250);
  };
  btn.click();
  setTimeout(cb2, 250);
}

function removeExcessItems(items, block) {
  //
  const links = items.map(({ link }) => link.split("c=").at(1));
  //
  let list = getSourceList(block);
  for (const elm of list) {
    let link = getBlockLink(elm).split("c=").at(1);
    if (!links.includes(link)) {
      // нажать удалить
      return clickDeleteListElement(elm);
    }
  }
  localStorage.setItem(COPIER_PROCESS_STATUS_KEY, "REMOVED_EXCESS_ITEMS");
  return upload();
}

function clickOnItem(block, index) {
  localStorage.setItem(COPIER_EDIT_ID_STATUS_KEY, "PRICE_EDIT_PAGE_OPENED");
  let item = getSourceList(block)[index];
  item.querySelector("a").click();
}

function savePriceId(price) {
  localStorage.setItem(COPIER_EDIT_ID_STATUS_KEY, "PRICE_EDIT_ID_SAVED");
  let id = `MainContent_MainContent_MainContent_MainContent_TBEditidprice`;
  document.getElementById(id).value = price;
  id = `MainContent_MainContent_MainContent_MainContent_ButEditidprice`;
  document.getElementById(id).click();
}

function checkPriceId(price) {
  let data = readFinValues(document);
  if (price === data.price) {
    localStorage.setItem(COPIER_EDIT_ID_STATUS_KEY, "PRICE_EDIT_ID_CORRECT");
  } else {
    localStorage.setItem(COPIER_EDIT_ID_STATUS_KEY, "PRICE_EDIT_ID_INCORRECT");
  }
  upload();
}

function increaseElementIndex() {
  localStorage.removeItem(COPIER_EDIT_ID_STATUS_KEY);
  let index = localStorage.getItem(COPIER_EDIT_ID_INDEX_KEY);
  localStorage.setItem(COPIER_EDIT_ID_INDEX_KEY, Number(index) + 1);
  upload();
}

function exitPriceIdEdit() {
  localStorage.removeItem(COPIER_EDIT_ID_STATUS_KEY);
  localStorage.removeItem(COPIER_EDIT_ID_INDEX_KEY);
  localStorage.setItem(COPIER_PROCESS_STATUS_KEY, "UPDATED_PRICES");
  upload();
}

function updatePriceId(items, block) {
  // определить статус
  let status = localStorage.getItem(COPIER_EDIT_ID_STATUS_KEY);
  status = status ?? "PRICE_EDIT_STARTED";
  // определить индекс элемента
  let index = localStorage.getItem(COPIER_EDIT_ID_INDEX_KEY);
  index = index ?? 0;
  // сравнить индекс с длинной массива элементов
  if (index >= items.length) {
    return exitPriceIdEdit();
  }
  // данные из хранилища
  const { price } = items[index];
  // обработка
  if (status === "PRICE_EDIT_STARTED") {
    return clickOnItem(block, index);
  } else if (status === "PRICE_EDIT_PAGE_OPENED") {
    // заполнить и сохранить price ID
    return savePriceId(price);
  } else if (status === "PRICE_EDIT_ID_SAVED") {
    // проверить сохраненный price ID
    return checkPriceId(price);
  } else if (status === "PRICE_EDIT_ID_CORRECT") {
    // увеличить индекс элемента
    return increaseElementIndex();
  } else if (status === "PRICE_EDIT_ID_INCORRECT") {
    // отправить на повторное сохрание
    return savePriceId(price);
  }
}

function upload() {
  // проверить наличие данных в LStorage
  const dataAsString = localStorage.getItem(FIN_COPIER_KEY);
  if (dataAsString === null) return;
  const data = JSON.parse(dataAsString);
  //
  // определить индекс блока для текущей обработки
  const current = setupCurrentIndex();
  //
  // проверить наличие данных для блока
  const blockData = data[current];
  if (!blockData) return clearLocalStorage();
  //
  // стартует обработку, чтобы upload стартовал при перезагрузках
  const status = setupStatus();
  //
  // получит ссылку на блок
  const block = findBlockByName(blockData.name);
  //
  // обработка
  if (status === "STARTED") {
    // нажать на ссылку (блок)
    return clickBlockLink(block);
  } else if (status === "OPEND_LIST_PAGE") {
    // нажать на кнопку "Показать все"
    return clickShowAll();
  } else if (status === "OPEND_ALL_LIST") {
    // отместить только нужные элементы списка
    return pickTargetItems(blockData.items);
  } else if (status === "CHECKED_TARGET_ITEMS") {
    // удалить лишние элементы
    return removeExcessItems(blockData.items, block);
  } else if (status === "REMOVED_EXCESS_ITEMS") {
    // зполнить цены
    return updatePriceId(blockData.items, block);
  } else if (status === "UPDATED_PRICES") {
    // конец
    return clearLocalStorage();
  }
}

function clearLocalStorage() {
  localStorage.removeItem(COPIER_PROCESS_STATUS_KEY);
  localStorage.removeItem(COPIER_CURRENT_INDEX_KEY);
  localStorage.removeItem(COPIER_NEXT_INDEX_KEY);
  localStorage.removeItem(COPIER_EDIT_ID_STATUS_KEY);
  localStorage.removeItem(COPIER_EDIT_ID_INDEX_KEY);
}

function createCopyButton() {
  const btn = document.createElement("button");
  btn.innerText = "Copy Fins to LS";
  btn.classList.add("fin-button");
  btn.classList.add("fin-copy-button");
  btn.onclick = copy;
  document.body.appendChild(btn);
}

function createClearButton() {
  const btn = document.createElement("button");
  btn.innerText = "Clear Fins in LS";
  btn.classList.add("fin-button");
  btn.classList.add("fin-clear-button");
  btn.onclick = clearLocalStorage;
  document.body.appendChild(btn);
}

function createUploadButton() {
  const btn = document.createElement("button");
  btn.innerText = "Upload Fins from LS";
  btn.classList.add("fin-button");
  btn.classList.add("fin-upload-button");
  btn.onclick = upload;
  document.body.appendChild(btn);
}

function main() {
  const targetPage = isTargetPage("ФАСАДЫ");
  if (!targetPage) return;
  const started = localStorage.getItem(COPIER_PROCESS_STATUS_KEY);
  if (started) {
    upload();
  } else {
    createCopyButton();
    createUploadButton();
  }
  createClearButton();
}

main();
