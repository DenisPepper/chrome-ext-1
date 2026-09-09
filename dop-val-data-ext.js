const ADD_VAL_COPIER_KEY = "ADD_VALUES_DATA";
const COPIER_PROCESS_KEY = "ADD_VAL_COPIER_PROCESS";
const CURRENT_ITEM_PROCESS_KEY = "CURRENT_ADD_VAL_PROCESS";
const CURRENT_ITEM_EDIT_STATUS_KEY = "CURRENT_ADD_VAL_EDIT_STATUS";
const NEXT_ITEM_PROCESS_KEY = "NEXT_ADD_VAL_PROCESS";
const NEXT_ITEM_EDIT_VALUE_KEY = "NEXT_ADD_VAL_EDIT_VALUE"; // DEFAULT | VISIBILITY | DESC | и т.д.

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

function isFolded(block) {
  const a = block.querySelector("a");
  return a.style.color === "gray";
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

function readAddVariants() {
  const result = [];
  const blocks = getBlocks();
  if (blocks === null) return null;
  for (const block of blocks) {
    const name = getBlockName(block);
    if (name.includes("Дополнительный размер")) {
      const item = useMap();
      item.name = name;
      item.link = getBlockLink(block);
      item.folded = isFolded(block);
      result.push(item);
    }
  }
  return result;
}

function readValues(doc) {
  const data = {};
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
  const data = useMap();
  const doc = new DOMParser().parseFromString(html, "text/html");
  //
  let sel = `#divdata > .sp-content > .tabledata > tbody > tr`;
  const row = doc.querySelector(sel);
  // Вариант
  let next = row.nextElementSibling;
  sel = `td:nth-of-type(3)`;
  let elm = next.querySelector(sel);
  data.variant = elm.firstChild.textContent.trim();
  // Отображать вариант в карточке
  next = next.nextElementSibling;
  elm = next.querySelector(sel);
  data.visibility = elm.firstChild.textContent.trim();
  // Название в карточке
  next = next.nextElementSibling;
  elm = next.querySelector(sel);
  data.desc = elm.innerText.trim();
  // Отображать название в карточке
  next = next.nextElementSibling;
  elm = next.querySelector(sel);
  data.descVisibility = elm.firstChild.textContent.trim();
  // Значение по умолчанию
  const pid =
    "MainContent_MainContent_MainContent_MainContent_UCBd_GridViewPar";
  sel = `#${pid} > tbody > tr:nth-of-type(1) td:nth-of-type(6)`;
  elm = doc.querySelector(sel);
  data.default = elm.innerText.trim();
  // Минимальное значение
  sel = `#${pid} > tbody > tr:nth-of-type(2) td:nth-of-type(6)`;
  elm = doc.querySelector(sel);
  data.min = elm.innerText.trim();
  // Максимальное значение
  sel = `#${pid} > tbody > tr:nth-of-type(3) td:nth-of-type(6)`;
  elm = doc.querySelector(sel);
  data.max = elm.innerText.trim();
  //
  return data;
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

function updateDafault(value) {
  console.log("updateDafault");

  let sel = `#parelmcontrol9`;
  let elm = document.querySelector(sel);
  elm.value = value;
  sel = `#divparelm9 input[type="button"]`;
  document.querySelector(sel).click();
}

function udateMin(value) {
  console.log("udateMin");

  let sel = `#parelmcontrol10`;
  let elm = document.querySelector(sel);
  elm.value = value;
  sel = `#divparelm10 input[type="button"]`;
  document.querySelector(sel).click();
}

function udateMax(value) {
  console.log("udateMax");

  let sel = `#parelmcontrol11`;
  let elm = document.querySelector(sel);
  elm.value = value;
  sel = `#divparelm11 input[type="button"]`;
  document.querySelector(sel).click();
}

function writeAddValuesData(data) {
  const values = readValues(document);
  const key = localStorage.getItem(NEXT_ITEM_EDIT_VALUE_KEY);
  if (key === "STOP") return;
  if (key === "START") {
    // Отображать вариант в карточке
    localStorage.setItem(NEXT_ITEM_EDIT_VALUE_KEY, "DESK");
    if (values.visibility === data.visibility) return writeAddValuesData(data);
    updateVisibility(data.visibility);
  } else if (key === "DESK") {
    // Название в карточке
    localStorage.setItem(NEXT_ITEM_EDIT_VALUE_KEY, "DESCVISIBILITY");
    if (values.desc === data.desc) return writeAddValuesData(data);
    updateDescription(data.desc);
  } else if (key === "DESCVISIBILITY") {
    // Отображать название в карточке
    localStorage.setItem(NEXT_ITEM_EDIT_VALUE_KEY, "DEFAULT");
    if (values.descVisibility === data.descVisibility)
      return writeAddValuesData(data);
    udateDescVisibility(data.descVisibility);
  } else if (key === "DEFAULT") {
    // Значение по умолчанию
    localStorage.setItem(NEXT_ITEM_EDIT_VALUE_KEY, "MIN");
    if (values.default === data.default) return writeAddValuesData(data);
    updateDafault(data.default);
  } else if (key === "MIN") {
    // Минимальное значение
    localStorage.setItem(NEXT_ITEM_EDIT_VALUE_KEY, "MAX");
    if (values.min === data.min) return writeAddValuesData(data);
    udateMin(data.min);
  } else if (key === "MAX") {
    // Максимальное значение
    localStorage.setItem(NEXT_ITEM_EDIT_VALUE_KEY, "STOP");
    if (values.max === data.max) return writeAddValuesData(data);
    udateMax(data.max);
  }
}

async function copyAddValues() {
  const addValues = readAddVariants();
  for (const item of addValues) {
    const html = await useFetch(item.link);
    item.data = readAddValueData(html);
  }
  return addValues;
}

async function copy() {
  const data = await copyAddValues();
  localStorage.setItem(ADD_VAL_COPIER_KEY, JSON.stringify(data));
}

function setupCurrentIndex() {
  let current = localStorage.getItem(CURRENT_ITEM_PROCESS_KEY);
  let next = localStorage.getItem(NEXT_ITEM_PROCESS_KEY);
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
  localStorage.setItem(CURRENT_ITEM_PROCESS_KEY, current);
  return current;
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
      localStorage.setItem(CURRENT_ITEM_EDIT_STATUS_KEY, "OPEN");
      let id = "MainContent_MainContent_MainContent_aelement";
      let sel = `#${id} + div input[value="Дополнительный размер"]`;
      document.querySelector(sel).click();
    }, 250);
  }, 250);
}

