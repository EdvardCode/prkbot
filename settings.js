var settings = require("./files/settings.json");
const fs = require("fs");

const save = () => {
    fs.writeFileSync("./files/settings.json", JSON.stringify(settings));
};

module.exports.set = (id, val) => {
    settings[id] = val;
    save();
};

module.exports.get = (id, def) => {
    if (!settings[id]) return def;
    return settings[id];
};