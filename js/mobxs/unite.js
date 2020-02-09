import { observable, computed } from 'mobx'

class Unite {
  limit = 10
  page = observable(1)
  list = observable({})
  waiting = observable(false)
  // references
  listReferences = observable({})
  needReloadDataReference = observable(true)

  setList(unites) {
    const _listByView = {}
    this.list = unites.reduce((a, u) => {
      a[u.id] = u
      const view = u.typeStr && u.typeStr.split(',') || []
      view.forEach((v) => {
        const byViewItem = _listByView[v] || (_listByView[v] = {}) // init a default value
        byViewItem[u.id] = u // referrence to the key
      }, this);
      return a
    }, {})
    this.listByView = _listByView
    // this.setListReferences(this.list, true)
  }

  setListReferences(listUnites, isRegroup) {
    if (isRegroup) {
      listUnites.reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {}).then(rs => {
        this.listReferences = rs
        this.needReloadDataReference = false
      })
    } else {
      this.listReferences = listUnites
      this.needReloadDataReference = false
    }
  }
}

export default new Unite()
