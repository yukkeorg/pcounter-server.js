'use strict'

const config = require('config')
const path = require('path')

const Server = require('./server')
const UsbIO2 = require('./usbio2')


module.exports = function() {
    let title_data = {
        type: "title",
        title: " ",
    }
    let counter_data = {
        type: "counter",
        total: 0,
        current: 0,
        bonus: 0,
        bonus_chain: 0,
        is_bonustime: false,
        is_chancetime: false,
    }

    const server = new Server(config.server.port, config.server.client_dir)
    server.setup({
        get: {
            '/export': (req, res) => {
                res.json(counter_data)
            }
        },
        post: {
            '/import': (req, res) => {
                Object.keys(req.body).forEach((key) => {
                    if(key in counter_data) {
                        counter_data[key] = req.body[key]
                    }
                })
                server.sendTextToClients(JSON.stringify(counter_data))
                res.sendStatus(200)
            },
            '/set_title': (req, res) => {
                if ('title' in req.body) {
                    title_data.title = req.body.title
                    server.sendTextToClients(JSON.stringify(title_data))
                }
                res.sendStatus(200)
            }
        },
        on_ws_connected: (wsconn) => {
            wsconn.sendUTF(JSON.stringify(title_data))
            wsconn.sendUTF(JSON.stringify(counter_data))
        }
    })

    const GAMECNT_PORT = config.port.game
    const BONUS_PORT = config.port.bonus
    const CHANCETIME_PORT = config.port.chance_time

    const usbio2 = new UsbIO2()
    usbio2.on('changed', (data, onbits, offbits) => {
        let changed = false

        if(onbits & CHANCETIME_PORT) {
            counter_data.is_chancetime = true
            changed = true
        }
        if(offbits & CHANCETIME_PORT) {
            counter_data.is_chancetime = false
            counter_data.bonus_chain = 0
            changed = true
        }
        if(onbits & GAMECNT_PORT) {
            counter_data.total++
            counter_data.current++
            changed = true
        }
        if(onbits & BONUS_PORT) {
            counter_data.bonus++
            counter_data.is_bonustime = true
            if(counter_data.is_chancetime) {
                counter_data.bonus_chain++
            }
            changed = true
        }
        if(offbits & BONUS_PORT) {
            counter_data.current = 0
            counter_data.is_bonustime = false
            changed = true
        }

        if(changed) {
            server.sendTextToClients(JSON.stringify(counter_data))
        }
    })
}
