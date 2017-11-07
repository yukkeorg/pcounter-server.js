(($) => {
    "use strict"
    const counter = $('#counter')
    const ws = new WebSocket('ws://localhost:18888')
    ws.addEventListener('message', (message) => {
        counter.innerHTML = message.data
    })

})((query, element) => {
    if(!element) element = document
    return element.querySelector(query)
})
