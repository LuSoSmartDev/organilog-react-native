import uuid from 'uuid'

import moment from 'moment'
import { mapField, mapServerField } from './table/address'
import { parseDateFromUnixTime } from './utils/transform.js'
import realm from './table'
import goelib from 'geolib'
import ClientMobx from '../mobxs/client'
import AddressMobx from '../mobxs/address'

class AddressServices {
  accountId = 0

  constructor() {
    this.realm = realm
  }

  fetchItemWithFKClientId(accountId, fkClientAppliId, textSearch) {
    console.log('FetchAddressWithFKClientId >>> Start')
    if (!textSearch) {
      return this.realm
        .objects('Addresses')
        .filtered(`accountId=${accountId} AND fkClientAppliId = "${fkClientAppliId}"`)
    }
    return this.realm
      .objects('Addresses')
      .filtered(
        `accountId=${accountId} AND fkClientAppliId = "${fkClientAppliId}" AND (adresse CONTAINS[c] "${textSearch}" OR codePostal CONTAINS[c] "${textSearch}" OR ville CONTAINS[c] "${textSearch}")`
      )
  }
  fetchItemWithLongLat(accountId, latlon, distance) {
    var clients = {}
    if (ClientMobx.isNeedReloadDataClients()) {
      clients = this.realm
        .objects('Clients')
        .filtered(`accountId = ${accountId}`)
        .reduce((obj, item) => ({ ...obj, [item.id]: item }), {})
    } else {
      clients = ClientMobx.list
    }
    //
    const addresses = this.realm
      .objects('Addresses')
      .filtered(`accountId=${accountId} AND longitude != '0' AND latitude != '0' AND longitude != '' AND latitude != '' `);

    if (addresses) {
      var validAddress = addresses.filter(item => {
        const distance1 = goelib.getDistance(latlon, item);
        const { latitude, longitude } = item;
        return goelib.getDistance(latlon, item) < distance
      })
      console.log('validAddress.length' + validAddress.length)
      return validAddress.map(item => {
        item.client = clients[item.fkClientAppliId]
        item.distance = goelib.getDistance(latlon, item) / 1000;
        return item;
      })

    } else {
      return null;
    }
  }

  filterAddress(addressName) {
    const addresses = this.realm
      .objects('Addresses')
      .filtered(`adresse CONTAINS[c] "${addressName}"`)
    return addresses.reduce(
      (obj, item) => ({
        ...obj,
        [item.id]: {
          ...item,
        },
      }),
      {}
    )
  }

  drop(accountId) {
    const addresses = this.realm
      .objects('Addresses')
      .filtered(`accountId = ${accountId}`)
    this.realm.write(() => {
      this.realm.delete(addresses)
    })
  }

