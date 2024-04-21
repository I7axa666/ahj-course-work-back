const fs = require('fs');

function stringToFile(base64String, path, fileName) {
  
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  // eslint-disable-next-line no-undef
  const buffer = Buffer.from(base64Data, 'base64');

  fs.writeFile(path, buffer, (err) => {
    if (err) {
      console.error('Ошибка сохранения:', err);
      return;
    }
    console.log('Файл сохранен:', fileName);
  });
}

module.exports = { stringToFile };