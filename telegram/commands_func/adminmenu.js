const { telegram } = require("../../cfg.json");
const storage = require("../../helpers/globaldata.js");
const settings = require("../../settings.js");

module.exports = {
    func: async (ctx) => {
        const buttons = [];
        buttons.push([{ text: 'Очистить Изображения/Таблицы', callback_data: 'func:tempclean' }]);
        buttons.push([{ text: 'Удалить идентификатор расписания', callback_data: 'func:removehash' }]);
        var mode = settings.get("deliverymode", "all");
        buttons.push([{ text: 'Авторассылка: ' + mode, callback_data: 'func:deliverymode' }]);
        if (mode != "off") {
            buttons.push([{ text: 'Запустить Авторассылку', callback_data: 'func:rundelivery' }]);
        }
        buttons.push([{ text: 'Очистить тасклист', callback_data: 'func:cleantasks' }]);
        buttons.push([{ text: 'Назад', callback_data: 'redirect:start' }]);

        await ctx.reply("Удаление идентификатора расписания скачает его заново и очистит изображения/таблицы (не запустит авторассылки)\nОчистка тасклиста полностью очистит тасклист (в случае если он завис должно помочь)", {
            reply_markup: { inline_keyboard: buttons }
        });
        try { await ctx.deleteMessage(); } catch (e) { }
    }
};