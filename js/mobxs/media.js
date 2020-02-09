import { observable, computed } from 'mobx'

class Media {
  limit = 10
  @observable page = 1
  @observable list = {}
  @observable waiting = false

  setList(clients) {
    this.list = clients
  }

  setPage(page) {
    this.page = page
    this.waiting = true
    setTimeout(() => {
      this.waiting = false
    }, 500)
  }

  @computed
  get loadMore() {
    return this.length > this.page * this.limit
  }

  @computed
  get length() {
    return Object.keys(this.list).length
  }

  @computed
  get dataArray() {
    const list = this.list
    const page = this.page || 1
    const listKey = list.sortKey()
    return listKey.slice(0, page * this.limit).map(key => list[key])
  }
}

export default new Media()
