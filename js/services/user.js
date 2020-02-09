import uuid from 'uuid'
import moment from 'moment'
import { mapField } from './table/user'
import realm from './table'

class UserServices {
  constructor() {
    this.realm = realm
  }

  drop(accountId) {
    const users = this.realm
      .objects('Users')
      .filtered(`accountId = ${accountId}`)
    this.realm.write(() => {
      this.realm.delete(users)
    })
  }

  filterUser(str, accountId) {
    return this.realm
      .objects('Users')
      .filtered(`accountId = ${accountId} AND isActif = 1 AND nom CONTAINS[c] "${str}"`)
  }

  fetch(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'Required a account' })

    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const users = this.realm
          .objects('Users')
          .filtered(`accountId = ${accountId} AND isActif = 1`)
        const filiales = this.realm
          .objects('Filiales')
          .filtered(`accountId = ${accountId}`)
          .reduce((obj, item) => ({ ...obj, [item.id]: item }), {})

        const all = users.reduce((obj, item) => {
          const filiale = filiales[item.fkFilialeAppliId]
          return { ...obj, [item.serverId]: { ...item, filiale } }
        }, {})
        resolve(all)
      }
    })
  }

  syncFromServer(Users, accountId) {
    if (!Users || Users.length === 0) return Promise.reject({ success: false, message: 'SyncFromServerUser - No user need sync' })
    // console.log('SyncUser (' + Users.length + ')')
    const localUsers = this.realm
      .objects('Users')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

    return Promise.all(
      Users.map(item => {
        const user = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})
        if (item.k) {
          user.id = item.k;
        } else {
          user.id = uuid.v4();
        }
        const currentFiliale = localUsers[user.serverId]

        return new Promise((resolve, reject) => {
          try {
            user.civilite = parseInt(user.civilite, 10) || 1
            user.accountId = parseInt(accountId, 10)

            if (!currentFiliale) {
              try {
                user.addDate = new Date(user.addDate * 1000);
                if (isNaN(user.addDate.getTime())) {
                  user.addDate = new Date()
                }
              }
              catch (e) {
                user.addDate = new Date()
              }
              this.realm.write(() => {
                user.synchronizationDate = new Date()
                this.realm.create('Users', user)
              })
            } else if (
              user.synchronizationDate &&
              currentFiliale.synchronizationDate !== user.synchronizationDate
            ) {
              try {
                user.addDate = new Date(user.addDate * 1000);
                if (isNaN(user.addDate.getTime())) {
                  user.addDate = new Date()
                }
              }
              catch (e) {
                user.addDate = new Date()
              }
              this.realm.write(() => {
                user.synchronizationDate = new Date()
                this.realm.create('Users', { ...currentFiliale, ...user }, true)
              })
            }

            resolve(true)
          } catch (e) {
            // console.log('ErrorSyncUser : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }
}

export default new UserServices()
