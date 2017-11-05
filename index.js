'use strict'

const http = require('http')
const WebScoketServer = require('websocket').server
const UsbIO2 = require('./usbio2')


class ConnectionPool {
    constructor() {
        this._connections = []
    }

    append(conn) {
        this._connections.push(conn)
    }

    autovacuum() {
    }
}

function application() {
    const server = http.createServer((request, response) => {
        respomse.writeHead(404)
        response.end()
    })
    server.listen(18888, () => {
        console.log('Server is litening on port 18888')
    })

    const wsServer = new WebScoketServer({
        httpServer: server,
        autoAcceptConnections: false,
    })

    let wsconn = null;
    wsServer.on('request', (request) => {
        if(wsconn != null && wsconn.connected) {
            console.log('Already exists connection.')
            request.reject()
            return
        }
        wsconn = request.accept(null, request.origin)
        console.log('Connected from: ' + request.host)
    })
    wsServer.on('close', (wsconn, closeReason, description) => {
        console.log('Disconnected remote host')
    })

    let couter_data = {}

    const usbio2 = new UsbIO2()
    usbio2.on('changed', (data, onbits, offbits) => {
        console.log(`changed: ${data.toString(2)} ${onbits.toString(2)} ${offbits.toString(2)}`)
        if(wsconn) {
            wsconn.sendUTF(data.toString(16))
        }
    })
}

application()
