
const ExcelJS = require('exceljs');
const adresformater = require("../helpers/xlsxadressformater.js")
const numberToAddress = adresformater.numberToAddress
const addressToNumber = adresformater.addressToNumber

const cfg = require("../cfg.json")

const err = (err)=>{
    console.error(err)
    console.trace()
}

class excelParser {
    constructor(data,sheetname) { 
        this.exceldata = data
        if(sheetname){
            this.setWorkSheet(sheetname)
        }
    }

    createExcel = async (path2file)=>{
        this.newExcel = new ExcelJS.Workbook();
        if(path2file) this.newExcel = await this.newExcel.xlsx.readFile(path2file)
        this.targetsheet = this.newExcel.getWorksheet(this.sheetname);
        if (!this.targetsheet) {
            this.targetsheet = this.newExcel.addWorksheet(this.sheetname);
        }
        return this.newExcel
    }

    getTargetSheet = ()=>{
        if(!this.targetsheet){err("Не найден excelParser.targetsheet")}
        return this.targetsheet
    }
    getSourceSheet = ()=>{
        if(!this.sourcesheet){err("Не найден excelParser.sourcesheet")}
        return this.sourcesheet
    }

    getExcel = ()=>{
        return this.newExcel || this.exceldata
    }

    saveExcel = async (savepath)=>{
        return await this.getExcel().xlsx.writeFile(savepath);
    }

    setWorkSheet = (sheetname = "Очное")=>{
        this.sheetname = sheetname
        this.sourcesheet = this.exceldata.getWorksheet(this.sheetname);
    }

    getRagne = (range)=>{
        //if(!range) err("Не указан arg#1 range")
        const cells = []
        this.scanRange(range,(row,col)=>{
            cells.push([row,col])
        })
        return cells
    }
    // toaddress считает на row+1 и col+1 это неправильно!!! к сожалению на такой ошибке я построил всю логику))) УДАЧИ!
    copyRange2Address = async (range,toaddress,options = {nomerge:false,unmerge:false,toadress:null}) => {

        var sourceSheet = this.getSourceSheet()
        var targetSheet = this.getTargetSheet()

        if(!sourceSheet||!targetSheet){err("Невозможно выполнить excelParser.moveRange2Address отсутствует excelParser.sourceSheet или excelParser.targetSheet вызовите excelParser.createExcel для устранения проблемы.");return}


        var offset = toaddress ? addressToNumber(toaddress[0]) : {col:0,row:0} 

        if (options && options.toadress){
            offset = options.toadress // можно задать адресс вручную... 
        }

        const point1Data = addressToNumber(range[0])
        const point2Data = addressToNumber(range[1])

        const rowRange = {min:point1Data.row,max:point2Data.row}
        const colRange = {min:point1Data.col,max:point2Data.col}

        const excelranges = {}
        for (let rowNumber = rowRange.min; rowNumber <= rowRange.max; rowNumber++) {
          for (let colNumber = colRange.min; colNumber <= colRange.max; colNumber++) {
            const sourceRow = sourceSheet.getRow(rowNumber);
            const sourceCell = sourceRow.getCell(colNumber);
            
            let targetrowRange = rowNumber - (rowRange.min-1) + (offset.row)
            let targetcolRange = colNumber - (colRange.min-1) + (offset.col)

            if (sourceCell.master !== sourceCell){
              var mastercolrow = addressToNumber(sourceCell.master.address)
              var curcolrow = addressToNumber(sourceCell.address)
              mastercolrow.row -= rowRange.min-1
              mastercolrow.col -= colRange.min-1
              curcolrow.row -= rowRange.min-1
              curcolrow.col -= colRange.min-1
              excelranges[numberToAddress(mastercolrow.row,mastercolrow.col)] = numberToAddress(curcolrow.row,curcolrow.col)
            }
    
            const targetRow = targetSheet.getRow(targetrowRange);
            var targetCell = targetRow.getCell(targetcolRange);
    
            //targetCell = sourceCell
            var pastecell = sourceCell
            
            if(sourceCell.master !== sourceCell){
                pastecell = sourceCell.master
            }

            targetCell.value = pastecell.value
            if(targetCell.value){
                var str = targetCell.value.toString()
                if(str.length > 32){
                    targetCell.value = str.substring(0,29)+"...";
                }
            }
            targetCell.fill = Object.assign({}, pastecell.fill);
            targetCell.numFmt = pastecell.numFmt;
            targetCell.alignment = Object.assign({}, pastecell.alignment);
            targetCell.font = Object.assign({}, pastecell.font);

            targetCell.font.size+=5

            targetCell.border = Object.assign({}, pastecell.border);
        
            targetRow.height = sourceRow.height;
            targetSheet.getColumn(targetcolRange).width = sourceSheet.getColumn(colNumber).width;

          }
        }

        if(!options.nomerge){
            for (const targetCellAddress in excelranges) {
                if (excelranges.hasOwnProperty(targetCellAddress)) {
                    const sourceCellAddress = excelranges[targetCellAddress];
    
                    const sourceCellAddressData = addressToNumber(sourceCellAddress)
                    const targetCellAddressData = addressToNumber(targetCellAddress)
    
                    sourceCellAddressData.row+=offset.row
                    sourceCellAddressData.col+=offset.col
    
                    targetCellAddressData.row+=offset.row
                    targetCellAddressData.col+=offset.col
                    //numberToAddress(sourceCellAddressData.row,sourceCellAddressData.col)
                    //numberToAddress(targetCellAddressData.row,targetCellAddressData.col)

                    if(options && options.unmerge){
                        targetSheet.unMergeCells(`${numberToAddress(sourceCellAddressData.row,sourceCellAddressData.col)}:${numberToAddress(targetCellAddressData.row,targetCellAddressData.col)}`);
                    }

                    targetSheet.mergeCells(`${numberToAddress(sourceCellAddressData.row,sourceCellAddressData.col)}:${numberToAddress(targetCellAddressData.row,targetCellAddressData.col)}`);
                }
            }
        }
    }


    cleanTargetStyles = async (range)=>{
        const sourcesheet = this.getTargetSheet()
        const startadress = addressToNumber(range[0])
        const endadress = addressToNumber(range[1])
        for (let rowNumber = startadress.row; rowNumber <= endadress.row; rowNumber++) {
            const sourceRow = sourcesheet.getRow(rowNumber);
            for (let colNumber = startadress.col; colNumber <= endadress.col; colNumber++) {
                const sourceCell = sourceRow.getCell(colNumber);
                sourceCell.value = ""
                sourceCell.fill = cfg.excel.emptyellstyle.fill
            } 
        }
    }



    scanRange = async (range,cb)=>{
        //if(!range) err("Не указан arg#1 range")
        const sourcesheet = this.getSourceSheet()
        const startadress = addressToNumber(range[0])
        const endadress = addressToNumber(range[1])
        for (let rowNumber = startadress.row; rowNumber <= endadress.row; rowNumber++) {
            const sourceRow = sourcesheet.getRow(rowNumber);
            for (let colNumber = startadress.col; colNumber <= endadress.col; colNumber++) {
                const sourceCell = sourceRow.getCell(colNumber);
                var stop = await cb(sourceRow,sourceCell)
                if(stop){break}
            } 
        }
    }
}

module.exports = excelParser






