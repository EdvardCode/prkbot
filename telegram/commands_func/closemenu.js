module.exports = {
    func: async (ctx) => {
        try {
            if (ctx.update.callback_query && ctx.update.callback_query.message) {
                await ctx.api.deleteMessage(
                    ctx.update.callback_query.message.chat.id,
                    ctx.update.callback_query.message.message_id
                );
            }
        } catch (error) {
            console.log("Не удалось закрыть меню:", error.message);
        }
    }
};