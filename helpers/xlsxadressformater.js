module.exports.numberToAddress = (row, column) => {
    let columnName = '';
    while (column > 0) {
        const remainder = (column - 1) % 26;
        columnName = String.fromCharCode('A'.charCodeAt(0) + remainder) + columnName;
        column = Math.floor((column - 1) / 26);
    }
    return columnName + row.toString();
}

module.exports.addressToNumber = (index) => {
    if (!index || typeof index !== 'string') {
        console.warn(`[addressToNumber] Получен некорректный индекс:`, index, "| Использую запасной вариант A1");
        return { col: 1, row: 1 };
    }

    var upperIndex = index.toUpperCase().trim();
    var match = upperIndex.match(/([A-Z]+)(\d+)/);
    
    if (!match) {
        upperIndex = "A" + upperIndex;
        match = upperIndex.match(/([A-Z]+)(\d+)/);
    }

    if (!match) {
        console.error(`[addressToNumber] Не удалось распознать адрес ячейки: "${index}". Использую A1.`);
        return { col: 1, row: 1 };
    }

    const [, letters, number] = match;
    const column = letters.split('').reduce((acc, letter) => acc * 26 + (letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1), 0);
    const row = parseInt(number, 10);
    
    return { col: column, row: row };
}

module.exports.addToStringAddress = (address, add = [0, 0]) => {
    const row = add[0];
    const col = add[1];
    var cur_address = module.exports.addressToNumber(address);
    cur_address.row += row;
    cur_address.col += col;
    return module.exports.numberToAddress(cur_address.row, cur_address.col);
}