// const Koa = require('koa');
// const cors = require('@koa/cors');
// const { koaBody } = require('koa-body');
// const { DB } = require('./src/utilits/db');
// const serve = require('koa-static')
// const WS = require('ws');
// const http = require('http');

// const db = new DB();
// const app = new Koa();

// app.use(cors());
// app.use(koaBody({
//   urlencoded: true,
//   multipart: true,
//   json: true,
// }));

// app.use(serve(__dirname + '/src/public/'));


// // response
// app.use(ctx => {
//   if (ctx.request.method === 'GET') {
//     // ctx.status = 200;

//     // ctx.body = JSON.stringify(db.getDB());

//   } else if (ctx.request.method === 'POST' && ctx.request.url === '/addfile/') {
//     db.addAttach(ctx.request.files);
  
//     ctx.status = 201;
//     ctx.body = JSON.stringify('downloded');
//   } else if (ctx.request.method === 'POST' && ctx.request.url === '/addtext/') {
    
//     db.addText(ctx.request.body);
  
//     ctx.status = 201;
//     ctx.body = JSON.stringify('downloded');
//   }

// });

// const port = process.env.PORT || 3000;

// const server = http.createServer(app.callback());
// const wss = new WS.Server({ server });

// wss.on('connection', (ws) => {
//   console.log('ws connected');
//   const sendAllClients = () => {
//     const messageData = JSON.stringify(db.getDB());
//     Array.from(wss.clients)
//     .filter((client) => client.readyState === WS.OPEN)
//     .forEach((client) => client.send(messageData));
//   };

//   ws.on('message', (message) => {
//     const messageObject = JSON.parse(message.toString());
//     // console.log(messageObject);
//     if (messageObject.type === 'text') {
//       db.addText(messageObject.text)
//       .then(sendAllClients());
//     } else {
//       db.addAttach(messageObject)
//       .then(sendAllClients());
//     };
//   });

//   ws.send(JSON.stringify(db.getDB()));

// });

// server.listen(port, (error) => {
//   if (error) {
//     console.log(error);
//     return
//   }
//   console.log(`Server is running on http://localhost:${port}`);
// });

const Koa = require('koa');
const cors = require('@koa/cors');
const { koaBody } = require('koa-body');
const { DB } = require('./src/utilits/db');
const serve = require('koa-static')
const WS = require('ws');
const http = require('http');

// const db = new DB();
const app = new Koa();

app.use(cors());
app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

// eslint-disable-next-line no-undef
app.use(serve(__dirname + '/src/public/'));

app.use(async (ctx) => {
  try {
    if (ctx.method === 'GET') {
      console.log('get')
      ctx.body = JSON.stringify(db.getFavorite());
      ctx.status = 200;
    } else if (ctx.method === 'PATCH') {
      console.log(ctx.request.body);
      db.changeFavorite(ctx.request.body.id);
      ctx.status = 201;
      ctx.body = 'Changed';

    } else {
      ctx.throw(405, 'Method Not Allowed');
    }
  } catch (error) {
    ctx.status = error.status || 500;
    ctx.body = error.message;
  }
});

// eslint-disable-next-line no-undef
const port = process.env.PORT || 3000;

const server = http.createServer(app.callback());
const wss = new WS.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('WebSocket connected');

  // Send all clients the updated data
  const sendAllClients = () => {
    
    if(!db.getDB()) return;

    const messageData = JSON.stringify(db.getDB());
    
    wss.clients.forEach((client) => {
      if (client.readyState === WS.OPEN) {
        client.send(messageData);
      }
    });
  };

  ws.on('message', async (message) => {
    console.log('Received message:', message);
    try {
      const messageObject = JSON.parse(message.toString());
      if (messageObject.type === 'text') {
        await db.addText(messageObject.text);
      } else {
        await db.addAttach(messageObject);
      }
      sendAllClients();
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  
  ws.send(JSON.stringify(db.getDB()));
});

server.listen(port, (error) => {
  if (error) {
    console.error('Server startup error:', error);
    return;
  }
  console.log(`Server is running on http://localhost:${port}`);
});

const db = new DB(`http://localhost:${port}`);