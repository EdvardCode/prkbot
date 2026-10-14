const fs = require("fs")
const path = require('path');
const storage = require("../helpers/globaldata.js")
const excel2html = require("./exceltohtml.js")
const html2image = require("./htmltoimage.js")

const tempdir = "./files/temp"
const telegramRequest = async (name,dirname = "")=>{

    return new Promise((resolve, reject) => {
    const path2element = tempdir+dirname+"/"+name
    //console.log(path2element)
    if(!fs.existsSync(path2element)){ 
        return;
    }
    fs.readdir(path2element, async (err, files) => {
        
        if (err) {
          console.error('Ошибка чтения директории:', err);
          return;
        }
        const jpegfiles = files.filter(file => path.extname(file) === ".jpeg");
        const xlsxfiles = files.filter(file => path.extname(file) === ".xlsx");
        try {
            if (jpegfiles.length < 3){
                var files = []
                for (let index = 0; index < xlsxfiles.length; index++) {
                    const file = xlsxfiles[index];
                    var path2html = await excel2html(path2element+"/"+file,path2element+"/"+(index+1)+".html")
                   //path2html+= `<style>
                   //html, body,table {
                   //    white-space: nowrap
                   //}   
                   //</style> `
                    const path2image = await html2image(path2html,path2element+"/"+(index+1)+".jpeg")
                    files.push((index+1)+".jpeg")
                }
                resolve(files.map(fileName => tempdir+`${dirname}/${name}/`+fileName))
            }else{
                resolve(jpegfiles.map(fileName => tempdir+`${dirname}/${name}/`+fileName))
            }
        } catch (error) {
            console.log(error)
        }
      });
 

    })

}


module.exports = telegramRequest