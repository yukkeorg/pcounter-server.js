// vim: ft=javascript ts=2 sts=2 sw=2
"use strict"

import '../css/style.scss'

import AnimationCounter from './animationcounter.js'
import $ from './selector.js'

const p_counter = $('#pcounter')
const p_total = $('#pcount_total')
const p_current = $('#pcount_current')
const p_bonus = $('#pcount_bonus')
const p_bonus_chain = $('#pcount_bonus_chain')
const p_points = new AnimationCounter($('#pcount_points'), 500, 20)

const ws = new WebSocket('ws://localhost:18888')
ws.addEventListener('message', (message) => {
  let c_status = JSON.parse(message.data)

  p_total.innerHTML = c_status.total
  p_current.innerHTML = c_status.current
  p_bonus.innerHTML = c_status.bonus
  p_bonus_chain.innerHTML = c_status.bonus_chain
  //p_points.set_goal(c_status.bonus * 1000)

  if(c_status.is_bonustime) {
    p_current.classList.add('chance-time')
  } else {
    p_current.classList.remove('chance-time')
  }
  if(c_status.is_chancetime) {
    p_bonus.classList.add('chance-time')
  } else {
    p_bonus.classList.remove('chance-time')
  }
})
