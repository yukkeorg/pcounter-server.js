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

    let counter_data = {
        total: 0,
        current: 0,
        bonus: 0,
        bonus_chain: 0,
        is_bonustime: false,
        is_chancetime: false,
    }

    const usbio2 = new UsbIO2()
    usbio2.on('changed', (data, onbits, offbits) => {
        console.log(`changed: ${data.toString(2)} ${onbits.toString(2)} ${offbits.toString(2)}`)
        let changed = false

        if(onbits & 0x04) {
            counter_data.is_chancetime = true
            changed = true
        }
        if(offbits & 0x04) {
            counter_data.is_chancetime = false
            counter_data.bonus_chain = 0
            changed = true
        }
        if(onbits & 0x01) {
            counter_data.total++
            counter_data.current++
            changed = true
        }
        if(onbits & 0x02) {
            counter_data.bonus++
            counter_data.is_bonustime = true
            if(counter_data.is_chancetime) {
                counter_data.bonus_chain++
            }
            changed = true
        }
        if(offbits & 0x02) {
            counter_data.current = 0
            counter_data.is_bonustime = false
            changed = true
        }
        if(wsconn && changed) {
            wsconn.sendUTF(JSON.stringify(counter_data))
        }
    })
}

application()
