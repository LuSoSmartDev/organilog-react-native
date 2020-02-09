import uuid from 'uuid'

import moment from 'moment'
import { mapField } from './table/chemin'
import realm from './table'

class CheminServices {
  accountId = 0

  constructor() {
    this.realm = realm
  }

  drop(accountId) {
    const chemins = this.realm
      .objects('Chemins')
      .filtered(`accountId = ${accountId}`)
    this.realm.write(() => {
      this.realm.delete(chemins)
    })
  }

  fetch(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const chemins = this.realm
          .objects('Chemins')
          .filtered(`accountId = ${accountId}`)
        const all = chemins.map(item => ({ ...item }))
        resolve(all)
      }
    })
  }

  syncFromServer(chemins, accountId) {
    if (!chemins || chemins.length === 0)
      return Promise.reject({ success: false, message: 'SyncCheminsFromServer - No Chemins need sync' })

    const localChemins = this.realm
      .objects('Chemins')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

    return Promise.all(
      chemins.map(item => {
        const chemin = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})
        const currentChemins = localChemins[chemin.serverId]

        return new Promise((resolve, reject) => {
          try {
            if (!currentChemins) {
              chemin.id = uuid.v4()
              chemin.accountId = parseInt(accountId, 10)
              chemin.civilite = parseInt(chemin.civilite, 10) || 1
              chemin.synchronizationDate = new Date()
              try {
                chemin.addDate = new Date(chemin.addDate * 1000);
                if (isNaN(chemin.addDate.getTime())) {
                  chemin.addDate = new Date();
                }
              } catch (e) {
                chemin.addDate = new Date();
              }
              this.realm.write(() => {
                this.realm.create('Chemins', chemin)
              })
            } else if (
              !!chemin.synchronizationDate &&
              currentChemins.synchronizationDate !== chemin.synchronizationDate
            ) {
              // try {
              //   chemin.addDate = new Date(chemin.addDate * 1000);
              //   if (isNaN(chemin.addDate.getTime())) {
              //     chemin.addDate = new Date();
              //   }
              // } catch (e) {
              //   chemin.addDate = new Date();
              // }
              this.realm.write(() => {
                resolve(
                  this.realm.create('Chemins', {
                    ...chemin,
                    ...currentChemins,
                  }, true),
                  true
                )
                // this.realm.create('Chemins', { ...chemin, ...currentChemins })
              })
            }
            resolve(true)
          } catch (e) {
            // console.log('ErrorSyncCheminsFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }
}

export default new CheminServices()