function clearLocalStorage() {
  localStorage.removeItem(COPIER_PROCESS_KEY);
  localStorage.removeItem(CURRENT_ITEM_PROCESS_KEY);
  localStorage.removeItem(NEXT_ITEM_PROCESS_KEY);
  localStorage.removeItem(NEXT_ITEM_EDIT_VALUE_KEY);
  localStorage.removeItem(CURRENT_ITEM_EDIT_STATUS_KEY);
}

function upload() {
  // проверить наличие данных в LStorage
  const dataAsString = localStorage.getItem(ADD_VAL_COPIER_KEY);
  if (dataAsString === null) return;
  const data = JSON.parse(dataAsString);
  //
  // стартует обработку
  const start = localStorage.getItem(COPIER_PROCESS_KEY);
  if (start === null) localStorage.setItem(COPIER_PROCESS_KEY, "START");
  //
  // определить индекс блока для текущей обработки
  const current = setupCurrentIndex();
  //
  // проверить наличие данных для блока
  const blockData = data[current];
  if (!blockData) return clearLocalStorage();
  //
  // проверить наличие блока на странице (по имени)
  const block = findBlockByName(blockData.name);
  if (block === null) {
    createNewBlock();
    return;
  }
  //
  // открыть блок на редактирование
  const isOpenEditPage = localStorage.getItem(CURRENT_ITEM_EDIT_STATUS_KEY);
  if (!isOpenEditPage) {
    localStorage.setItem(CURRENT_ITEM_EDIT_STATUS_KEY, "OPEN");
    return block.querySelector("a").click();
  }
  //
  // заполнить новый блок данными
  const nextEditValue = localStorage.getItem(NEXT_ITEM_EDIT_VALUE_KEY);
  if (nextEditValue === null)
    localStorage.setItem(NEXT_ITEM_EDIT_VALUE_KEY, "START");
  if (nextEditValue !== "STOP") return writeAddValuesData(blockData.data);
  //
  // переход на следующий индекс или выход
  if (current <= data.length - 1) {
    console.log("go next from ", current);

    localStorage.removeItem(NEXT_ITEM_EDIT_VALUE_KEY);
    localStorage.setItem(NEXT_ITEM_PROCESS_KEY, current + 1);
    return upload();
  } else {
    console.log("over on", current);
    return clearLocalStorage();
  }
}

function createCopyButton() {
  const btn = document.createElement("button");
  btn.innerText = "Copy Add Vals to LS";
  btn.classList.add("val-button");
  btn.classList.add("val-copy-button");
  btn.onclick = copy;
  document.body.appendChild(btn);
}

function createUploadButton() {
  const btn = document.createElement("button");
  btn.innerText = "Upload Add Vals";
  btn.classList.add("val-button");
  btn.classList.add("val-upload-button");
  btn.onclick = upload;
  document.body.appendChild(btn);
}

function isTargetPage(title) {
  const titleElement = document.querySelector(".pageheadtext");
  if (!titleElement) return false;
  const pageTitle = titleElement.innerText.trim();
  return title === pageTitle;
}

function createClearButton() {
  const btn = document.createElement("button");
  btn.innerText = "Clear Add Vals LS";
  btn.classList.add("val-button");
  btn.classList.add("val-clear-button");
  btn.onclick = clearLocalStorage;
  document.body.appendChild(btn);
}

function main() {
  const targetPage = isTargetPage("ФАСАДЫ");
  if (!targetPage) return;
  const started = localStorage.getItem(COPIER_PROCESS_KEY);
  if (started) {
    upload();
  } else {
    createCopyButton();
    createUploadButton();
  }
  createClearButton();
}

main();
