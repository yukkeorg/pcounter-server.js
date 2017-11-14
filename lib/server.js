'use strict'

const http = require('http')
const WebScoketServer = require('websocket').server
const express = require('express')


class ConnectionPool {
    constructo(limit=-1) {
        this.limit = limit
        this.connections = {}
    }

    add(c) {
        this.connection_list.push(conn)
    }

    delete(c) {
        for(let conn of this.connection_list) {
        }
    }
}

class Server {
    constructor(port=18888, client_dir) {
        this.port = port
        this.client_dir = client_dir

        this.app = express()
        this.server = http.createServer(this.app)
        this.wsServer = new WebScoketServer({
            httpServer: this.server,
            autoAcceptConnections: false,
        })

        this.wsconn_pool = {}
        this._wsconn_id = 0
    }

    setup() {
        this.app.use(express.static(this.client_dir))
        console.log('client source path: ' + this.client_dir)

        this.wsServer.on('request', (request) => {
            if(this.wsconn != null && this.wsconn.connected) {
                console.log('Already exists connection.')
                request.reject()
                return
            }
            let wsconn = request.accept(null, request.origin)
            wsconn.id = this._wsconn_id++
            this.wsconn_pool[wsconn.id] = wsconn
            console.log(`Connected: from ${request.host} ConnID: ${wsconn.id}`)
        })
        this.wsServer.on('close', (wsconn, closeReason, description) => {
            if(wsconn.id in this.wsconn_pool) {
                wsconn.close()
                delete this.wsconn_pool[wsconn.id]
                console.log(`Disconnected: ConnID: ${wsconn.id}`)
            }
        })

        this.server.listen(this.port, () => {
            console.log(`Server is litening on port ${this.port}`)
        })
    }

    sendTextToClients(data) {
        Object.keys(this.wsconn_pool).forEach(key => {
            const wsconn = this.wsconn_pool[key]
            if(wsconn && wsconn.connected) {
                wsconn.sendUTF(data)
            }
        })
    }
}

module.exports = Server

