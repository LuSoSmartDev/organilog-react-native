import { observable, computed } from 'mobx'

class Filiale {

  listFilialeById = observable({})
  listFilialeByServerId = observable({})

  setList(filiales) {
    this.listFilialeById = filiales
  }

  setListReferences(listFilialeByServerId) {
    this.listFilialeByServerId = listFilialeByServerId
  }

  isNeedReloadFilialeByServerId() {
    return Object.keys(this.listFilialeByServerId).length > 0
  }
}

export default new Filiale()
