module.exports = (ctx) => {
    if (ctx.update) {
        if (ctx.update.message && ctx.update.message.from && ctx.update.message.from.id) {
            return ctx.update.message.from.id;
        }
        if (ctx.update.callback_query && ctx.update.callback_query.from && ctx.update.callback_query.from.id) {
            return ctx.update.callback_query.from.id;
        }
    }
    if (ctx.message && ctx.message.from && ctx.message.from.id) {
        return ctx.message.from.id;
    }
    if (ctx.callback_query && ctx.callback_query.from && ctx.callback_query.from.id) {
        return ctx.callback_query.from.id;
    }
    return "NAN";
};