  fetch(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const addresses = this.realm
          .objects('Addresses')
          .filtered(`accountId = ${accountId}`)
        //
        var clients = {}
        if (ClientMobx.isNeedReloadDataClients()) {
          clients = this.realm
            .objects('Clients')
            .filtered(`accountId = ${accountId}`)
            .reduce((obj, item) => ({ ...obj, [item.id]: item }), {})
        } else {
          clients = ClientMobx.list
        }
        //
        const localChemins = this.realm
          .objects('Chemins')
          .filtered(`accountId = ${accountId} AND serverId != 0`)
          .reduce((obj, item) => ({ ...obj, [item.id]: item }), {})

        resolve(
          addresses.reduce(
            (obj, item) => ({
              ...obj,
              [item.id]: {
                ...item,
                client: clients[item.fkClientAppliId],
                chemin: localChemins[item.fkCheminAppliId],
              },
            }),
            {}
          )
        )
      }
    })
  }

  async fetchByClient(accountId, client) {
    if (!accountId || accountId === 0) return null;
    // return Promise.reject({ success: false, message: 'fetchByClientAndAddress - Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        // reject({ success: false, message: 'fetchByClientAndAddress - Realm is not connect' })
        return null;
      } else {
        // conditionQuery = `accountId = ${accountId} AND isActif = 1 AND fkClientServerId = ${client.serverId} AND fkClientAppliId = ${client.id}`;
        conditionQuery = `accountId = ${accountId} AND isActif = 1 AND fkClientServerId = ${client.serverId}`;
        const addresses = this.realm
          .objects('Addresses')
          .filtered(conditionQuery)

        const localChemins = this.realm
          .objects('Chemins')
          .filtered(`accountId = ${accountId} AND serverId != 0`)
          .reduce((obj, item) => ({ ...obj, [item.id]: item }), {})
        const addressReturn = addresses.map(addItem => {
          addItem.client = client
          addItem.chemin = localChemins[addItem.fkCheminAppliId]
          return addItem
        })
        resolve(addressReturn)
      }
    })
  }

  insert(address) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Date is not connect' })
      } else if (!address) {
        reject({ success: false, message: 'Date is null' })
      } else {
        try {
          this.realm.write(() => {
            const data = { ...address }
            data.id = uuid.v4()
            const newAddress = realm.create('Addresses', data)
            resolve(newAddress)
          })
        } catch (e) {
          reject(e.toString())
        }
      }
    })
  }

  syncFromServer(addresses, accountId) {
    if (!addresses || addresses.length === 0)
      return Promise.reject({ success: false, message: 'SyncAddressFromServer - No address need sync' })
    console.log('SyncAddress (' + addresses.length + ')')
    //
    var localAddresses = {}
    if (AddressMobx.isNeedReloadDataReference()) {
      localAddresses = this.realm
        .objects('Addresses')
        .filtered(`accountId = ${accountId} AND serverId != 0`)
        .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
      AddressMobx.setListReferences(localAddresses, false)
    } else {
      localAddresses = AddressMobx.listReferences
    }
    //
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
    //
    const localChemins = this.realm
      .objects('Chemins')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

    return Promise.all(
      addresses.map(item => {
        // console.log('SyncAddress : ' + item[1])
        const address = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})
        if (item.k) {
          address.id = item.k;
        } else {
          address.id = uuid.v4();
        }
        address.fkClientAppliId = address.fkClientServerId ? ((localClients[address.fkClientServerId] || {}).id || "") : ""
        address.fkCheminAppliId = address.fkCheminServerId ? ((localChemins[address.fkCheminServerId] || {}).id || "") : ""
        const currentAddress = localAddresses[address.serverId]
        // const reMap = (address) => {
        //   try {
        //     address.addDate = new Date(address.addDate * 1000);
        //   } catch (e) {
        //     address.addDate = null;
        //   }
        //   try {
        //     address.synchronizationDate = new Date(address.synchronizationDate);
        //     if (isNaN(address.synchronizationDate.getTime())) {
        //       address.synchronizationDate = null;
        //     }
        //   }
        //   catch (e) {
        //     address.synchronizationDate = null;
        //   }
        // };
        try {

          address.addDate = parseDateFromUnixTime(address.addDate)
          try {
            address.synchronizationDate = new Date(address.synchronizationDate);
            if (isNaN(address.synchronizationDate.getTime())) {
              address.synchronizationDate = null;
            }
          }
          catch (e) {
            console.log('exception ' + e.toString())
            address.synchronizationDate = null;
          }
        } catch (e) {

        }
        return new Promise((resolve, reject) => {
          try {
            if (!currentAddress) {
              address.accountId = parseInt(accountId, 10)
              // reMap(address);
              this.realm.write(() => {
                resolve(this.realm.create('Addresses', address, true))
              })
              // console.log('InsertAddress ----- 1 : ' + address.id)
            } else
            // if (
            //   currentAddress.synchronizationDate !== address.synchronizationDate
            // )
            {
              // reMap(address);
              this.realm.write(() => {
                resolve(
                  this.realm.create(
                    'Addresses',
                    { ...currentAddress, ...address },
                    true
                  )
                )
              })
              // console.log('InsertAddress ----- 2 : ' + address.id)
            }
            resolve(true)
          } catch (e) {
            console.log('ErrorSyncAddressFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }

  getSyncFromLocal(accountId) {
    return this.realm
      .objects('Addresses')
      .filtered(`accountId = ${accountId} AND isToSync = 1`)
      .map(item => {
        return Object.keys(item).reduce((obj, key) => {
          const serverKey = mapServerField[key]
          if (serverKey) {
            if (item[key] || item[key] === 0) {
              obj[serverKey] = item[key]
            }
          } else {
            obj.aClientObject = {
              ...(obj.aClientObject || {}),
              [key]: item[key],
            }
          }
          return obj
        }, {})
      })
  }

  syncFromLocal(addresses, accountId) {
    if (!addresses || addresses.length === 0)
      return Promise.resolve({ message: 'No data' })
    return Promise.all(
      addresses.map(
        ({ appli_id: appliId, server_id: serverId, code_id: code, ERROR: error }) => {
          if (error) {
            return
            // throw new Error(error)
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
            return this.realm.create('Addresses', data, true)
          })
        }
      )
    )
  }

  removeNeedSync(addresses, accountId) {
    if (!accountId || accountId.length === 0) return Promise.resolve({ message: 'RemoveSyncedAddress - Required account' })
    if (!addresses || addresses.length === 0) return Promise.resolve({ message: 'RemoveSyncedAddress - No data address' })
    return Promise.all(
      addresses.map(
        ({ id, serverId, isToSync }) => {
          try {
            // if (error) {
            //   return
            //   // throw new Error(error)
            // }
            this.realm.write(() => {
              const data = {
                id,
                serverId,
                accountId,
                isToSync,
                synchronizationDate: new Date(),
              }

              // if (code) data.code = parseInt(code, 10)
              return this.realm.create('Addresses', data, true)
            })
          } catch (e) {
            // console.log('ErrorRemoveSyncedAddress : ' + e)
          }
        }
      )
    )
  }
}

export default new AddressServices()
