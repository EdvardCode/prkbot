const axios = require('axios');
const fs = require('fs');
const { vk } = require("../Cfg.json");
const settings = require("../settings.js");
const storage = require("../helpers/globaldata.js");
storage.init("vk_comment");
storage.init("vk_lastupdate");
storage.set("vk_lastupdate", "");
storage.set("vk_comment", "");

// Конфиг для получения HTML-текста страницы
const htmlAxiosConfig = {
    responseType: 'text',
    headers: {
        'User-Agent': vk.userAgent,
        'Cookie': 'remixmdevice=1920/1080/1/!!-!!!!!!!!;'
    },
};

// Конфиг для скачивания самого файла (поток)
const downloadAxiosConfig = {
    responseType: 'stream',
    headers: {
        'User-Agent': vk.userAgent,
        'Cookie': 'remixmdevice=1920/1080/1/!!-!!!!!!!!;'
    },
};

const getLastScheduleData = async () => {
    try {
        console.log("Получаем страницу обсуждения ВК...");
        const response = await axios.get(vk.schedule.url, htmlAxiosConfig);
        const html = response.data;

        const regex = /\{"type":"doc","doc":\{"id":(\d+),"owner_id":(\d+),"title":"([^"]+)","size":\d+,"ext":"xlsx"[^}]*"date":(\d+)[^}]*"url":"([^"]+)"/g;
        let match;
        let latestDoc = null;
        let maxId = 0;
        while ((match = regex.exec(html)) !== null) {
            const docId = parseInt(match[1], 10);
            const ownerId = match[2];
            const title = match[3];
            const dateTs = parseInt(match[4], 10);
            const url = match[5].replace(/\\\//g, '/');

            if (vk.validuserids && vk.validuserids[ownerId]) {
                if (docId > maxId) {
                    maxId = docId;
                    latestDoc = {
                        link: url,
                        postid: docId.toString(),
                        posttime: new Date(dateTs * 1000).toLocaleString('ru-RU'),
                        postcomment: title
                    };
                }
            }
        }

        if (!latestDoc) {
            console.error("getLastScheduleData: ссылка на .xlsx файл не найдена.");
            console.error("Проверь, что файл действительно прикреплен к последним сообщениям, и ID владельца (319573944) указан в cfg.json без пробелов.");
            return null;
        }

        console.log(`✅ Найдено расписание: ${latestDoc.postcomment} (ID: ${latestDoc.postid})`);
        storage.set("vk_comment", latestDoc.postcomment);
        storage.set("vk_lastupdate", latestDoc.posttime);
        storage.set("vk_url", latestDoc.link);
        return latestDoc;
    } catch (error) {
        console.error("Ошибка при получении данных из ВК: ", error.message);
        return null;
    }
};

const downloadFile = async (url) => {
    console.log("Начинаем скачивание файла по ссылке:", url);
    const response = await axios({
        method: 'GET',
        url: url,
        ...downloadAxiosConfig
    });

    if (!fs.existsSync("./files")) {
        fs.mkdirSync("./files", { recursive: true });
    }
    const filepath = "./files/schedule.xlsx";
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            console.log("✅ Файл успешно сохранен:", filepath);
            resolve(filepath);
        });
        writer.on('error', (err) => {
            console.error("❌ Ошибка записи файла:", err);
            reject(err);
        });
    });
};

module.exports.getScheduleLink = () => { return settings.get("scheduleurl", ""); };

module.exports.idle = async (cb) => {
    setInterval(async () => {
        const data = await getLastScheduleData();
        if (data && data.posttime && data.posttime !== settings.get("posttime", "") && data.postid !== settings.get("postid", "")) {
            console.log("🔔 Обнаружено новое расписание!");
            settings.set("posttime", data.posttime);
            settings.set("postid", data.postid);
            settings.set("scheduleurl", data.link);
            await cb(data.link);
        }
    }, vk.requestdelay * 1000);
};

module.exports.run = async () => {
    const data = await getLastScheduleData();
    if (!data || !data.link) {
        console.error(`⛔ Не удалось получить ссылку на расписание. Проверь консоль выше.`);
        return null;
    }
    try {
        const filepath = await downloadFile(data.link);
        if (fs.existsSync(filepath)) {
            return filepath;
        } else {
            console.error(`Ошибка: файл не был сохранен по пути ${filepath}`);
            return null;
        }
    } catch (err) {
        console.error("Критическая ошибка при скачивании файла:", err);
        return null;
    }
};