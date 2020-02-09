import { observable, computed } from 'mobx'

class UniteItem {
  list = observable({}) // all data
  // references
  listReferencesGroupForServerId = observable({})
  needReloadReferenceGroupForServerId = observable(true)
  listReferencesGroupForUniteServerId = observable({})
  needReloadReferenceGroupForUniteServer = observable(true)

  setList(uniteItems) {
    this.list = uniteItems
  }

  setListReferencesGroupForServerId(listUniteItems) {
    this.listReferencesGroupForServerId = listUniteItems
    this.needReloadReferenceGroupForServerId = false
  }

  setListReferencesGroupForUniteServerId(listUniteItems) {
    this.listReferencesGroupForUniteServerId = listUniteItems
    this.needReloadReferenceGroupForUniteServer = false
  }

  isNeedReloadReferenceGroupForServerId() {
    return this.needReloadReferenceGroupForServerId || Object.keys(this.listReferencesGroupForServerId).length == 0
  }

  isNeedReloadReferenceGroupForUniteServerId() {
    return this.needReloadReferenceGroupForUniteServer || Object.keys(this.listReferencesGroupForUniteServerId).length == 0
  }
}

export default new UniteItem()
