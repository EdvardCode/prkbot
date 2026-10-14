const {telegram} = require("../../cfg.json")
const storage = require("../../helpers/globaldata.js")

const db = require("../../database/db.js")
const getuserid = require("../helpers/getuserid.js")


module.exports = {

    func:async (ctx,cmd,arg,data)=>{
      
        const userid = getuserid(ctx)
        var subs = await db.getUserSubScribes(userid)
            subs = JSON.parse(subs.subscribes)

        const buttons = []
        buttons.push(                    [
            { text: 'Назад', callback_data: 'redirect:automatization' },
        ])

        if(arg==="unsub"){
            delete subs[data]
           // console.log(userid,subs)
            db.setUserSubScribe(userid,JSON.stringify(subs))
            await ctx.reply("Подписка отменена", {
              reply_markup: {
                inline_keyboard: buttons,
              },
            });
            await ctx.deleteMessage()
            return 
        }
       // func:automatization:
        subs[arg] = data
        db.setUserSubScribe(userid,JSON.stringify(subs))
        await ctx.reply("Вы подписались на "+data, {
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
        await ctx.deleteMessage()
    },
}