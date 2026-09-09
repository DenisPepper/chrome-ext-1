const ADD_VAR_COPIER_KEY = "ADD_VARIANTS_DATA";
const COPIER_PROCESS_STATUS_KEY = "COPIER_PROCESS_STATUS";
const COPIER_CURRENT_INDEX_KEY = "COPIER_CURRENT_INDEX";
const COPIER_NEXT_INDEX_KEY = "COPIER_NEXT_INDEX";
const COPIER_NEXT_EDIT_VALUE_KEY = "COPIER_NEXT_EDIT_VALUE";

function useMap() {
  return Object.create(null);
}

function getBlocks() {
  let id = "divfasads";
  let selector = `#${id} > ul > li`;
  const elements = document.querySelectorAll(selector);
  return elements ?? null;
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

function isActive(doc, item) {
  let id = "divdata";
  let selector = `#${id} > .sp-content > table:last-of-type > tbody`;
  const tbody = doc.querySelector(selector);
  //
  if (!tbody) console.log(item);
  //
  const tr = tbody.querySelector("tr:nth-child(4)");
  const name = tr.querySelector("td:nth-child(1)").textContent.trim();
  const isActive = tr.querySelector("td:nth-child(3)").textContent.trim();
  if (name !== "Активность") return false;
  return isActive === "Да";
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

function readAddVariants() {
  const result = [];
  const blocks = getBlocks();
  if (blocks === null) return null;
  for (const block of blocks) {
    const name = getBlockName(block);
    if (name.includes("Дополнительный вариант")) {
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

function readValues(doc) {
  const data = useMap();
  let sel = `#divdata > .sp-content > .tabledata > tbody > tr`;
  const rows = doc.querySelectorAll(sel);
  for (const row of rows) {
    const name = row.querySelector(".tdname");
    if (name === null) continue;
    sel = `td:nth-of-type(3)`;
    let elm = null;
    const text = name.firstChild.data.trim();
    if (text === "Вариант") {
      elm = row.querySelector(sel);
      data.variant = elm.firstChild.textContent.trim();
    } else if (text === "Отображать вариант") {
      elm = row.querySelector(sel);
      data.visibility = elm.firstChild.textContent.trim();
    } else if (text === "Название в карточке") {
      elm = row.querySelector(sel);
      data.desc = elm.innerText.trim();
    } else if (text === "Отображать название") {
      elm = row.querySelector(sel);
      data.descVisibility = elm.firstChild.textContent.trim();
    } else if (text === "Значение по умолчанию") {
      const pid =
        "MainContent_MainContent_MainContent_MainContent_UCBd_GridViewPar";
      // default
      sel = `#${pid} > tbody > tr:nth-of-type(1) td:nth-of-type(6)`;
      data.default = doc.querySelector(sel).innerText.trim();
      // min
      sel = `#${pid} > tbody > tr:nth-of-type(2) td:nth-of-type(6)`;
      data.min = doc.querySelector(sel).innerText.trim();
      // max
      sel = `#${pid} > tbody > tr:nth-of-type(3) td:nth-of-type(6)`;
      data.max = doc.querySelector(sel).innerText.trim();
    }
  }
  return data;
}

function readAddValueData(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return readValues(doc);
}

async function filter(items) {
  const result = [];
  for (const item of items) {
    console.log(getBlockLink(item));

    const html = await useFetch(getBlockLink(item));
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (isActive(doc, item)) {
      result.push(useReader(item));
    }
  }
  return result;
}

async function copyAddVariants() {
  const addVariants = readAddVariants();
  for (const block of addVariants) {
    const html = await useFetch(block.editLink);
    block.data = readAddValueData(html);
    block.items = await filter(block.sourceList);
  }
  return addVariants;
}

async function copy() {
  const data = await copyAddVariants();
  localStorage.setItem(ADD_VAR_COPIER_KEY, JSON.stringify(data));
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

function setupStatus() {
  const initialValue = "STARTED";
  const status = localStorage.getItem(COPIER_PROCESS_STATUS_KEY);
  if (status !== null) return status;
  localStorage.setItem(COPIER_PROCESS_STATUS_KEY, initialValue);
  return initialValue;
}

function createNewBlock() {
  // нажать кнопку для создания блока
  let id = "MainContent_MainContent_MainContent_aelement";
  let sel = `#${id} + div`;
  let btn = document.querySelector(sel);
  btn.click();
  setTimeout(() => {
    btn.querySelector(".butontext").click();
    setTimeout(() => {
      let id = "MainContent_MainContent_MainContent_aelement";
      let sel = `#${id} + div input[value="Дополнительный вариант"]`;
      localStorage.setItem(COPIER_PROCESS_STATUS_KEY, "ADDED_NEW_BLOCK");
      document.querySelector(sel).click();
    }, 250);
  }, 250);
}

function clickParamsEdit(block) {
  let btn = block.querySelector(".divbut");
  btn.click();
  setTimeout(() => {
    let btns = block.querySelectorAll(".butontext");
    localStorage.setItem(COPIER_PROCESS_STATUS_KEY, "OPEND_EDIT_PAGE");
    btns[0].click();
  }, 250);
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

function increaseBlockIndex(current) {
  localStorage.setItem(COPIER_NEXT_INDEX_KEY, current + 1);
  localStorage.setItem(COPIER_PROCESS_STATUS_KEY, "STARTED");
  return upload();
}

function updateVisibility(value) {
  if (value === "Нет") {
    let sel = `#MainContent_MainContent_MainContent_MainContent_UCBd_RBLshowvariant_0`;
    document.querySelector(sel).click();
  }
  if (value === "Да") {
    let sel = `#MainContent_MainContent_MainContent_MainContent_UCBd_RBLshowvariant_1`;
    document.querySelector(sel).click();
  }
}

function updateDescription(value) {
  let sel = `#MainContent_MainContent_MainContent_MainContent_UCBd_TBEditnamecard`;
  let elm = document.querySelector(sel);
  elm.value = value;
  sel = `#MainContent_MainContent_MainContent_MainContent_UCBd_ButEditnamecard`;

  console.log("updateDesc");

  document.querySelector(sel).click();
}

function udateDescVisibility(value) {
  console.log("udateDescVisibility");

  if (value === "Нет") {
    let sel = `#MainContent_MainContent_MainContent_MainContent_UCBd_RBLshowname_0`;
    document.querySelector(sel).click();
  }
  if (value === "Да") {
    let sel = `#MainContent_MainContent_MainContent_MainContent_UCBd_RBLshowname_1`;
    document.querySelector(sel).click();
  }
}

function writeData(data) {
  const values = readValues(document);
  const key = localStorage.getItem(COPIER_NEXT_EDIT_VALUE_KEY);
  if (key === null) {
    localStorage.setItem(COPIER_NEXT_EDIT_VALUE_KEY, "VISIBILITY");
    return writeData(data);
  } else if (key === "VISIBILITY") {
    localStorage.setItem(COPIER_NEXT_EDIT_VALUE_KEY, "DESK");
    if (values.visibility === data.visibility) return writeData(data);
    return updateVisibility(data.visibility);
  } else if (key === "DESK") {
    localStorage.setItem(COPIER_NEXT_EDIT_VALUE_KEY, "DESCVISIBILITY");
    if (values.desc === data.desc) return writeData(data);
    return updateDescription(data.desc);
  } else if (key === "DESCVISIBILITY") {
    localStorage.removeItem(COPIER_NEXT_EDIT_VALUE_KEY);
    localStorage.setItem(COPIER_PROCESS_STATUS_KEY, "ENDED_EDIT_DATA");
    if (values.descVisibility !== data.descVisibility)
      return udateDescVisibility(data.descVisibility);
    location.reload();
  }
}

function upload() {
  // проверить наличие данных в LStorage
  const dataAsString = localStorage.getItem(ADD_VAR_COPIER_KEY);
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
  // проверить наличие блока на странице (по имени)
  const block = findBlockByName(blockData.name);
  //
  // обработка
  if (status === "STARTED") {
    // создать новый блок (если нет)
    if (block === null) return createNewBlock();
    // переход на следующий блок
    if (block) return increaseBlockIndex(current);
  } else if (status === "ADDED_NEW_BLOCK") {
    // нажать кнопку папаметры
    return clickParamsEdit(block);
  } else if (status === "OPEND_EDIT_PAGE") {
    // заполнить новый блок данными
    return writeData(blockData.data);
  } else if (status === "ENDED_EDIT_DATA") {
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
    // переход на следующий блок
    return increaseBlockIndex(current);
  }
}

function clearLocalStorage() {
  localStorage.removeItem(COPIER_PROCESS_STATUS_KEY);
  localStorage.removeItem(COPIER_CURRENT_INDEX_KEY);
  localStorage.removeItem(COPIER_NEXT_INDEX_KEY);
  localStorage.removeItem(COPIER_NEXT_EDIT_VALUE_KEY);
}

function isTargetPage(title) {
  const titleElement = document.querySelector(".pageheadtext");
  if (!titleElement) return false;
  const pageTitle = titleElement.innerText.trim();
  return title === pageTitle;
}

function createCopyButton() {
  const btn = document.createElement("button");
  btn.innerText = "Copy Add Vars to LS";
  btn.classList.add("var-button");
  btn.classList.add("var-copy-button");
  btn.onclick = copy;
  document.body.appendChild(btn);
}

function createUploadButton() {
  const btn = document.createElement("button");
  btn.innerText = "Upload Add Vars";
  btn.classList.add("var-button");
  btn.classList.add("var-upload-button");
  btn.onclick = upload;
  document.body.appendChild(btn);
}

function createClearButton() {
  const btn = document.createElement("button");
  btn.innerText = "Clear Add Vars LS";
  btn.classList.add("var-button");
  btn.classList.add("var-clear-button");
  btn.onclick = clearLocalStorage;
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
