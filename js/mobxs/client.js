import { observable, computed } from 'mobx'

class Client {
  limit = 10
  page = observable(1)
  list = observable({})
  waiting = observable(false)
  listClient = []
  // references
  listReferences = observable({})
  needReloadDataReference = observable(true)

  setList(clients) {
    this.list = clients
    // this.setListReferences(clients, true)
    this.prepareDataFilter(clients);
  }

  setListReferences(clients, isRegroup) {
    if (isRegroup) {
      clients.reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {}).then(rs => {
        this.listReferences = rs
        this.needReloadDataReference = false
      })
    } else {
      this.listReferences = clients
      this.needReloadDataReference = false
    }
  }

  async prepareDataFilter(clients) {
    this.listClient = [];
    const listKey = clients.sortKey();
    index = 0;
    return listKey.map(key => {
      this.listClient[index] = clients[key];
      index ++;
    })
  }

  setPage(page) {
    this.page = page
    this.waiting = true
  }

  startLoadMore() {
    this.waiting = true
  }

  stopWaiting() {
    this.waiting = false
  }

  isNeedReloadDataClients() {
    return Object.keys(this.list).length == 0
  }

  isNeedReloadDataReference() {
    return this.needReloadDataReference || Object.keys(this.listReferences).length == 0
  }

  computed
  get loadMore() {
    return this.length > this.page * this.limit
  }

  computed
  get length() {
    return Object.keys(this.list).length
  }

  computed
  get dataArray() {
    const list = this.list
    const page = this.page || 1
    const listKey = list.sortKey()
    return listKey.slice(0, page * this.limit).map(key => list[key])
  }

  filterClient(valSearching) {
    return this.listClient.filter((client) => client.title.toLowerCase().includes(valSearching))
  }
}

export default new Client()
