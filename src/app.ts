import path from 'path'
import koa, { Context } from 'koa'
import koaStatic from 'koa-static'
import koaBody from 'koa-body'
import koaRouter from 'koa-router'
import favicon from 'koa-favicon'
import cors from 'koa2-cors'

import log from './common/logger'
import addRouter from './router'
import tpl from './middleware/tpl'
import errorHandler from './middleware/error'
import { PREFIX } from './constant'

require('dotenv').config();

const app = new koa()
const router = new koaRouter({ prefix: PREFIX });
const baseDir = path.normalize(__dirname + '/..')

app.use(cors({
  origin: "http://localhost:3000",
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 86400,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
// session

// parse request
app.use(koaBody({
  jsonLimit: 1024 * 1024 * 5,
  formLimit: 1024 * 1024 * 5,
  textLimit: 1024 * 1024 * 5,
  multipart: true,// 解析FormData数据
  formidable: { uploadDir: path.join(baseDir, 'uploads') }
}));

// set static directory
app.use(koaStatic(path.join(baseDir, 'public'), { index: false }));
app.use(favicon(path.join(baseDir, 'public/favicon.jpg')));

// set template engine
app.use(tpl({ path: path.join(baseDir, 'public') }));

// handle the error
app.use(errorHandler());

// add route
addRouter(router);

app.use(router.routes()).use(router.allowedMethods());

// deal 404
app.use(async (ctx: Context) => {
  log.error(`404 ${ctx.message} : ${ctx.href}`);
  ctx.status = 404;
  ctx.body = '404! content not found !';
});

// koa already had middleware to deal with the error, just register the error event
app.on('error', (err, ctx: Context) => {
  log.error(err);//log all errors
  ctx.status = 500;
  if (ctx.app.env !== 'development') { //throw the error to frontEnd when in the develop mode
    ctx.res.end(err.stack); //finish the response
  } 
  // else {
  //   ctx.body = 'Server Error';
  // }
});

if (!module.parent) {
  const port = process.env.PORT || 3000;
  app.listen(port);
  // http.createServer(app.callback()).listen(port);// does the same like: app.listen(port)
  log.info(`=== app server running on port ${port}===`);
  console.log('app server running at: http://localhost:%d', port);
}