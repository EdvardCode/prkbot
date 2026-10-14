

const {telegram} = require("../../cfg.json")
const tasker = require("../requestqueue.js")
module.exports = {
    func:async (ctx)=>{
       // console.log(ctx.update.callback_query)
        const userid = ctx.update.callback_query.from.id
        if(!telegram.admins[userid]) return
        tasker.queue = []
        tasker.add({
            func : async ()=>{
                await ctx.reply("Admin: Задача на отчистку выполнена.")
            }
        })
        await ctx.reply("Admin: Отчищаем...")
    }
}