const express = require('express');
const app = express();
const fs = require("fs")
const path = require('path');

app.use('/files', express.static(path.join(__dirname, '..', 'files', 'temp', 'cources')));

fs.readdir(path.join(__dirname, '..', 'files', 'temp', 'cources'), (err, files) => {
  if (err) {
    console.error('Ошибка чтения директории:', err);
    return;
  }
  files.forEach(file => {
    if (path.extname(file) === '.html') {
      const fileName = path.parse(file).name;
      console.log('регистрация страницы /'+fileName)
      app.get('/'+fileName, (req, res) => {
        const filePath = path.join(__dirname, '..', 'files', 'temp', 'cources', fileName+'.html');
        res.sendFile(filePath);
      });
    }
  });
});

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', 'files', 'temp', 'cources', '1_1.html');
  res.sendFile(filePath);
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});