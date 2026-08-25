class AsyncPipeline {
    // ============ ПРИВАТНЫЕ ПОЛЯ ============
    #data = null;
    #outputFile = "result.txt";

    // ============ ПРИВАТНЫЕ МЕТОДЫ ============

    #getPath() {
        const path = prompt("Введите путь к файлу:");
        if (!path) throw new Error("Путь не указан");
        this.#data = path;
        return this;
    }

    async #readFile() {
        await this.#delay(300);
        this.#data = `Содержимое ${this.#data}`;
        return this;
    }

    async #fetchExternalData() {
        await this.#delay(400);
        this.#data = this.#data + "\nДанные из внешнего API";
        return this;
    }

    #process() {
        this.#data = this.#data.toUpperCase();
        return this;
    }

    async #save() {
        await this.#delay(200);
        // Здесь сохранение в файл
        return this;
    }

    #delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // ============ ПУБЛИЧНЫЕ МЕТОДЫ ============

    setOutputFile(filename) {
        this.#outputFile = filename;
        return this;
    }

    async execute() {
        try {
            await this.#getPath()
                .#readFile()
                .#fetchExternalData()
                .#process()
                .#save();

            return { success: true, data: this.#data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Использование
const result = await new AsyncPipeline()
    .setOutputFile("output.txt")
    .execute();
