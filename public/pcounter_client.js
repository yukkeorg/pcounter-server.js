(($) => {
  // vim: ft=javascript ts=2 sts=2 sw=2
  "use strict"

  class AnimationCounter {
    constructor(elem, duration=500, resolution=10) {
      this.elem = elem

      this.duration = duration
      this.resolution = resolution
      this.mspf = this.duration / this.resolution
      this.progress = 0
      this.current_value = 0
      this.goal_value = 0
      this.delta = 0
    }

    set_goal(value) {
      this.goal_value = value
      this.progress = 0

      if(this.goal_value - this.current_value == 0) {
        return
      }

      this.delta = (this.goal_value - this.current_value) / this.resolution
      setTimeout(this._action.bind(this), this.mspf)
    }

    _action() {
      this.progress += this.mspf
      if(this.progress >= this.duration) {
        this.current_value = this.goal_value
      } else {
        this.current_value += this.delta
        setTimeout(this._action.bind(this), this.mspf)
      }
      this.elem.innerHTML = Math.floor(this.current_value)
    }
  }

  const p_total = $('#pcount_total')
  const p_current = $('#pcount_current')
  const p_bonus = $('#pcount_bonus')
  const p_bonus_chain = $('#pcount_bonus_chain')
  const p_points = new AnimationCounter($('#pcount_points'), 1000)

  const ws = new WebSocket('ws://localhost:18888')
  ws.addEventListener('message', (message) => {
    let c_status = JSON.parse(message.data)
    p_total.innerHTML = c_status.total
    p_current.innerHTML = c_status.current
    p_bonus.innerHTML = c_status.bonus
    p_bonus_chain.innerHTML = c_status.bonus_chain
    p_points.set_goal(c_status.bonus * 1000)
  })

})((query, element) => {
  if(!element) element = document
  return element.querySelector(query)
})
