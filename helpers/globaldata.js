
class Storage {
    constructor(id){
        this.data = {}
    }
    init(id){
        this.data[id] = []
    }

    get(id){
        return this.data[id]
    }

    set(id,data){
        this.data[id] = data
    }

    add(id,data){
        this.data[id].push(data)
    }
    shift(id){
        this.data[id].shift()
    }
    clean(id){
        this.data[id] = null
    }
    sort(id){
        this.data[id].sort()
    }
}
var storage = new Storage()
module.exports = storage
