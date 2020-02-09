import { observable } from 'mobx'

class Drawer {
  opened = observable(false)

  onOpen() {
    this.opened = true
  }

  onClose() {
    this.opened = false
  }
}

export default new Drawer()
