const storage = require("../../helpers/globaldata.js")
const { generateInlineKeyboardButtons } = require("../helpers/buttonFormater.js")

module.exports = {
    desc : "Получить список Групп",
    callback:async (ctx)=>{
          const buttons = generateInlineKeyboardButtons("groups",storage.get("groups"),3)
          buttons.push(                    [
              { text: 'Назад', callback_data: 'redirect:start' },
          ])
          await ctx.reply("Выберите группу", {
            reply_markup: {
              inline_keyboard: buttons,
            },
          });
    },
}