import uuid from 'uuid'
import moment from 'moment'
import realm from './table'
import { mapField, mapServerField, mapFieldTransform } from './table/unite'

import { mapObjectFactory } from './utils'

class UniteServices {
  list

  constructor() {
    this.realm = realm
  }

  drop(accountId) {
    const Messages = this.realm
      .objects('Unite')
      .filtered(
      `fkUserServerIdFrom = ${accountId} OR fkUserServerIdTo = ${accountId}`
      )
    this.realm.write(() => {
      this.realm.delete(Messages)
    })
  }

  fetch(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'FetchUnite - Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'FetchUnite - Ream is not connect' })
      } else {
        const Unites = this.realm
          .objects('Unite')
          .filtered(`accountId = ${accountId}`)
        resolve(Unites.reduce((obj, item) => ({ ...obj, [item.id]: item }), {}))
      }
    })
  }

  syncFromServer(unites, accountId) {
    if (!unites || unites.length === 0)
      return Promise.reject({ success: false, message: 'SyncUniteFromServer - No unites need sync' })
    // console.log('SyncUniteFromServer (' +unites.length+ ')')
    const localUnites = this.realm
      .objects('Unite')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
    const mapObject = mapObjectFactory({ mapField, mapFieldTransform })
    return Promise.all(
      unites.map(item => {
        const unite = mapObject(item)
        const currentUnites = localUnites[unite.serverId]
        return new Promise((resolve, reject) => {
          try {
            if (!currentUnites) {
              unite.id = uuid.v4()
              unite.synchronizationDate = new Date()
              unite.accountId = parseInt(accountId, 10)
              unite.isActif = parseInt(unite.isActif, 10)
              this.realm.write(() => {
                this.realm.create('Unite', unite)
              })
            } else if (
              !!unite.synchronizationDate &&
              currentUnites.synchronizationDate !== unite.synchronizationDate
            ) {
              this.realm.write(() => {
                resolve(
                  this.realm.create('Unite', { ...unite, ...currentUnites }, true),
                  true
                )
              })
            }
            resolve(true)
          } catch (e) {
            // console.log('ErrorSyncUniteFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }
}

export default new UniteServices()
