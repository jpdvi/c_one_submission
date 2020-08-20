#!/usr/bin/env node
// eslint-disable-line global-require
const express = require('express');
const http = require('http');
const dotenv = require('dotenv').config();
const Router = require('./router');
const cors = require('cors');
const logger = require('./logger')();

'use strict';
global.__basedir = __dirname;
 class Server
 {
  constructor()
  {
    this.app = express();
    this.router = null;
    this.port = 3001;
    this.start();
  }


  async start()
  {
    this.app.use(cors());
    this.app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.header("Access-Control-Allow-Methods: GET, POST");
      next();
    });
    this.router = new Router(this.app, express);
    this.router.initRouter();
    const server = http.createServer(this.app);
    server.listen(this.port);
    logger.info(`Server Running on port : ${this.port}`);
  }
}

const server = new Server();
