const INSET_COPIER_KEY = "INSET_VARIANTS_DATA";
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

function readInsets() {
  const result = [];
  const blocks = getBlocks();
  if (blocks === null) return null;
  for (const block of blocks) {
    const name = getBlockName(block);
    if (name.includes("Набор вставок")) {
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
  // Вариант
  let id = `MainContent_MainContent_MainContent_MainContent_UCBd_tdeditidblockvariants`;
  let elm = doc.querySelector(`#${id} + td`);
  data.variant = elm.firstChild.textContent.trim();
  //console.log(elm)
  // Отображать вариант в карточке
  id = `MainContent_MainContent_MainContent_MainContent_UCBd_tdeditshowvariant`;
  elm = doc.querySelector(`#${id} + td`);
  data.visibility = elm.firstChild.textContent.trim();
  // Название в карточке
  id = `MainContent_MainContent_MainContent_MainContent_UCBd_tdeditnamecard`;
  elm = doc.querySelector(`#${id} + td`);
  data.desc = elm.innerText.trim();
  // Отображать название в карточке
  id = `MainContent_MainContent_MainContent_MainContent_UCBd_tdeditshowname`;
  elm = doc.querySelector(`#${id} + td`);
  data.descVisibility = elm.firstChild.textContent.trim();
  // Сдвиг по ширине
  id = `MainContent_MainContent_MainContent_MainContent_UCBd_GridViewPar`;
  let sel = `#${id} > tbody > tr:nth-of-type(1) td:nth-of-type(6)`;
  data.wShift = doc.querySelector(sel).innerText.trim();
  // Сдвиг по высоте
  sel = `#${id} > tbody > tr:nth-of-type(2) td:nth-of-type(6)`;
  data.hShift = doc.querySelector(sel).innerText.trim();
  // Положение по Z
  sel = `#${id} > tbody > tr:nth-of-type(3) td:nth-of-type(6)`;
  data.zPos = doc.querySelector(sel).innerText.trim();
  // Высота штапика
  sel = `#${id} > tbody > tr:nth-of-type(4) td:nth-of-type(6)`;
  data.beadH = doc.querySelector(sel).innerText.trim();
  // Ширина
  sel = `#${id} > tbody > tr:nth-of-type(5) td:nth-of-type(6)`;
  data.width = doc.querySelector(sel).innerText.trim();
  // Высота
  sel = `#${id} > tbody > tr:nth-of-type(6) td:nth-of-type(6)`;
  data.height = doc.querySelector(sel).innerText.trim();
  //
  return data;
}

function readInsetData(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return readValues(doc);
}

async function filter(items) {
  const result = [];
  for (const item of items) {
    const html = await useFetch(getBlockLink(item));
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (isActive(doc, item)) {
      result.push(useReader(item));
    }
  }
  return result;
}

async function copyInsets() {
  const insets = readInsets();
  for (const block of insets) {
    const html = await useFetch(block.editLink);
    block.data = readInsetData(html);
    block.items = await filter(block.sourceList);
    delete block.sourceList;
  }
  return insets;
}

async function copy() {
  const data = await copyInsets();
  localStorage.setItem(INSET_COPIER_KEY, JSON.stringify(data));
}

function isTargetPage(title) {
  const titleElement = document.querySelector(".pageheadtext");
  if (!titleElement) return false;
  const pageTitle = titleElement.innerText.trim();
  return title === pageTitle;
}

function createCopyButton() {
  const btn = document.createElement("button");
  btn.innerText = "Copy Insets to LS";
  btn.classList.add("ins-button");
  btn.classList.add("ins-copy-button");
  btn.onclick = copy;
  document.body.appendChild(btn);
}

function main() {
  const targetPage = isTargetPage("ФАСАДЫ");
  if (!targetPage) return;
  const started = localStorage.getItem(COPIER_PROCESS_STATUS_KEY);
  if (started) {
    //upload();
  } else {
    createCopyButton();
    //createUploadButton();
  }
  //createClearButton();
}

main();
