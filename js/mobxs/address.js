import { observable, computed } from 'mobx'

class Address {
  limit = 10
  page = observable(1)
  list = observable({})
  waiting = observable(false)
  listAddress = []
  // references
  listReferences = observable({})
  needReloadDataReference = observable(true)

  setList(addresses) {
    this.list = addresses
    // this.setListReferences(addresses, true)
    this.prepareDataFilter(addresses)
  }

  setListReferences(addresses, isRegroup) {
    if (isRegroup) {
      addresses.reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {}).then(rs => {
        this.listReferences = rs
        this.needReloadDataReference = false
      })
    } else {
      this.listReferences = addresses
      this.needReloadDataReference = false
    }
  }

  async prepareDataFilter(addresses) {
    this.listAddress = []
    const listKey = addresses.sortKey()
    index = 0;
    return listKey.map(key => {
      this.listAddress[index] = addresses[key];
      index++;
    })
  }

  filterAddress(valSearching) {
    return this.listAddress.filter((address) => {
      if (address.adresse.toLowerCase().includes(valSearching)
        || address.ville.toLowerCase().includes(valSearching)
        || address.codePostal.toLowerCase().includes(valSearching)
      ) {
        return address
      }
    })
  }

  setPage(page) {
    this.page = page
    this.waiting = true
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

}

export default new Address()
