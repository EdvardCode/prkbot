
const temcleaner = require("../../helpers/tempcleaner.js")
const {telegram} = require("../../cfg.json")
const editor = require("../../modules/exceleditor.js")
const loader = require("../../downloader/downloader.js")
const settings = require("../../settings.js")
module.exports = {
    func:async (ctx)=>{
        const userid = ctx.update.callback_query.from.id
        if(!telegram.admins[userid]) return

        await temcleaner.run()
        await ctx.reply("Admin: Удаляем КЭШ")
        settings.set("scheduleurl","")
        
        await loader.run()
        await ctx.reply("Admin: Скачиваем новое расписание")

        await editor.run()
        await ctx.reply("Admin: Таблица сгенерированна")
    }
}