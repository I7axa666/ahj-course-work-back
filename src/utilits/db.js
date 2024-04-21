const { v4: uuidv4 } = require('uuid');
const path = require('node:path');
const fs = require('fs');
const { stringToFile } = require('../utilits/stringToFile');


class DB {
  constructor (url) {
    this.messages = {};
    this.url = url;
    // eslint-disable-next-line no-undef
    this.parentDir = path.resolve(__dirname, '..');
    this.publicPath = undefined;
  }
  addText (message) {
    
    this.messages.id = uuidv4();
    this.messages.text = message;
    this.messages.type = 'text';
    this.messages.date = Date.now();
    this.messages.favorite = false;

    const messageList = path.join(this.parentDir, 'public', 'json', 'messageList.json');

    let newList = [];

    if (fs.existsSync(messageList)) {
      const data = fs.readFileSync(messageList, 'utf8');
      if (data) {newList = JSON.parse(data)}
    }
    
    return new Promise((resolve) => {
     fs.writeFile(messageList, JSON.stringify([...newList, this.messages]) + '\n', (err) => {
       if (err) {
         console.log(err);
         return
       }
       
       resolve(console.log('messageList.json updated'));
       this.messages = {};
      })
   })
    

  }

  addAttach(fileOject) {
    // console.log(fileOject);
    const { type, file, fileName } = fileOject;
    let folderName;
    if (type === 'image') {
      folderName = 'img';
    } else if (type === 'audio') {
      folderName = 'audio';
    }
    else if (type === 'video') {
      folderName = 'video';
    } else {
      this.folderName = 'other';
    }

    const id = uuidv4();
    const attachName = `${id}__${fileName}`;
    const attachPath = path.join(this.parentDir, 'public', folderName, attachName);

    stringToFile(file, attachPath, fileName)

    const newMessage = {
      id: id,
      text: fileName,
      type: type,
      date: Date.now(),
      favorite: false,
      attach: `${this.url}${folderName}/${attachName}`,
    };

    const messageListPath = path.join(this.parentDir, 'public', 'json', 'messageList.json');
    
    const messageList = fs.existsSync(messageListPath) ? JSON.parse(fs.readFileSync(messageListPath, 'utf8')) : [];
    messageList.push(newMessage);

    fs.writeFileSync(messageListPath, JSON.stringify(messageList, null, 2));
    console.log('messageList.json updated');
  
  }

  getDB() {
    const messageList = path.join(this.parentDir, 'public', 'json', 'messageList.json');
    const data = fs.readFileSync(messageList, 'utf8');
    if (!data) {
      return [];
    }
    return JSON.parse(data);  
  }

  changeFavorite(id) {
    const messageList = path.join(this.parentDir, 'public', 'json', 'messageList.json');
    const data = fs.readFileSync(messageList, 'utf8');
    if (!data) {
      return [];
    }
    const newData = JSON.parse(data).map((message) => {
      if (message.id === id) {
        message.favorite = !message.favorite;
      }
      return message;
    });
    fs.writeFileSync(messageList, JSON.stringify(newData, null, 2));
    console.log('messageList.json updated');
  }
  
  getFavorite () {
    const messageList = path.join(this.parentDir, 'public', 'json', 'messageList.json');
    const data = fs.readFileSync(messageList, 'utf8');
    if (!data) {
      return [];
    }
    return JSON.parse(data).filter(message => message.favorite);
  }
}

module.exports = { DB };
