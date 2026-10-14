const storage = require("../../helpers/globaldata.js")
const getuserid = require("../helpers/getuserid.js")
const { generateInlineKeyboardButtons } = require("../helpers/buttonFormater.js")
const {telegram} = require("../../cfg.json")
module.exports = {
    desc : "Начать работу с ботом",
    callback:async (ctx)=>{
        
        const userid = getuserid(ctx)
    
        const buttons = [
            [
                { text: `${telegram.emoji.groups} Группы`, callback_data: 'redirect:groups' },
                { text: `${telegram.emoji.people} Преподаватели`, callback_data: 'redirect:peoples' },
            ],
            [
                { text: `${telegram.emoji.getsubs} Запросить мои подписки`, callback_data: 'func:getsubscribes' },
                { text: `${telegram.emoji.subs} Подписки`, callback_data: 'redirect:automatization' },
            ],
        ]

        const endbuttons = [
            { text: `${telegram.emoji.close} Закрыть`, callback_data: 'func:closemenu' }, 
        ]
        if(telegram.admins[userid]){
            endbuttons.push({ text: '⚠️ Admin', callback_data: 'func:adminmenu' })
        }
        // ⚠️В данный момент бот в режиме разработки и может не отвечать на ваши запросы.\n\n
        buttons.push(endbuttons)
          await ctx.reply(`Добро пожаловать в генератор расписания.\n\n<b>${storage.get("vk_comment")}</b>\n\nОбновлено:\n<code>${storage.get("vk_lastupdate")}</code>\nСсылка на расписание: <a href="${storage.get("vk_url")}">Excel</a>`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:buttons,
            },
        });
    }
}
