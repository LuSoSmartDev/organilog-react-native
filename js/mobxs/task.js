import { observable, computed } from 'mobx'

class Task {

  listTaskById = observable({})
  listTaskByServerId = observable({})

  setList(listTaskById) {
    this.listTaskById = listTaskById
  }

  setListTaskByServerId(listTaskByServerId) {
    this.listTaskByServerId = listTaskByServerId
  }

  isNeedReloadTaskByServerId() {
    return Object.keys(this.listTaskByServerId).length > 0
  }
}

export default new Task()
