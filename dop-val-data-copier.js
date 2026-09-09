class PageCopier {
  #addValues = null;

  constructor() {}

  #useMap() {
    return Object.create(null);
  }

  #getBlocks() {
    let id = "divfasads";
    let selector = `#${id} > ul > li`;
    const elements = document.querySelectorAll(selector);
    return elements ?? null;
  }

  #getBlockName(block) {
    const a = block.querySelector("a");
    return a ? a.textContent.trim() : "";
  }

  #getBlockLink(block) {
    const a = block.querySelector("a");
    return a ? a.href : "";
  }

  #isFolded(block) {
    const a = block.querySelector("a");
    return a.style.color === "gray";
  }

  async #useFetch(url) {
    try {
      const res = await fetch(url, {
        credentials: "include",
      });
      return await res.text();
    } catch (error) {
      return null;
    }
  }

  #readAddValues() {
    const result = [];
    const blocks = this.#getBlocks();
    if (blocks === null) return null;
    for (const block of blocks) {
      const name = this.#getBlockName(block);
      if (name.includes("Дополнительный размер")) {
        const item = this.#useMap();
        item.name = name;
        item.link = this.#getBlockLink(block);
        item.folded = this.#isFolded(block);
        result.push(item);
      }
    }
    return result;
  }

  #readAddValueData(html) {
    const data = this.#useMap();
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

  async copyAddValues() {
    this.#addValues = this.#readAddValues();
    for (const item of this.#addValues) {
      const html = await this.#useFetch(item.link);
      item.data = this.#readAddValueData(html);
    }
    return this.#addValues;
  }
}

const copier = new PageCopier();
const data = await copier.copyAddValues();
console.log(data);
