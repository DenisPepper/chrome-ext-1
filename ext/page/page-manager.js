


class PageManager {
    #PageTitles = {
        facade: "FACADE"
    }


    constructor() { }

    #isTargetPage(target) {
        const finder = new ElementFinder();
        const element = document.querySelector(".pageheadtext");
        if (!element) return false;
        const text = element.innerText.trim();
        return text === target;
    }

    isFacadePage() {
        return this.#isTargetPage(this.#PageTitles.facade)
    }
}