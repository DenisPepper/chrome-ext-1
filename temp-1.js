const BLOCK_TYPES = {
  TYPES: "TYPES",
  VARS: "VARS",
  FINS: "FINS",
  ADD_VAL: "ADD_VAL",
  ADD_VAR: "ADD_VAR",
  INSETS: "INSETS",
  HANDLES: "HANDLES",
};

function useReader1(elm) {
  const obj = Object.create(null);
  obj.link = elm.querySelector("a").href;
  obj.code = elm.querySelector("a > span:nth-child(1)").textContent.trim();
  obj.mnemo = elm.querySelector("a > span:nth-child(2)").textContent.trim();
  obj.name = elm.querySelector("a > span:nth-child(3)").textContent.trim();
  return obj;
}

function useReader2(elm) {
  if (elm.tagName !== "LI") return;
  // группа (совместимость)
  const group = Object.create(null);
  group.link = elm.querySelector("a").href;
  group.name = elm.querySelector("a > span:nth-child(1)").textContent.trim();
  // список ручек
  group.items = [];
  const list = elm.nextElementSibling;
  if (list.tagName !== "UL") return group;
  for (const child of list.children) {
    group.items.push(useReader1(child));
  }
  return group;
}

function getBlockList() {
  let id = "divfasads";
  let selector = `#${id} > ul > li`;
  return document.querySelectorAll(selector);
}

function getBlockName(block) {
  const a = block.querySelector("a");
  return a ? a.textContent.trim() : "";
}

function getBlockLink(block) {
  const a = block.querySelector("a");
  return a ? a.href : "";
}

function createBlock(elm, blocks) {
  const block = Object.create(null);
  block.link = getBlockLink(elm);
  block.name = getBlockName(elm);
  if (block.name.includes("Тип изделия")) {
    block.type = BLOCK_TYPES.TYPES;
    block.reader = useReader1;
    block.sourceList = elm.nextElementSibling.querySelectorAll("ul > li");
  }
  if (block.name.includes("Вариант фасада")) {
    block.type = BLOCK_TYPES.VARS;
    block.reader = useReader1;
    block.sourceList = elm.nextElementSibling.querySelectorAll("ul > li");
  }
  if (block.name.includes("Отделка")) {
    block.type = BLOCK_TYPES.FINS;
    block.reader = useReader1;
    block.sourceList = elm.nextElementSibling.querySelectorAll("ul > li");
  }
  if (block.name.includes("Дополнительный размер")) {
    block.type = BLOCK_TYPES.ADD_VAL;
    //console.log(elm);
    //block.reader = useReader1;
    //block.sourceList = elm.nextElementSibling.querySelectorAll("ul > li");
  }
  if (block.name.includes("Дополнительный вариант")) {
    block.type = BLOCK_TYPES.ADD_VAR;
    block.reader = useReader1;
    block.sourceList = elm.nextElementSibling.querySelectorAll("ul > li");
  }
  if (block.name.includes("Набор вставок")) {
    block.type = BLOCK_TYPES.INSETS;
    block.reader = useReader1;
    block.sourceList = elm.nextElementSibling.querySelectorAll("ul > li");
  }
  if (block.name.includes("Ручка")) {
    block.type = BLOCK_TYPES.HANDLES;
    block.reader = useReader1;
    block.sourceList = [];
    // совместимость
    block.compatMap = Object.create(null);
    block.compatList = Array.from(elm.nextElementSibling.children).filter(
      (el) => el.tagName === "LI",
    );
    // список ручек совместимости
    for (let i = 0; i < block.compatList.length; i++) {
      const compat = block.compatList[i];
      const next = compat.nextElementSibling;
      if (!next || next.tagName !== "UL") continue;
      block.compatMap[i] = Array.from(
        compat.nextElementSibling.children,
      ).filter((el) => el.tagName === "LI");
      block.sourceList = [...block.sourceList, ...block.compatMap[i]];
    }
  }
  block.items = [];
  blocks.push(block);
  return block;
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

async function main() {
  const data = Object.create(null);

  // 1. создать список блоков
  data.blocks = [];
  const blocks = getBlockList();
  for (const block of blocks) {
    createBlock(block, data.blocks);
  }

  // 2. отфильтровать ссылки в блоках (удалить неактивные)
  for (const block of data.blocks) {
    const { reader, sourceList, items } = block;
    if (!sourceList) continue;
    for (const item of sourceList) {
      const html = await useFetch(getBlockLink(item));
      const doc = new DOMParser().parseFromString(html, "text/html");
      if (isActive(doc, item)) items.push(reader(item));
    }
  }

  console.dir(data.blocks);
}

main();
