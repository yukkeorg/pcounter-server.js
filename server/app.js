// eslint-disable-next-line no-undef
process.env["NODE_CONFIG_DIR"] = __dirname + "/../config/";

import config from 'config'

import Server from './server'
import UsbIO2 from './usbio2'



export class App {
    constructor() {
        this.title_data = {
            type: "title",
            title: " ",
        }
        this.counter_data = {
            type: "counter",
            total: 0,
            current: 0,
            bonus: 0,
            bonus_chain: 0,
            is_bonustime: false,
            is_chancetime: false,
        }
    }

    run() {
        const server = new Server(config.server.port, config.server.client_dir)
        server.setup({
            get: {
                '/export': (req, res) => {
                    res.json(this.counter_data)
                }
            },
            post: {
                '/import': (req, res) => {
                    Object.keys(req.body).forEach((key) => {
                        if(key in this.counter_data) {
                            this.counter_data[key] = req.body[key]
                        }
                    })
                    server.sendTextToClients(JSON.stringify(this.counter_data))
                    res.sendStatus(200)
                },
                '/set_title': (req, res) => {
                    if ('title' in req.body) {
                        this.title_data.title = req.body.title
                        server.sendTextToClients(JSON.stringify(this.title_data))
                    }
                    res.sendStatus(200)
                }
            },
            on_ws_connected: (wsconn) => {
                wsconn.sendUTF(JSON.stringify(this.title_data))
                wsconn.sendUTF(JSON.stringify(this.counter_data))
            }
        })

        const GAMECNT_PORT = config.port.game
        const BONUS_PORT = config.port.bonus
        const CHANCETIME_PORT = config.port.chance_time

        const usbio2 = new UsbIO2()
        usbio2.on('changed', (data, onbits, offbits) => {
            let changed = false

            if(onbits & CHANCETIME_PORT) {
                this.counter_data.is_chancetime = true
                changed = true
            }
            if(offbits & CHANCETIME_PORT) {
                this.counter_data.is_chancetime = false
                this.counter_data.bonus_chain = 0
                changed = true
            }
            if(onbits & GAMECNT_PORT) {
                this.counter_data.total++
                this.counter_data.current++
                changed = true
            }
            if(onbits & BONUS_PORT) {
                this.counter_data.bonus++
                this.counter_data.is_bonustime = true
                if(this.counter_data.is_chancetime) {
                    this.counter_data.bonus_chain++
                }
                changed = true
            }
            if(offbits & BONUS_PORT) {
                this.counter_data.current = 0
                this.counter_data.is_bonustime = false
                changed = true
            }

            if(changed) {
                server.sendTextToClients(JSON.stringify(this.counter_data))
            }
        })
    }
}
