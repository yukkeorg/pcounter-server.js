export class AnimationCounter {
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