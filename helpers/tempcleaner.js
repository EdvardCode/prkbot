const fs = require('fs').promises;
const path = require('path');
const storage = require("../helpers/globaldata.js")

async function clearFolder(folderPath) {
    try {
        const files = await fs.readdir(folderPath);
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stat = await fs.lstat(filePath);
            if (stat.isDirectory()) {
                await clearFolder(filePath);
            } else {
                await fs.unlink(filePath);
            }
        }
    } catch (err) {
        console.error(`Ошибка при очистке директории ${folderPath}: ${err.message}`);
    }
}
module.exports.run = async ()=>{
    console.log(`Содержимое директории files/temp уничтожено.`);
    await clearFolder("./files/temp");
}
