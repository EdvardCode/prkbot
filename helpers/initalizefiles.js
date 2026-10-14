const fs = require("fs");

try {
    // 1. Сначала создаем главную папку
    if (!fs.existsSync("./files")) {
        fs.mkdirSync("./files");
        console.log("Initalize file directory...");
    }
    
    // 2. Потом создаем файл настроек внутри неё
    if (!fs.existsSync("./files/settings.json")) {
        fs.writeFileSync("./files/settings.json", "{}"); 
        console.log("Initalize settings.json file...");
    }

    // 3. Создаем остальные вложенные папки
    const dirs = [
        "./files/temp",
        "./files/temp/cources",
        "./files/temp/groups",
        "./files/temp/people",
        "./files/temp/rooms",
        "./files/temp/emptyrooms"
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            console.log("Initalize", dir, "directory...");
        }
    });

} catch (e) {
    console.log("Cannot write file/folder: ", e);
}

module.exports.createpath = (path) => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
        console.log("Initalize", path);
    }
};