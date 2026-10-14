const db = require("../../database/db.js");
const storage = require("../../helpers/globaldata.js");
const tasker = require("../requestqueue.js")

const getimages = require("../../modules/getimagebyname.js")
const {telegram} = require("../../cfg.json")
const { Bot,InputFile } = require("grammy");

const settings = require("../../settings.js")

const setAllUsersMailTrue = async () => {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET mail = TRUE WHERE subscribes != '{}'`, (err) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const getUsersWithMail = async () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT userid, subscribes FROM users WHERE mail = TRUE LIMIT 1`, (err, rows) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const updateUserMailFalse = async (userid) => {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET mail = FALSE WHERE userid = ?`, [userid], (err) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

var worker 
worker = async ()=>{
    var mode = settings.get("deliverymode","all")
    if (mode == "off") return

    const user = await getUsersWithMail();
    if(!user || !user[0] || storage.get("telegram_stop")){
        console.log("stop dileviry")
        return
    }
    
    await updateUserMailFalse(user[0].userid);
    const userID = user[0].userid
    var send = true

    if (mode == "admins"){
        send = telegram.admins[userID]
    }

    if (send){
        var subs = user[0].subscribes
        if(subs || subs !== "{}" || subs.subscribes !== "{}"){
            subs = JSON.parse(subs)
            var incrementer = 0
            for (const key in subs) {  
                const item_name = subs[key]
                
                tasker.add({
                    userid : userID,
                    func : async ()=>{
                        incrementer+=1
                        try {
                            const images = await getimages(item_name,"/"+key)
                            const mediaGroup = images.map((fileName) => ({
                                type: 'photo',
                                media: new InputFile(fileName),
                            }));
                            mediaGroup[mediaGroup.length-1].caption = `Расписание для ${item_name}`
                            await storage.get("bot").api.sendMediaGroup(userID, mediaGroup);
                            if(incrementer>=Object.keys(subs).length){
                                await storage.get("bot").api.sendMessage(userID, `Изменения в расписании\n\n<b>${storage.get("vk_comment")}</b>\n\nОбновлено: <code>${storage.get("vk_lastupdate")}</code>`, { parse_mode: 'HTML' });
                            }
                        } catch (error) {
                            console.log("Ошибка в рассылке расписания!!!",error)
                        }
                    }
                })
            }
        }
    }
    tasker.add({
        func : worker
    })
}

module.exports.start = async () => {
    await setAllUsersMailTrue();
    tasker.add({
        func : worker
    })
};