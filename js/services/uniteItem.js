import uuid from 'uuid'
import moment from 'moment'
import realm from './table'
import { mapField, mapFieldTransform } from './table/uniteItemValue'

import { mapObjectFactory } from './utils'

class UniteItemServices {
  list

  constructor() {
    this.realm = realm
  }

  drop(accountId) {
    const uniteItem = this.realm
      .objects('UniteItem')
      .filtered(
        `accountId = ${accountId}`
      )
    this.realm.write(() => {
      this.realm.delete(uniteItem)
    })
  }

  fetchAllUniteItemByAccountIdGroupForUniteServerId(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'FetchUniteItem - Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'FetchUniteItem - Ream is not connect' })
      } else {
        const uniteItem = this.realm
          .objects('UniteItem')
          .filtered(`accountId = ${accountId}`)
        resolve(uniteItem.reduce((obj, item) => ({ ...obj, [item.uniteServerId]: item }), {}))
      }
    })
  }

  fetchAllUniteItemByAccountIdGroupForServerId(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'FetchUniteItem - Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'FetchUniteItem - Ream is not connect' })
      } else {
        const uniteItem = this.realm
          .objects('UniteItem')
          .filtered(`accountId = ${accountId}`)
        resolve(uniteItem.reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {}))
      }
    })
  }

  fetch(accountId, uniteServerId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'FetchUniteItem - Required a account' })
    if (!uniteServerId || uniteServerId === 0)
      return Promise.reject({ success: false, message: 'FetchUniteItem - Required a unite-id' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'FetchUniteItem - Ream is not connect' })
      } else {
        const uniteItem = this.realm
          .objects('UniteItem')
          .filtered(`accountId = ${accountId} AND uniteServerId = ${uniteServerId}`)
        resolve(uniteItem.reduce((obj, item) => ({ ...obj, [item.id]: item }), {}))
      }
    })
  }

  syncFromServer(unites, accountId) {
    if (!unites || unites.length === 0)
      return Promise.reject({ success: false, message: 'SyncUniteItemFromServer - No unites need sync' })
    // console.log('SyncUniteItemFromServer (' +unites.length+ ')')
    const localUnites = this.realm
      .objects('UniteItem')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
    const mapObject = mapObjectFactory({ mapField, mapFieldTransform })
    return Promise.all(
      unites.map(item => {
        const unite = mapObject(item)
        try {
          unite.editDate = new Date(unite.editDate);
          if (isNaN(unite.editDate.getTime())) {
            unite.editDate = new Date();
          }
        }
        catch (e) {
          unite.editDate = new Date();
        }
        const currentUnites = localUnites[unite.serverId]
        return new Promise((resolve, reject) => {
          try {
            if (!currentUnites) {
              unite.id = uuid.v4()
              unite.accountId = parseInt(accountId, 10)
              // unite.isActif = parseInt(unite.isActif, 10)
              this.realm.write(() => {
                this.realm.create('UniteItem', unite)
              })
            } else if (
              !!unite.synchronizationDate &&
              currentUnites.synchronizationDate !== unite.synchronizationDate
            ) {
              this.realm.write(() => {
                resolve(
                  this.realm.create('UniteItem', { ...unite, ...currentUnites }, true),
                  true
                )
              })
            }
            resolve(true)
          } catch (e) {
            // console.log('ErrorSyncUniteItemFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }
}

export default new UniteItemServices()
