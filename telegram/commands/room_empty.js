const storage = require("../../helpers/globaldata.js")
const { generateInlineKeyboardButtons } = require("../helpers/buttonFormater.js")

module.exports = {
    hide:true,
    desc : "Сободные кабинеты",
    callback:async (ctx)=>{
            const buttons=[]


            buttons.push([
                { text: 'Понедельник', callback_data: 'func:getroomimage:Понедельник' }
            ])
            buttons.push([
                { text: 'Вторник', callback_data: 'func:getroomimage:Вторник' }
            ])
            buttons.push([
                { text: 'Среда', callback_data: 'func:getroomimage:Среда' }
            ])
            buttons.push([
                { text: 'Четверг', callback_data: 'func:getroomimage:Четверг' }
            ])
            buttons.push([
                { text: 'Пятница', callback_data: 'func:getroomimage:Пятница' }
            ])
            buttons.push([
                { text: 'Суббота', callback_data: 'func:getroomimage:Суббота' }
            ])

            buttons.push([
                { text: 'Назад', callback_data: 'redirect:rooms' },
            ])
          await ctx.reply("Выберите День", {
            reply_markup: {
              inline_keyboard: buttons,
            },
          });
    },
}