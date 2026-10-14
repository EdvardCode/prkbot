const {telegram} = require("../../cfg.json")

const getuserid = require("../helpers/getuserid.js")
const db = require("../../database/db.js")

module.exports = {
    hide : true,
    desc : "",
    callback:async (ctx)=>{
        const buttons = []
        const userid = getuserid(ctx)

       const user = await db.createUser(userid)
       var subscribes = {}
       if(user.subscribes && user.subscribes != "{}"){
          //console.log(user.subscribes)
          subscribes = JSON.parse(user.subscribes)
       }

        buttons.push(                    [
            { text: `${telegram.emoji.groups} Группы ${subscribes.groups ? " | "+subscribes.groups : ""}`, callback_data: 'func:automatization:groups' },
        ])

        buttons.push(                    [
          { text: `${telegram.emoji.people} Преподаватели ${subscribes.people ? " | "+subscribes.people : ""}`, callback_data: 'func:automatization:people' },
        ])

       //buttons.push(                    [
       //  { text: `${telegram.emoji.people} Преподаватели ${subscribes.people ? " | "+subscribes.people : ""}`, callback_data: 'func:automatization:people' },
       //])

        buttons.push(                    [
            { text: 'Назад', callback_data: 'redirect:start' },
        ])

        await ctx.reply("Подписка позволит получать расписание при его обновлении/изменении.\n\n⚠️Вы можете подписаться только на 1 группу и на 1 преподавателя.", {
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
    },
}