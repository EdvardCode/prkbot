// to fix single thread pupperteer generation
class queue {
    constructor(){
        this.queue = []
        this.idle = true
        this.bannedusers = {}
        this.timers = {}
    }

    add(task){
       // console.log("add task ",task)
        if(task.userid){
            //if(this.userHasBan(task.userid)){ // Это должно быть перед .add дабы можно было нескеолько задач закинуть
            //    return false
            //}
            clearTimeout(this.timers[task.userid])
            this.timers[task.userid] = setTimeout(() => {this.userUnBan(task.userid)}, 10000);// if task manager died we unbanned user later
            this.userBan(task.userid)
        }
        this.queue.push(task)
        this.#startworker()
        return true
    }
    #get(){
        return this.queue.shift()
    }
    #count(task){
        return this.queue.length
    }
    #startworker(){
        if(!this.idle) return
        this.idle = false
        this.#worker()
    }
    async #worker(){
        if(this.#count()>0){
            const task = this.#get()
           // console.log("work task ",task)
            clearTimeout(this.timers["skiptaskifbug"])
            this.timers["skiptaskifbug"] = setTimeout(() => {
                this.#worker(); 
                console.log("skipped bad task")
                if(task.ctx){
                    task.ctx.reply("Не удалось обработать ваш запрос.")
                }
            }, 30000);// if task manager died we skib bugged task

            await task.func()
            if(task.userid){
                if(this.userHasBan(task.userid)){
                    clearTimeout(this.timers[task.userid])
                    if (task.addbantime){
                        this.timers[task.userid] = setTimeout(() => {this.userUnBan(task.userid)}, task.addbantime*1000);
                    }else{
                        this.userUnBan(task.userid)
                    }
                }
            }
            clearTimeout(this.timers["skiptaskifbug"])
            this.#worker()
        }else{
            this.idle = true
        }
    }

    userUnBan(id){
        this.bannedusers[id] = null
    }
    userBan(id){
        this.bannedusers[id] = true
    }
    userHasBan(id){
        return this.bannedusers[id]
    }

}
const tasker = new queue()
module.exports = tasker