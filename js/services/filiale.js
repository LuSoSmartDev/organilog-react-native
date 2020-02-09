import uuid from 'uuid'

import moment from 'moment'
import { mapField } from './table/filiale'
import realm from './table'
import FilialeMobx from '../mobxs/filiale'

class FilialeServices {
  accountId = 0

  constructor() {
    this.realm = realm
  }

  drop(accountId) {
    const Filiales = this.realm
      .objects('Filiales')
      .filtered(`accountId = ${accountId}`)
    this.realm.write(() => {
      this.realm.delete(Filiales)
    })
  }

  fetch(accountId) {
    console.log('FetchDataFiliale >>> Start')
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'FetchFiliale - Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'FetchFiliale - Ream is not connect' })
      } else {
        const Filiales = this.realm
          .objects('Filiales')
          .filtered(`accountId = ${accountId}`)
        const all = Filiales.map(item => ({ ...item }))
        resolve(all)
      }
    })
  }

  syncFromServer(Filiales, accountId) {
    if (!Filiales || Filiales.length === 0)
      return Promise.reject({ success: false, message: 'SyncFilialeFromServer - No Filiales need sync' })
    // console.log('SyncFilialeFromServer ('+Filiales.length+')')
    var localFiliales = {}
    if (FilialeMobx.isNeedReloadFilialeByServerId()) {
      localFiliales = this.realm
        .objects('Filiales')
        .filtered(`accountId = ${accountId} AND serverId != 0`)
        .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
      FilialeMobx.setListReferences(localFiliales)
    } else {
      localFiliales = FilialeMobx.listFilialeByServerId
    }

    return Promise.all(
      Filiales.map(item => {
        const Filiale = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})
        const currentFiliales = localFiliales[Filiale.serverId]

        return new Promise((resolve, reject) => {
          try {
            if (!currentFiliales) {
              Filiale.id = uuid.v4()
              Filiale.accountId = parseInt(accountId, 10)
              Filiale.synchronizationDate = new Date()
              try {
                Filiale.addDate = new Date(Filiale.addDate * 1000);
                if (isNaN(Filiale.addDate.getTime())) {
                  Filiale.addDate = new Date();
                }
              }
              catch (e) {
                Filiale.addDate = new Date();
              }
              this.realm.write(() => {
                this.realm.create('Filiales', Filiale)
              })
            } else if (
              !!Filiale.synchronizationDate &&
              currentFiliales.synchronizationDate !==
              Filiale.synchronizationDate
            ) {
              this.realm.write(() => {
                try {
                  Filiale.addDate = new Date(Filiale.addDate * 1000);
                  if (isNaN(Filiale.addDate.getTime())) {
                    Filiale.addDate = new Date();
                  }
                }
                catch (e) {
                  Filiale.addDate = new Date();
                }
                this.realm.create(
                  'Filiales',
                  { ...Filiale, ...currentFiliales },
                  true
                )
              })
            }

            resolve(true)
          } catch (e) {
            // console.log('ErrorSyncFiliale : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }
}

export default new FilialeServices()
