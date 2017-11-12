(($) => {
    "use strict"
    const p_total = $('#pcount_total')
    const p_current = $('#pcount_current')
    const p_bonus = $('#pcount_bonus')
    const p_bonus_chain = $('#pcount_bonus_chain')

    const ws = new WebSocket('ws://localhost:18888')
    ws.addEventListener('message', (message) => {
        let c_status  = JSON.parse(message.data)
        p_total.innerHTML = c_status.total
        p_current.innerHTML = c_status.current
        p_bonus.innerHTML = c_status.bonus
        p_bonus_chain.innerHTML = c_status.bonus_chain
    })

})((query, element) => {
    if(!element) element = document
    return element.querySelector(query)
})
