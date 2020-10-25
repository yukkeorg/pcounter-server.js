'use strict';

const log4js = require("log4js");
const http = require("http");
const express = require("express");
const WebSocket = require("ws");

const logger = log4js.getLogger();


class Server {
  constructor(public_dir, port=18888) {
    this.port = port;
    this.public_dir = public_dir;

    this.app = null;
    this.server = null;
    this.wsServer = null;
  }

  setup(options) {
    this.app = express();
    this.app.use(express.static(this.public_dir));
    this.app.use(express.json());
    for(const method of ['get', 'post', 'put', 'delete']) {
      if(method in options) {
        const routes = options[method];
        Object.keys(routes).forEach((key) => {
          this.app[method](key, routes[key]);
        });
      }
    }

    this.httpServer = http.createServer(this.app);
    this.httpServer.listen(this.port, () => {
      logger.info(`Server is litening on port ${this.port}`);
    });
    logger.info('Static file path: ' + this.public_dir);


    this.wsServer = new WebSocket.Server({server: this.httpServer});
    // Websocket request message
    this.wsServer.on('connection', (ws, req) => {
      if(options.on_ws_connected) {
        options.on_ws_connected(ws);
      }
      logger.info("Client Connected");
    });
  }

  sendTextToClients(data) {
    this.wsServer.clients.forEach((client) => {
      if(client !== this.wsServer &&
         client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

module.exports = Server;
