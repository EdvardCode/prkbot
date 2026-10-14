const ExcelJS = require('exceljs');
const initalizefiles = require("../helpers/initalizefiles.js")
const excel2html = require("./exceltohtml.js")
const html2image = require("./htmltoimage.js")
const getimagebyname = require("./getimagebyname.js")
const excelParser = require("./excelparser.js")
const storage = require("../helpers/globaldata.js")

storage.init("telegram_stop")
storage.set("telegram_stop", true)

const fs = require("fs")
const adresformater = require("../helpers/xlsxadressformater.js");
const { kMaxLength } = require('buffer');
const numberToAddress = adresformater.numberToAddress
const addressToNumber = adresformater.addressToNumber
const addToStringAddress = adresformater.addToStringAddress
const SheetName = 'Очное';
const SheetName_rooms = 'кабинеты';

module.exports.run = async () => {
    return new Promise((resolve, reject) => {
        // ... остальной код без изменений
        storage.init("groups_cache")
        storage.init("people_cache")
        storage.init("rooms_cache")
        storage.init("groups")
        storage.init("people")
        storage.init("rooms")
        storage.init("empty_rooms")
        storage.set("telegram_stop",true)

        const mainWorkBook = new ExcelJS.Workbook();
        console.log("Загружаем основную таблицу")
        mainWorkBook.xlsx.readFile("./files/schedule.xlsx").then(async (data)=>{
            console.log("Основная таблица загружена")
            var startgenerator = new Date().getTime() / 1000;
        
            const schedule = new excelParser(mainWorkBook,SheetName)
            const sourceSheet = schedule.getSourceSheet()
            const lastRow = sourceSheet.lastRow.number;
            const lastColumn = sourceSheet.lastColumn.number;
            const lastColumAdress = numberToAddress(7,lastColumn)
            const downrightboxpoint = numberToAddress(lastRow,lastColumn)
            const tableadress = ["A7",lastColumAdress]

            var cource_range = []
            var oldscan = "A7"
            await schedule.scanRange(tableadress,async (row,col)=>{
                if(col.master == col && col.value && col.value === "Группа"){
                    if(oldscan){
                        cource_range.push({start:addToStringAddress(oldscan,[-1,3]),end:addToStringAddress(col.address,[110,-1])})
                    }
                    if(oldscan !== col.address){oldscan = col.address}
                } 
            })

            cource_range.shift() // первая итерация говной
            //console.log(cource_range)
            for (let index = 0; index < cource_range.length; index++) {
                const range = cource_range[index]
                if(range.start != range.end){
                    

                    var courses = await schedule.createExcel()
                    var coursesexcel = new excelParser(courses,SheetName)
                    
                    await schedule.copyRange2Address(["A6","C117"])
                    await schedule.copyRange2Address([range.start,range.end],["C0"])
                    await schedule.cleanTargetStyles(["A1","C1"])
                    await coursesexcel.saveExcel("./files/temp/cources/"+(index+1)+".xlsx")
                }
                
                const _sourceSheet = coursesexcel.getSourceSheet()
                const _lastRow = _sourceSheet.lastRow.number;
                const _lastColumn = _sourceSheet.lastColumn.number;
                const validates = {}
                for (let rowNumber = 0; rowNumber <= _lastRow; rowNumber++) {
                    const sourceRow = _sourceSheet.getRow(rowNumber);
                    const sourceCell = sourceRow.getCell(1);
                    var value = ""+sourceCell.value
                    const date = value.match(/(\W+)\s(\d+\.\d+\.\d+)/i);
                    if(date){
                        if(!validates[date[1]]) validates[date[1]] = {start:numberToAddress(rowNumber,1),end:numberToAddress(rowNumber,_lastColumn)}
                        validates[date[1]].end = numberToAddress(rowNumber,_lastColumn)
                    }
                }

                const ranges = Object.entries(validates).map(([day, times]) => [day, {start:times.start, end:times.end}]);
                for (let r_index = 0; r_index < ranges.length; r_index++) {
                    const element = ranges[r_index];
                    const nextelement = ranges[r_index+1];
                    const next_r_range = nextelement ? nextelement[1] : element
                    const r_range = element[1]
                    const start = r_range.start
                    const end = next_r_range ? next_r_range.end : r_range.end
                    if(end){
                        var courses_days = await coursesexcel.createExcel()
                        var courses_days_excel = new excelParser(courses_days,SheetName)
                        await coursesexcel.copyRange2Address(["A1",numberToAddress(4,_lastColumn)])
                        await coursesexcel.copyRange2Address([start,end],["A4"],{toadress:{col:0,row:4}})

                       //await courses_days_excel.scanRange(["A2",numberToAddress(2,_lastColumn)],async (row,col)=>{ // тут просили увеличить шрифт у групп, накидал сканнер который идет по верхней полоске групп. но потом передумали
                       //})

                        await courses_days_excel.saveExcel("./files/temp/cources/"+(index+1) + "_" +(r_index+1)+".xlsx")
                        var html = await excel2html("./files/temp/cources/"+(index+1) + "_" +(r_index+1)+".xlsx","./files/temp/cources/"+(index+1) + "_" +(r_index+1)+".html")

                        


                        var nexindex = index + 2
                        if (nexindex >= cource_range.length) nexindex = 1
                        html = `<script>
                            window.onload = function() {
                                document.body.style.zoom = "15%";
                                const date = new Date();
                                var curday = date.getDay();
                                if (curday > 5){ 
                                    curday = 1
                                }
                                if (curday <= 0){ 
                                    curday = 5
                                }
                                var metaTag = document.createElement('meta');
                                metaTag.setAttribute('http-equiv', 'refresh');
                                metaTag.setAttribute('content', '15; url=${nexindex}_'+curday);
                                var headTag = document.head || document.getElementsByTagName('head')[0];
                                headTag.appendChild(metaTag);
                                const newTitle = "Расписание"
                                document.getElementById('pageTitle').innerText = newTitle;
                                document.title = newTitle;
                            };
                        </script> 
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            html, body,table {
                                margin: 0;
                                padding: 0;
                                width: 100%;
                                height: 100%;
                                overflow: hidden;
                                margin: auto auto;
                            }   
                        </style>
                        `+ html 
                        //fs.writeFileSync("./files/temp/cources/"+(index+1)+".html",html)
                       fs.writeFileSync("./files/temp/cources/"+(index+1) + "_" +(r_index+1)+".html",html)
                    }
                }
            }

          //  fs.writeFileSync("./files/temp/cources/5.html",`
          //  <head></head>
          //  <script>
          //      var metaTag = document.createElement('meta');
          //      metaTag.setAttribute('http-equiv', 'refresh');
          //      metaTag.setAttribute('content', '15; url=1');
          //      var headTag = document.head || document.getElementsByTagName('head')[0];
          //      headTag.appendChild(metaTag);
          //  </script> 
          //  <iframe width=100% height=100%
          //  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          //  src='https://www.youtube.com/embed/p64UDZ5qCx0?autoplay=1&loop=1'>`)


            await schedule.scanRange(tableadress,async (row,col)=>{
                if(col.master == col && col.value && col.value !== "Группа"){
                    value = ""+col.value
                    if (!storage.get("groups_cache")[value]){
                        storage.get("groups_cache")[value] = true
                        storage.add("groups",col.value)
                        //console.log(col.value)
                    }
                }
            })


            await schedule.scanRange(tableadress,async (row,col)=>{
                if(col.master == col && col.value && col.value !== "Группа"){
                    try {
                        const startadress = addressToNumber(col.master.address)
                        var groupExcel = await schedule.createExcel()
                        await schedule.copyRange2Address(["A7","C117"]) // here time table
                        await schedule.copyRange2Address([numberToAddress(startadress.row,startadress.col),numberToAddress(lastRow,startadress.col + 1)],["C0"])
                    // if (schedule.getTargetSheet().getColumn(2).width > 15){
                    //     schedule.getTargetSheet().getColumn(2).width-=10
                    // }
                        
                        var groupTable = new excelParser(groupExcel,SheetName)
                        const _sourceSheet = groupExcel.getWorksheet("Очное")
                        const _lastRow = _sourceSheet.lastRow.number;
                        const _lastColumn = _sourceSheet.lastColumn.number;

                        const validates = {}
                        for (let rowNumber = 0; rowNumber <= _lastRow; rowNumber++) {
                            const sourceRow = _sourceSheet.getRow(rowNumber);
                            const sourceCell = sourceRow.getCell(1);
                            var value = ""+sourceCell.value
                            const date = value.match(/(\W+)\s(\d+\.\d+\.\d+)/i);
                            if(date){
                                if(!validates[date[1]]) validates[date[1]] = {start:numberToAddress(rowNumber,1),end:numberToAddress(rowNumber,_lastColumn)}
                                validates[date[1]].end = numberToAddress(rowNumber,_lastColumn)
                            }
                        }

                        const ranges = Object.entries(validates).map(([day, times]) => [day, {start:times.start, end:times.end}]);
                        ranges[0][1].start = "A1" // save title
                        const savepath = "./files/temp/groups/"+ col.value
                        initalizefiles.createpath(savepath)

                        var range1 = ranges[0][1].start
                        var range2 = ranges[1][1].end

                        await groupTable.createExcel()
                        await groupTable.copyRange2Address([range1,range2])
                        await groupTable.saveExcel(savepath+"/1.xlsx")

                        var range1 = ranges[2][1].start
                        var range2 = ranges[3][1].end
                        await groupTable.createExcel()
                        await groupTable.copyRange2Address([range1,range2])
                        await groupTable.saveExcel(savepath+"/2.xlsx")

                        var range1 = ranges[4][1].start
                        var range2 = ranges[5][1].end
                        await groupTable.createExcel()
                        await groupTable.copyRange2Address([range1,range2])
                        await groupTable.saveExcel(savepath+"/3.xlsx")
                        //console.log("Генерация завершена: ",col.value, ( (new Date().getTime() / 1000) - startgenerator),"sec")
                    } catch (error) {
                        console.log(error)
                    }
                }
            })



            const peopleranges = {}
            await schedule.scanRange(["A7",downrightboxpoint],async (row,col)=>{
                if(col.master == col && col.value){
                    var value = ""+col.value
                    const name = value.match(/^([А-яЁё]+\s\W\.\W\.$)/i);
                    if(name&&name[1]){
                        const savepath = "./files/temp/people/"+ value
                        if (!storage.get("people_cache")[value]){
                            storage.get("people_cache")[value] = true
                            storage.add("people",value)
                            initalizefiles.createpath(savepath)
                        }
                        if (!peopleranges[value]){peopleranges[value]={}}
                        const numaddress = addressToNumber(col.address)
                        if (!peopleranges[value][numaddress.row]){peopleranges[value][numaddress.row]=[]}
                        peopleranges[value][numaddress.row].push(numaddress.col)
                        if (!peopleranges[value]) peopleranges[value] = []
                    }
                }
            })


            for (const name in peopleranges) {
                const savepath = "./files/temp/people/"+ name
                var prev_item_address = 0
                var ceil_offset = 0
                var peoplemaket = await schedule.createExcel()
                await schedule.copyRange2Address(["A9","C117"])
                await schedule.copyRange2Address(["D9","E117"],["C0"])
                await schedule.cleanTargetStyles(["D2","E117"])
                schedule.getTargetSheet().getColumn(2).width = 5;

                var pages = 1
                for (const row in peopleranges[name]) {
                    if(pages < peopleranges[name][row].length){
                        pages = peopleranges[name][row].length
                    }
                }

                for (let ceil_offset = 0; ceil_offset < pages; ceil_offset++) {
                    const offset = ceil_offset * 2
                    await schedule.copyRange2Address(["D9","E117"],[addToStringAddress("C0",[0,offset])],{unmerge:true})
                    await schedule.cleanTargetStyles([
                        addToStringAddress("D2",[0,offset]),
                        addToStringAddress("E117",[0,offset]),
                    ])
                }

                if (peopleranges.hasOwnProperty(name)) {
                    const rows = peopleranges[name];
                    for (const row in rows) {
                        if(rows.hasOwnProperty(row)){
                            const cols = rows[row]
                            for (let index = 0; index < cols.length; index++) {
                                const col = cols[index];
                                var name_address = {row:row,col:col}
                                var room_address = {row:name_address.row,col:name_address.col+1}
                                room_address = numberToAddress(room_address.row, room_address.col)
                                var item_address = sourceSheet.getRow(name_address.row-1).getCell(name_address.col).master.address;
                                var cell = sourceSheet.getRow(name_address.row).getCell(name_address.col)
                                var groupname = sourceSheet.getRow(7).getCell(name_address.col).master.value
                                var oldval = cell.master.value
                                var oldalignment = cell.master.alignment
                                cell.master.value = groupname
                                var pastepos = addressToNumber(item_address)
                                pastepos.row -= 9
                                pastepos.col = 3
                                var ceil_offset = index * 2
                                pastepos.col = 3 + ceil_offset
                                pastepos = numberToAddress(pastepos.row, pastepos.col)
                                await schedule.copyRange2Address([item_address,room_address],[pastepos],{nomerge:true,unmerge:true})
                                cell.master.alignment = oldalignment
                                cell.master.value = oldval
                                cell.alignment = oldalignment
                            }
                        }
                    }
                }

                var peoplemakettable = new excelParser(peoplemaket,SheetName)
                const _sourceSheet = peoplemaket.getWorksheet("Очное")
                const _lastRow = _sourceSheet.lastRow.number;
                const _lastColumn = _sourceSheet.lastColumn.number;

                const validates = {}
                for (let rowNumber = 0; rowNumber <= _lastRow; rowNumber++) {
                    const sourceRow = _sourceSheet.getRow(rowNumber);
                    const sourceCell = sourceRow.getCell(1);
                    var _value = ""+sourceCell.value
                    const date = _value.match(/(\W+)\s(\d+\.\d+\.\d+)/i);
                    if(date){
                        if(!validates[date[1]]) validates[date[1]] = {start:numberToAddress(rowNumber,1),end:numberToAddress(rowNumber,_lastColumn)}
                        validates[date[1]].end = numberToAddress(rowNumber,_lastColumn)
                    }
                }

                const ranges = Object.entries(validates).map(([day, times]) => [day, {start:times.start, end:times.end}]);
                ranges[0][1].start = "A1" // save title

                var range1 = ranges[0][1].start
                var range2 = ranges[1][1].end

                await peoplemakettable.createExcel()
                await peoplemakettable.copyRange2Address([range1,range2])
                await peoplemakettable.saveExcel(savepath+"/1.xlsx")

                var range1 = ranges[2][1].start
                var range2 = ranges[3][1].end
                await peoplemakettable.createExcel()
                await peoplemakettable.copyRange2Address([range1,range2])
                await peoplemakettable.saveExcel(savepath+"/2.xlsx")

                var range1 = ranges[4][1].start
                var range2 = ranges[5][1].end
                await peoplemakettable.createExcel()
                await peoplemakettable.copyRange2Address([range1,range2])
                await peoplemakettable.saveExcel(savepath+"/3.xlsx")
            }

            storage.clean("people_cache")
            storage.clean("groups_cache")
            storage.sort("people")

        

            const rooms_point = {}
            //console.log(numberToAddress(9,lastColumn))
            await schedule.scanRange(["A9",numberToAddress(9,lastColumn)],async (row,col)=>{
                if(col.master == col && col.value && col.value === "Каб."){
                    await schedule.scanRange([col.address,addToStringAddress(col.address,[lastRow-9,0])],async (row,col)=>{
                        if(col.master == col && col.value && col.value !== "Каб."){
                            var value = col.value.toString()
                                value = value.replace("/", "")
                            if (!storage.get("rooms_cache")[value]){
                                storage.get("rooms_cache")[value] = true
                                storage.add("rooms",value)
                                initalizefiles.createpath("./files/temp/rooms/"+value)
                            }
                            if(!rooms_point[value]) rooms_point[value] = {}
                            //console.log(col.master.address)
                            const num_address = addressToNumber(col.master.address)
                            var item_row = sourceSheet.getRow(num_address.row+1)
                            var item_cell = item_row.getCell(num_address.col-1)
                            if (item_cell.value){
                                const name = item_cell.value.match(/^([А-яЁё]+\s\W\.\W\.$)/i);
                                if(name&&name[1]){
                                    if(!rooms_point[value][num_address.row]) rooms_point[value][num_address.row] = []
                                    rooms_point[value][num_address.row].push(num_address.col)
                                }
                            }
                        }
                    })
                }
            })
            //console.log( storage.get("rooms") )
            for (var room in rooms_point) {
                room = room.replace("/"," ")
                const savepath = "./files/temp/rooms/"+room
                var roommaket = await schedule.createExcel()
                await schedule.copyRange2Address(["A9","C117"])
                await schedule.copyRange2Address(["D9","E117"],["C0"])
                await schedule.cleanTargetStyles(["D2","E117"])
                var pages = 1
                for (const row in rooms_point[room]) {
                    if(pages < rooms_point[room][row].length){
                        pages = rooms_point[room][row].length
                    }
                }
                for (let ceil_offset = 0; ceil_offset < pages; ceil_offset++) {
                    const offset = ceil_offset * 2
                    await schedule.copyRange2Address(["D9","E117"],[addToStringAddress("C0",[0,offset])],{unmerge:true})
                    await schedule.cleanTargetStyles([
                        addToStringAddress("D2",[0,offset]),
                        addToStringAddress("E117",[0,offset]),
                    ])
                }
                if (rooms_point.hasOwnProperty(room)) {
                    const rows = rooms_point[room];
                    for (const row in rows) {
                        if(rows.hasOwnProperty(row)){
                            const cols = rows[row]
                            for (let index = 0; index < cols.length; index++) {
                                var _row = Number(row)
                                var _col = Number(cols[index])
                            var startaddress = sourceSheet.getRow(_row).getCell(_col-1).master.address
                            var endaddress = sourceSheet.getRow(_row+1).getCell(_col).address

                            var groupname = sourceSheet.getRow(7).getCell(_col-1).value
                            var people_cell = sourceSheet.getRow(_row+1).getCell(_col-1)
                            const oldname = people_cell.master.value
                            people_cell.master.value = groupname + " " + oldname

                            var pastepos = addressToNumber(startaddress)
                            pastepos.row -= 9
                            pastepos.col = 3
                            var ceil_offset = index * 2
                            pastepos.col = 3 + ceil_offset
                            pastepos = numberToAddress(pastepos.row, pastepos.col)
                            await schedule.copyRange2Address([startaddress,endaddress],[pastepos],{unmerge:true})
                            people_cell.master.value = oldname
                            }
                        }
                    }
                }

                var roommakettable = new excelParser(roommaket,SheetName)
                const _sourceSheet = roommaket.getWorksheet("Очное")
                const _lastRow = _sourceSheet.lastRow.number;
                const _lastColumn = _sourceSheet.lastColumn.number;

                const validates = {}
                for (let rowNumber = 0; rowNumber <= _lastRow; rowNumber++) {
                    const sourceRow = _sourceSheet.getRow(rowNumber);
                    const sourceCell = sourceRow.getCell(1);
                    var _value = ""+sourceCell.value
                    const date = _value.match(/(\W+)\s(\d+\.\d+\.\d+)/i);
                    if(date){
                        if(!validates[date[1]]) validates[date[1]] = {start:numberToAddress(rowNumber,1),end:numberToAddress(rowNumber,_lastColumn)}
                        validates[date[1]].end = numberToAddress(rowNumber,_lastColumn)
                    }
                }

                const ranges = Object.entries(validates).map(([day, times]) => [day, {start:times.start, end:times.end}]);
                ranges[0][1].start = "A1" // save title

                var range1 = ranges[0][1].start
                var range2 = ranges[1][1].end

                await roommakettable.createExcel()
                await roommakettable.copyRange2Address([range1,range2])
                await roommakettable.saveExcel(savepath+"/1.xlsx")

                var range1 = ranges[2][1].start
                var range2 = ranges[3][1].end
                await roommakettable.createExcel()
                await roommakettable.copyRange2Address([range1,range2])
                await roommakettable.saveExcel(savepath+"/2.xlsx")

                var range1 = ranges[4][1].start
                var range2 = ranges[5][1].end
                await roommakettable.createExcel()
                await roommakettable.copyRange2Address([range1,range2])
                await roommakettable.saveExcel(savepath+"/3.xlsx")
            }
            storage.sort("rooms")
            storage.clean("rooms_cache")

            const empty_rooms = new excelParser(mainWorkBook,SheetName_rooms)
            const empty_rooms_sheet = empty_rooms.getSourceSheet()
            const rooms_lastRow = empty_rooms_sheet.lastRow.number;
            const rooms_lastColumn = empty_rooms_sheet.lastColumn.number;

            const results = {}
            
            //ARGB          AA RR GG BB  // Памятка
            //FFFFFF00      FF FF FF 00  // Это желтый
            const bannedColors = {
                "FFFFFF00":true, // red
                "FFFF0000":true, // yellow
            }

            const argb2rgba = (str)=>{
                var alpha = 66//str.substring(0,2)
                var rgb = str.substring(2,8)
                //console.log(rgb,alpha)
                return rgb+alpha
            }



            await empty_rooms.scanRange(["B1",numberToAddress(rooms_lastRow,2)],async (row,col)=>{
                if (col.master == col){
                    const num_address = addressToNumber(col.address)
                    var day = empty_rooms_sheet.getRow(num_address.row).getCell(num_address.col - 1).value
                    const time = empty_rooms_sheet.getRow(num_address.row).getCell(num_address.col + 1)
                    const para = col.value


                    if(para && day != "" ){
                        day = day.trim()
                        await empty_rooms.scanRange([numberToAddress(num_address.row,1),numberToAddress(num_address.row,rooms_lastColumn)],async (row,col)=>{
                            if(col.value && day != ""){
                                const room_line_address = addressToNumber(col.address)
                                const room = empty_rooms_sheet.getRow(1).getCell(room_line_address.col)
                                
                                if(!results[day]){
                                    results[day] = {}
                                }
                                if(!results[day][para]){
                                    results[day][para] = {}
                                    results[day][para].empty = []
                                    results[day][para].time = time.value
                                }
                                if(room.value && room.value !== "!!!" && !col.value.result){

                                    if(col.fill && col.fill.fgColor && col.fill.fgColor.argb /*&& bannedColors[col.fill.fgColor.argb]*/ ){
                                        results[day][para].empty.push({room:room.value,color:argb2rgba(col.fill.fgColor.argb)})
                                        return
                                    }
                                    results[day][para].empty.push(room.value)
                                }
                            }
                        })
                        results[day][para].empty.sort()
                    }
                }
            })

            for (const day in results) {
                var emptyroomshtml = fs.readFileSync(__dirname+'/../files/rooms.html',{ encoding: 'utf8', flag: 'r' });
                emptyroomshtml = emptyroomshtml.replace("{{DAY}}",day)
                var body = ""
                const daySchedule = results[day];
                for (const lesson in daySchedule) {
                    var data = daySchedule[lesson]
                    body+=`<tr>`
                    body+=`<td>${lesson}</td>`
                    body+=`<td>${data.time}</td>`
                    body+=`<td>`
                    body+=`<div class="td-room">`
                    for (let index = 0; index < data.empty.length; index++) {
                        const element = data.empty[index];
                        if(!element.room){
                            body += `<span class="room">${element}</span>`
                        }
                    }
                    for (let index = 0; index < data.empty.length; index++) {
                        const element = data.empty[index];
                        if(element.room){
                            body += `<span class="room" style="background-color: #${element.color}">${element.room}</span>`
                        }
                    }
                    body+=`</div>`
                    body+=`</td>`
                    body+=`</tr>`
                }
                emptyroomshtml = emptyroomshtml.replace("{{BODY}}",body)
                await html2image(emptyroomshtml,__dirname+"/../files/temp/emptyrooms/"+day+".jpeg")
            }



            storage.set("telegram_stop",false)
            console.log("Генерация Excel завершена ",new Date().getTime() / 1000 - startgenerator,"sec")
            resolve()
            //await schedule.newExcel()
            //schedule.copyRange2Address(["A7","C12"],["A1"])
            //schedule.copyRange2Address(["A7","C12"],["D1"])
            //await schedule.saveExcel("./files/temp/test.xlsx")
        })
    })
}

