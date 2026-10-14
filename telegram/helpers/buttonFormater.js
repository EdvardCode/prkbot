function generateInlineKeyboardButtons(dataway,values,colums = 4) {
    const result = [];
    const rows = Math.ceil(values.length / colums);
    for (let i = 0; i < rows; i++) {
      const rowButtons = [];
      for (let j = 0; j < colums; j++) {
        const index = i * colums + j;
        if (index < values.length) {
          rowButtons.push({
            text: values[index],
            callback_data: dataway+":"+values[index]
          });
        }
      }
      result.push(rowButtons);
    }
    return result;
  }


  module.exports.generateInlineKeyboardButtons = generateInlineKeyboardButtons