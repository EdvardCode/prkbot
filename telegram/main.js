const storage = require("../helpers/globaldata.js");
storage.init("bot");
const getimages = require("../modules/getimagebyname.js");
const tasker = require("./requestqueue.js");
const { Bot, InputFile } = require("grammy");
const { telegram } = require("../cfg.json");
const fs = require('fs');

const botToken = telegram.token;
const bot = new Bot(botToken);
storage.set("bot", bot);

const commandscache = {};
const commandfunccache = {};

function registerCommands() {
    const commands = [];
    const commandFiles = fs.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const commandName = file.split('.')[0];
        const commandData = require(`./commands/${file}`);
        commandscache[commandName] = commandData;
        if (!commandData.hide) {
            commands.push({ command: commandName, description: commandData.desc });
        }
        bot.command(commandName, (ctx) => {
            commandData.callback(ctx);
        });
    }

    const commandFuncFiles = fs.readdirSync(__dirname + '/commands_func').filter(file => file.endsWith('.js'));
    for (const file of commandFuncFiles) {
        const func_id = file.split('.')[0];
        const func_data = require(`./commands_func/${file}`);
        commandfunccache[func_id] = func_data;
    }

    bot.on("callback_query:data", async (ctx) => {
        if (storage.get("telegram_stop")) {
            await ctx.reply(`Генерируем данные! Ваш запрос не может быть обработан!\n\nПопробуйте снова через 30 секунд.`);
            return;
        }
        const data = ctx.callbackQuery.data;
        var userID = ctx.callbackQuery.from.id;
        console.log("requestfrom:", userID, data);

        if (data.startsWith('groups:')) {
            const group = data.split(':')[1];
            if (tasker.userHasBan(userID)) return;
            const message = await ctx.reply(`Обрабатываем ваш запрос... (Расписание ${group})`);
            tasker.add({
                ctx: ctx, userid: userID, addbantime: 1,
                func: async () => {
                    try {
                        const images = await getimages(group, "/groups");
                        const mediaGroup = images.map((fileName) => ({ type: 'photo', media: new InputFile(fileName) }));
                        mediaGroup[mediaGroup.length - 1].caption = `Расписание для ${group}`;
                        await ctx.replyWithMediaGroup(mediaGroup);
                        try { await ctx.api.deleteMessage(ctx.chat.id, message.message_id); } catch (e) { }
                    } catch (error) {
                        console.error("Ошибка отправки группы:", error);
                    }
                }
            });
        }

        if (data.startsWith('peoples:')) {
            const people = data.split(':')[1];
            if (tasker.userHasBan(userID)) return;
            const message = await ctx.reply(`Обрабатываем ваш запрос... (Расписание ${people})`);
            tasker.add({
                ctx: ctx, userid: userID, addbantime: 1,
                func: async () => {
                    try {
                        const images = await getimages(people, "/people");
                        const mediaGroup = images.map((fileName) => ({ type: 'photo', media: new InputFile(fileName) }));
                        mediaGroup[mediaGroup.length - 1].caption = `Расписание для ${people}`;
                        await ctx.replyWithMediaGroup(mediaGroup);
                        try { await ctx.api.deleteMessage(ctx.chat.id, message.message_id); } catch (e) { }
                    } catch (error) {
                        console.error("Ошибка отправки преподавателя:", error);
                    }
                }
            });
        }

        if (data.startsWith('rooms:')) {
            const room = data.split(':')[1];
            if (tasker.userHasBan(userID)) return;
            const message = await ctx.reply(`Обрабатываем ваш запрос... (Расписание для ${room})`);
            tasker.add({
                ctx: ctx, userid: userID, addbantime: 1,
                func: async () => {
                    try {
                        const images = await getimages(room, "/rooms");
                        const mediaGroup = images.map((fileName) => ({ type: 'photo', media: new InputFile(fileName) }));
                        mediaGroup[mediaGroup.length - 1].caption = `Расписание для ${room}`;
                        await ctx.replyWithMediaGroup(mediaGroup);
                        try { await ctx.api.deleteMessage(ctx.chat.id, message.message_id); } catch (e) { }
                    } catch (error) {
                        console.error("Ошибка отправки кабинета:", error);
                    }
                }
            });
        }

        if (data.startsWith('func:')) {
            const args = data.split(':');
            if (!commandfunccache[args[1]]) return;
            const argumentsArray = args.slice(1);
            try {
                commandfunccache[args[1]].func(ctx, ...argumentsArray);
            } catch (error) {
                console.error("Ошибка в func:", error);
            }
        }

        if (data.startsWith('redirect:')) {
            const command = data.split(':')[1];
            if (!commandscache[command]) return;
            try {
                commandscache[command].callback(ctx);
            } catch (error) {
                console.error("Ошибка в redirect callback:", error);
            }
            try {
                if (ctx) await ctx.deleteMessage();
            } catch (error) {
                console.log("Не удалось удалить сообщение при redirect (это нормально):", error.message);
            }
        }
    });

    bot.api.setMyCommands(commands);

    bot.on("message", async (ctx) => {
        try {
            await ctx.deleteMessage();
        } catch (error) {
            // Игнорируем ошибки удаления
        }
    });
}

function startBot() {
    registerCommands();
    bot.catch((err) => {
        console.error("Global bot error:", err);
    });
    bot.start();
}

startBot();