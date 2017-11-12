'use strict'

const http = require('http')
const WebScoketServer = require('websocket').server
const express = require('express')


class Server {
    constructor(port=18888, client_dir) {
        this.port = port
        this.client_dir = client_dir

        this.app = express()
        this.app.use(express.static(this.client_dir))
        console.log('client source path: ' + this.client_dir)

        this.server = http.createServer(this.app)
        this.server.listen(this.port, () => {
            console.log(`Server is litening on port ${this.port}`)
        })

        this.wsServer = new WebScoketServer({
            httpServer: this.server,
            autoAcceptConnections: false,
        })

        this.wsconn = null;
        this.wsServer.on('request', (request) => {
            if(this.wsconn != null && this.wsconn.connected) {
                console.log('Already exists connection.')
                request.reject()
                return
            }
            this.wsconn = request.accept(null, request.origin)
            console.log('Connected from: ' + request.host)
        })

        this.wsServer.on('close', (wsconn, closeReason, description) => {
            console.log('Disconnected remote host')
        })
    }

    sendText(data) {
        if(this.wsconn && this.wsconn.connected) {
            this.wsconn.sendUTF(data)
        }
    }
}

module.exports = Server

