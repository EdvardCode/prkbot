const storage = require("../../helpers/globaldata.js")
const { generateInlineKeyboardButtons } = require("../helpers/buttonFormater.js")

module.exports = {
    desc : "Получить список Преподавателей",
    callback:async (ctx)=>{

          const buttons = generateInlineKeyboardButtons("peoples",storage.get("people"),2)
          buttons.push(                    [
            { text: '🚪 Кабинеты', callback_data: 'redirect:rooms' },
          ])
          buttons.push(                    [
              { text: 'Назад', callback_data: 'redirect:start' },
          ])
          await ctx.reply("Выберите Преподавателя", {
            reply_markup: {
              inline_keyboard: buttons,
            },
          });
    },
}