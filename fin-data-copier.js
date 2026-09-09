const FIN_COPIER_KEY = "FIN_VARIANTS_DATA";
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

function createCopyButton() {
  const btn = document.createElement("button");
  btn.innerText = "Copy Fins to LS";
  btn.classList.add("fin-button");
  btn.classList.add("fin-copy-button");
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
  createClearButton();
}

main();
