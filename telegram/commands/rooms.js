const storage = require("../../helpers/globaldata.js")
const { generateInlineKeyboardButtons } = require("../helpers/buttonFormater.js")

module.exports = {
    desc : "Получить список Кабинетов",
    callback:async (ctx)=>{
          const buttons = generateInlineKeyboardButtons("rooms",storage.get("rooms"),5)

          buttons.push([
            { text: 'Свободные кабинеты', callback_data: 'redirect:room_empty' }
          ])

          buttons.push([
              { text: 'Назад', callback_data: 'redirect:peoples' },
          ])

          await ctx.reply("Выберите Кабинет", {
            reply_markup: {
              inline_keyboard: buttons,
            },
          });
    },
}