import { observable, computed } from 'mobx'

class CategoryTracking {
  limit = 20
  page = observable(1)
  list = observable({}) // all data
  listCategories = [] // for filter 
  waiting = observable(false)
  // references
  listCategoryReferencesGroupForServerId = observable({})
  needReloadCategoryReferenceGroupForServerId = observable(true)

  setList(categoryTrackings) {
    this.list = categoryTrackings
  }

  async prepareDataFilter(categories) {
    this.listCategories = [];
    const listKey = categories.sortKey();
    index = 0;
    return listKey.map(key => {
      this.listCategories[index] = categories[key];
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

  setListReferencesGroupForServerId(listCategoryTrackings) {
    this.listCategoryReferencesGroupForServerId = listCategoryTrackings
    this.needReloadCategoryReferenceGroupForServerId = false
  }

  isNeedReloadReferenceGroupForServerId() {
    return this.needReloadCategoryReferenceGroupForServerId || Object.keys(this.listCategoryReferencesGroupForServerId).length == 0
  }

}

export default new CategoryTracking()
