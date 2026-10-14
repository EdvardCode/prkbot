const loader = require("./downloader/downloader.js");
const initalizepaths = require("./helpers/initalizefiles.js");
const exceleditor = require("./modules/exceleditor.js");
const tempcleaner = require("./helpers/tempcleaner.js");
const delivery = require("./telegram/modules/updatedilivery.js");
const db = require("./database/db.js");

// выполнить при запуске
loader.run().then(async (filepath) => {
    if (!filepath) {
        console.error("⛔ Запуск прерван: файл расписания не был скачан. Проверь консоль выше.");
        return; // Прерываем выполнение, чтобы не крашить exceleditor
    }
    
    await exceleditor.run();
    const telegram = require("./telegram/main.js");
    const tv = require("./tv/express.js");
});

// Выполнить при обнаружении нового расписания
loader.idle(async () => {
    const filepath = await loader.run();
    if (filepath) {
        await tempcleaner.run();
        await exceleditor.run();
        await delivery.start();
    }
});