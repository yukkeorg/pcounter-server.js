'use strict'

const config = require('config')
const path = require('path')

const Server = require('./server')
const UsbIO2 = require('./usbio2')


module.exports = function() {
    let counter_data = {
        total: 0,
        current: 0,
        bonus: 0,
        bonus_chain: 0,
        is_bonustime: false,
        is_chancetime: false,
    }

    const server = new Server(config.server.port, config.server.client_dir)
    server.setup({on_connected: (wsconn) => {
        wsconn.sendUTF(JSON.stringify(counter_data))
    }})

    const usbio2 = new UsbIO2()
    usbio2.on('changed', (data, onbits, offbits) => {
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

        if(changed) {
            server.sendTextToClients(JSON.stringify(counter_data))
        }
    })
}
