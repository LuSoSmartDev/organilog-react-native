import uuid from 'uuid'
import moment from 'moment'
import { mapField, mapServerField } from './table/client'
import { parseDateFromUnixTime } from './utils/transform.js'
import realm from './table'
import ClientMobx from '../mobxs/client'

class ClientServices {
  accountId = 0

  constructor() {
    this.realm = realm
  }

  drop(accountId) {
    const clients = this.realm
      .objects('Clients')
      .filtered(`accountId = ${accountId}`)
    this.realm.write(() => {
      this.realm.delete(clients)
    })
  }

  filterClient(clientName, accountId) {
    const clients = this.realm
      .objects('Clients')
      .filtered(`accountId = ${accountId} AND title CONTAINS[c] "${clientName}"`)
    return clients.reduce(
      (obj, item) => ({
        ...obj,
        [item.id]: {
          ...item,
        },
      }),
      {}
    )
  }

  fetch(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const clients = this.realm
          .objects('Clients')
          .filtered(`accountId = ${accountId}`)
        resolve(
          clients.reduce((obj, item) => ({ ...obj, [item.id]: item }), {})
        )
      }
    })
  }

  insert(client) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Date is not connect' })
      } else if (!client) {
        reject({ success: false, message: 'Date is null' })
      } else {
        try {
          this.realm.write(() => {
            const data = { ...client }
            data.id = uuid.v4()
            const newClient = realm.create('Clients', data)
            resolve(newClient)
          })
        } catch (e) {
          reject(e.toString())
        }
      }
    })
  }

  syncFromServer(clients, accountId) {
    if (!clients || clients.length === 0)
      return Promise.reject({ success: false, message: 'SyncClientFromServer - No client need sync' })
    // console.log('SyncClientFromServer (' + clients.length + ')')
    var localClients = {}
    if (ClientMobx.isNeedReloadDataReference()) {
      localClients = this.realm
        .objects('Clients')
        .filtered(`accountId = ${accountId} AND serverId != 0`)
        .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
      ClientMobx.setListReferences(localClients, false)
    } else {
      localClients = ClientMobx.listReferences
    }
    console.log('SyncClientFromServer >>> CurrentLocalClient : ' + JSON.stringify(localClients))
    return Promise.all(
      clients.map(item => {
        const client = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})
        if (item.k) {
          client.id = item.k;
        } else {
          client.id = uuid.v4();
        }
        try {
          client.addDate = parseDateFromUnixTime(client.addDate)
        } catch (e) {

        }
        const currentClients = localClients[client.serverId]

        return new Promise((resolve, reject) => {
          try {
            if (!currentClients) {
              client.accountId = parseInt(accountId, 10)
              client.civilite = parseInt(client.civilite, 10) || 1
              // client.addDate = new Date(client.addDate * 1000);
              // if (isNaN(client.addDate.getTime())) {
              //   client.addDate = null;
              // }
              this.realm.write(() => {
                this.realm.create('Clients', client, true)
              })
            } else if (
              !!client.synchronizationDate &&
              currentClients.synchronizationDate !== client.synchronizationDate
            ) {
              this.realm.write(() => {
                resolve(
                  this.realm.create('Clients', {
                    ...client,
                    ...currentClients,
                  }, true),
                  true
                )
              })
            }

            resolve(true)
          } catch (e) {
            // console.log('ErrorSyncClientFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }

  getSyncFromLocal(accountId) {
    return this.realm
      .objects('Clients')
      .filtered(`accountId = ${accountId} AND isToSync = 1`)
      .map(item => {
        keys = Object.keys(item);
        objSync = {};
        for (var i = 0; i < keys.length; i++) {
          if (item[keys[i]] || item[keys[i]] === 0) {
            if (mapServerField[keys[i]] || mapServerField[keys[i]] === 0) {
              objSync[mapServerField[keys[i]]] = item[keys[i]];
            }
          }
        }
        return objSync;
      })
  }

  removeNeedSync(clients, accountId) {
    if (!clients || clients.length === 0)
      return Promise.resolve({ message: 'RemoveSyncedClient - Nodata' })
    return Promise.all(
      clients.map(
        (client) => {
          try {
            const { id, serverId, isToSync } = client
            // if (error) {
            //   return
            //   // throw new Error(error)
            // }
            if (!serverId || !id) {
              return
              // throw new Error(`Invalid "Client" object: ${JSON.stringify(client)}`)
            }
            this.realm.write(() => {
              const data = {
                id,
                isToSync,
                serverId,
                accountId: parseInt(accountId, 10),
                synchronizationDate: new Date(),
              }

              if (code) data.code = parseInt(code, 10)
              return this.realm.create('Clients', data, true)
            })
          } catch (e) {
            // console.log('ErrorRemoveSyncedClient : ' + e)
          }
        }
      )
    )
  }

  syncFromLocal(clients, accountId) {
    if (!clients || clients.length === 0)
      return Promise.resolve({ message: 'No data' })
    return Promise.all(
      clients.map(
        (client) => {
          const { appli_id: appliId, server_id: serverId, code_id: code, ERROR: error } = client
          if (error) {
            return
            // throw new Error(error)
          }
          if (!serverId || !appliId) {
            return
            // throw new Error(`Invalid "Client" object: ${JSON.stringify(client)}`)
          }
          this.realm.write(() => {
            const data = {
              isToSync: 0,
              id: `${appliId}`,
              serverId: parseInt(serverId, 10),
              synchronizationDate: new Date(),
              accountId: parseInt(accountId, 10),
            }

            if (code) data.code = parseInt(code, 10)
            this.realm.create('Clients', data, true)
          })
        }
      )
    )
  }
}

export default new ClientServices()
