


const tasker = require("../requestqueue.js")
const getuserid = require("../helpers/getuserid.js")
const { InputFile } = require("grammy");

module.exports = {
    func:async (ctx,none,day)=>{
        var userID = getuserid(ctx)
        if (tasker.userHasBan(userID)) return
        tasker.add({
            ctx : ctx,
            userid : userID,
            addbantime : 1, // Таскер выполняет эту задачу слишком быстро, поэтому мы добавили 1 секунду бана для юзера!
            func : async ()=>{
                const path = __dirname+"/../../files/temp/emptyrooms/"+day+".jpeg"
                await ctx.replyWithPhoto(new InputFile(path),{ caption: 'Свободные кабинеты на '+day+"\nЕсли кабинет помечен Красным или Желтым то его занимать НЕЛЬЗЯ!" });      
            }
        })
    }
}