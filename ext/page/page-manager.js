class PageManager {
  // ============ ПРИВАТНЫЕ ПОЛЯ ============
  #data = null;
  #blockTypes = null;

  // ============== КОНСТРУКТОР ==============
  constructor() {
    this.#initData();
    this.#initBlockTypes();
  }

  // ============ ПРИВАТНЫЕ МЕТОДЫ ============
  #useMap() {
    return Object.create(null);
  }

  #useEnum(items) {
    if (!Array.isArray(items)) throw new Error("PageManager error[1]");
    const obj = this.#useMap();
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  }

  #initData() {
    this.#data = this.#useMap();
  }

  #initBlockTypes() {
    const blockTypes = [
      // данные справочников в левой части страницы фасадов
      "TYPES",
      "VARS",
      "FINS",
      "ADD_VAL",
      "ADD_VAR",
      "INSETS",
      "HANDLES",
      // параметры в правой части страницы фасадов
      "PARAMS",
      // ограничения в правой части страницы фасадов
      "LIMITS",
    ];
    this.#blockTypes = this.#useMap();
    Object.assign(this.#blockTypes, this.#useEnum(blockTypes));
    Object.freeze(this.#blockTypes);
  }

  #can(key) {
    return Object.hasOwn(this.#blockTypes, key);
  }

  #isLeftBlocks(blockType) {
    const leftBlocks = Object.keys(this.#blockTypes).slice(0, 7);
    return leftBlocks.includes(blockType);
  }

  #isTypes(blockType, blockName) {
    const hasName = blockName.includes("Тип изделия");
    const hasType = blockType === this.#blockTypes.TYPES;
    return hasName && hasType;
  }

  #isVars(blockType, blockName) {
    const hasName = blockName.includes("Вариант фасада");
    const hasType = blockType === this.#blockTypes.VARS;
    return hasName && hasType;
  }

  #isFins(blockType, blockName) {
    const hasName = blockName.includes("Отделка");
    const hasType = blockType === this.#blockTypes.FINS;
    return hasName && hasType;
  }

  #isAddVars(blockType, blockName) {
    const hasName = blockName.includes("Дополнительный вариант");
    const hasType = blockType === this.#blockTypes.ADD_VAR;
    return hasName && hasType;
  }

  #isInsets(blockType, blockName) {
    const hasName = blockName.includes("Набор вставок");
    const hasType = blockType === this.#blockTypes.INSETS;
    return hasName && hasType;
  }

  #isHandles(blockType, blockName) {
    const hasName = blockName.includes("Ручка");
    const hasType = blockType === this.#blockTypes.HANDLES;
    return hasName && hasType;
  }

  #getBlockName(block) {
    const a = block.querySelector("a");
    return a ? a.textContent.trim() : "";
  }

  #getBlockLink(block) {
    const a = block.querySelector("a");
    return a ? a.href : "";
  }

  #getSourceList(block, blockType) {
    if (
      blockType === this.#blockTypes.TYPES ||
      blockType === this.#blockTypes.VARS
    ) {
      const next = block.nextElementSibling;
      if (!next || next.tagName !== "UL") return null;
      return next.children;
    }
    if (blockType === this.#blockTypes.HANDLES) {
      const next = block.nextElementSibling;
      if (!next || next.tagName !== "UL") return null;
      return Array.from(next.children)
        .filter((el) => el.tagName === "UL")
        .reduce((acc, ul) => {
          return [...acc, ...ul.children];
        }, []);
    }
    return null;
  }

  #fillCompatMap(compatList) {
    const compatMap = this.#useMap();
    for (let i = 0; i < compatList.length; i++) {
      const compat = compatList[i];
      const next = compat.nextElementSibling;
      if (!next || next.tagName !== "UL") continue;
      compatMap[i] = Array.from(compat.nextElementSibling.children).filter(
        (el) => el.tagName === "LI",
      );
    }
    return compatMap;
  }

  #isFolded(block) {
    const a = block.querySelector("a");
    return a.style.color === "gray";
  }

  #findBlock(blockType) {
    if (this.#isLeftBlocks(blockType)) {
      let id = "divfasads";
      let selector = `#${id} > ul > li`;
      const elements = document.querySelectorAll(selector);
      for (const elm of elements) {
        const name = this.#getBlockName(elm);
        if (this.#isTypes(blockType, name)) return elm;
        if (this.#isVars(blockType, name)) return elm;
        if (this.#isFins(blockType, name)) return elm;
        if (this.#isAddVars(blockType, name)) return elm;
        if (this.#isInsets(blockType, name)) return elm;
        if (this.#isHandles(blockType, name)) return elm;
      }
    }
    return null;
  }

  #useReader1(elm) {
    const obj = Object.create(null);
    obj.link = elm.querySelector("a").href;
    obj.code = elm.querySelector("a > span:nth-child(1)").textContent.trim();
    obj.mnemo = elm.querySelector("a > span:nth-child(2)").textContent.trim();
    obj.name = elm.querySelector("a > span:nth-child(3)").textContent.trim();
    return obj;
  }

  #createBlocks(cfg) {
    this.#data.blocks = [];
    for (const blockType of cfg.targets) {
      if (!this.#can(blockType)) continue;
      const li = this.#findBlock(blockType);
      if (li === null) continue;
      const block = this.#useMap();
      block.type = blockType;
      this.#data.blocks.push(block);
      if (
        blockType === this.#blockTypes.TYPES ||
        blockType === this.#blockTypes.VARS ||
        blockType === this.#blockTypes.FINS ||
        blockType === this.#blockTypes.ADD_VAR ||
        blockType === this.#blockTypes.INSETS
      ) {
        block.name = this.#getBlockName(li);
        block.link = this.#getBlockLink(li);
        block.reader = this.#useReader1;
        block.items = [];
        block.folded = this.#isFolded(li);
        if (!block.folded) {
          block.sourceList = this.#getSourceList(li, blockType);
        }
      }
      if (blockType === this.#blockTypes.HANDLES) {
        block.name = this.#getBlockName(li);
        block.link = this.#getBlockLink(li);
        block.folded = this.#isFolded(li);
        block.reader = this.#useReader1;
        block.items = [];
        if (!block.folded) {
          block.compatList = Array.from(li.nextElementSibling.children).filter(
            (el) => el.tagName === "LI",
          );
          block.compatMap = this.#fillCompatMap(block.compatList);
          block.sourceList = this.#getSourceList(li, blockType);
        }
      }
    }
  }

  // ============ ПУБЛИЧНЫЕ МЕТОДЫ ============
  getBlockTypes() {
    return Object.keys(this.#blockTypes);
  }

  useDebagger() {
    this.#createBlocks({
      targets: ["TYPES", "VARS", "HANDLES"],
    });
    console.dir(this.#data);
  }

  async copyPageData(cfg) {
    try {
      this.#createBlocks(cfg);

      return { success: true, data: this.#data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Использование
const manager = new PageManager();

manager.useDebagger();

/*
const pageData = await manager.copyPageData({
  targets: ["TYPES", "VARS"],
});
*/
