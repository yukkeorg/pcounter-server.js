'use strict'

const WebSocketClient = require('websocket').client

let client = new WebSocketClient()

client.on('connectFailed', (error) => {
    console.log(error.toString())
})

client.on('connect', (connection) => {
    console.log('Connected.')
    connection.on('error', (error) => {
        console.log(error.toString())
    })
    connection.on('close', () => {
        console.log('Connection closed.')
    })
    connection.on('message', (message) => {
        if(message.type === 'utf8') {
            console.log('SERVER> ' + message.utf8Data)
        }
    })
})

client.connect('ws://localhost:18888')
