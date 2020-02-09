import uuid from 'uuid'
import moment from 'moment'
import { mapField, mapServerField } from './table/LinkInterventionProduct'
import { parseDateFromUnixTime } from './utils/transform.js'
import realm from './table'

class LinkInterventionProductServices {
  accountId = 0

  constructor() {
    this.realm = realm
  }

  drop(accountId) {
    const linkInterventionProduct = this.realm
      .objects('LinkInterventionProduct')
      .filtered(`accountId = ${accountId}`)
    this.realm.write(() => {
      this.realm.delete(linkInterventionProduct)
    })
  }

  fetch(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const linkInterventionProducts = this.realm
          .objects('LinkInterventionProduct')
          .filtered(`accountId = ${accountId} AND isActif = 1`)
        const all = linkInterventionProducts.map(item => ({ ...item }))
        resolve(all)
      }
    })
  }

  dropOldLinkProductOfIntervention(accountId, interventionId, interventionServerId) {
    try {
      conditionQuery = `accountId = ${accountId}`
      if (interventionId && interventionServerId) {
        conditionQuery = `accountId = ${accountId} AND (fkInterventionAppliId = "${interventionId}" OR fkInterventionServerId = "${interventionServerId}")`
      } else {
        if (interventionServerId) {
          conditionQuery = `accountId = ${accountId} AND fkInterventionServerId = "${interventionServerId}"`
        } else {
          conditionQuery = `accountId = ${accountId} AND fkInterventionAppliId = "${interventionId}"`;
        }
      }
      linkProducts = this.realm
        .objects('LinkInterventionProduct')
        .filtered(conditionQuery)
      keys = Object.keys(linkProducts);
      for (var i = 0; i < keys.length; i++) {
        try {
          const itemLinkProduct = linkProducts[keys[i]];
          itemLinkProduct.isActif = 0;
          itemLinkProduct.isToSync = 1;
          realm.create('LinkInterventionProduct', itemLinkProduct, true)
        } catch (eD) {
          // console.log('ErrorDeleteItemLinkProduct : ' + eD)
        }
      }
    } catch (e) {
      // console.log('RemoveLinkProductError : ' + e)
    }
  }

  getCountProductOfIntervention(accountId, interventionId, interventionServerId) {
    try {
      conditionQuery = `accountId = ${accountId}`
      if (interventionId && interventionServerId) {
        conditionQuery = `accountId = ${accountId} AND isActif = 1 AND (fkInterventionAppliId = "${interventionId}" OR fkInterventionServerId = "${interventionServerId}")`
      } else {
        if (interventionServerId) {
          conditionQuery = `accountId = ${accountId} AND isActif = 1 AND fkInterventionServerId = "${interventionServerId}"`
        } else {
          conditionQuery = `accountId = ${accountId} AND isActif = 1 AND fkInterventionAppliId = "${interventionId}"`;
        }
      }
      return this.realm
        .objects('LinkInterventionProduct')
        .filtered(conditionQuery).length
    } catch (e) {
      // console.log('CountLinkProductError : ' + e)
      return 0;
    }
  }

  insertList(listProducts, interventionId) {
    // let selectUnites = unites.filter(item => {
    //   return item.value
    // })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'InsertLinkProduct - Realm not connectted' })
      } else {
        try {
          resolve(
            listProducts.map(item => {
              try {
                const data = {}
                data.id = uuid.v4()
                // data.accountId = value.accountId
                data.fkProductId = item.id
                data.fkProductServerId = parseInt(item.serverId)
                data.productName = item.nom
                data.fkInterventionAppliId = interventionId
                data.fkInterventionServerId = 0
                data.quantity = item.quantitySelected
                data.position = 0
                data.addDate = new Date()
                data.synchronizationDate = new Date().toDateString()
                data.isToSync = 1
                data.isActif = 1
                return realm.create('LinkInterventionProduct', data)
              } catch (eIE) {
                console.log('InsertUpdateLinkProductError : ' + eIE)
              }
            })
          )
        } catch (e) {
          console.log('InsertOrUpdateLinkProductError : ' + e)
          reject(e.toString())
        }
      }
    })
  }

  getSyncFromLocal(accountId) {
    return this.realm
      .objects('LinkInterventionProduct')
      // .filtered(`accountId = ${accountId} AND isToSync = 1`)
      .filtered(`isToSync = 1`)
      .map(item =>
        Object.keys(item).reduce(
          (obj, key) => (
            mapServerField[key] ?
              ({ ...obj, [mapServerField[key]]: item[key] }) :
              obj
          ),
          {}
        )
      )
  }

  syncFromServer(linkInterventionProducts, accountId) {
    if (!linkInterventionProducts || linkInterventionProducts.length === 0)
      return Promise.reject({ success: false, message: 'SyncLinkProductFromServer - No linkInterventionProducts need sync' })
    console.log('SyncLinkProductsFromServer (' + linkInterventionProducts.length + ')')
    const localLinkInterventionProducts = this.realm
      .objects('LinkInterventionProduct')
      // .filtered(`accountId = ${accountId} AND serverId != 0`)
      .filtered(`serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
    console.log('LocalLinkProduct : ' + JSON.stringify(localLinkInterventionProducts))

    const localProducts = this.realm
      .objects('Products')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

    const localInterventions = this.realm
      .objects('Interventions')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

    return Promise.all(
      linkInterventionProducts.map(item => {
        console.log('LinkInterventionProduct : ' + JSON.stringify(item))
        const linkInterventionProduct = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})
        if (item.k) {
          linkInterventionProduct.id = item.k
        } else {
          linkInterventionProduct.id = uuid.v4()
        }
        console.log('LinkProductMapped : ' + JSON.stringify(linkInterventionProduct))
        try {
          linkInterventionProduct.addDate = parseDateFromUnixTime(linkInterventionProduct.addDate)
          try {
            linkInterventionProduct.editDate = new Date(linkInterventionProduct.editDate * 1000);
            if (isNaN(linkInterventionProduct.editDate.getTime())) {
              linkInterventionProduct.editDate = new Date()
            }
          } catch (e) {
            linkInterventionProduct.editDate = new Date()
          }
        } catch (e) {

        }
        const currentlinkInterventionProduct = localLinkInterventionProducts[linkInterventionProduct.serverId]

        return new Promise((resolve, reject) => {
          try {
            if (!currentlinkInterventionProduct) {
              linkInterventionProduct.accountId = parseInt(accountId, 10)
              linkInterventionProduct.isToSync = 2
              linkInterventionProduct.lastViewDate = new Date()
              linkInterventionProduct.fkProductId = linkInterventionProduct.fkProductServerId ? ((localProducts[linkInterventionProduct.fkProductServerId] || { id: 0 }).id || "") : ""
              linkInterventionProduct.fkInterventionAppliId = linkInterventionProduct.fkInterventionServerId ? ((localInterventions[linkInterventionProduct.fkInterventionServerId] || { id: 0 }).id || "") : ""
              //
              console.log('NonExistLinkProduct >>> Data : ' + JSON.stringify(linkInterventionProduct))
              this.realm.write(() => {
                this.realm.create('LinkInterventionProduct', linkInterventionProduct)
              })
            } else if (
              !!linkInterventionProduct.synchronizationDate &&
              currentlinkInterventionProduct.synchronizationDate !==
              linkInterventionProduct.synchronizationDate
            ) {
              console.log('ExistLinkProduct >>> OldData : ' + JSON.stringify(currentlinkInterventionProduct))
              console.log('ExistLinkProduct >>> NewData : ' + JSON.stringify(linkInterventionProduct))
              const existedLinkProduct = {}
              existedLinkProduct.id                     = currentlinkInterventionProduct.id
              existedLinkProduct.serverId               = linkInterventionProduct.serverId
              existedLinkProduct.fkProductId            = currentlinkInterventionProduct.fkProductId
              existedLinkProduct.fkProductServerId      = linkInterventionProduct.fkProductServerId
              existedLinkProduct.fkInterventionAppliId  = currentlinkInterventionProduct.fkInterventionAppliId
              existedLinkProduct.fkInterventionServerId = linkInterventionProduct.fkInterventionServerId
              existedLinkProduct.accountId              = parseInt(accountId, 10)
              existedLinkProduct.quantity               = linkInterventionProduct.quantity
              existedLinkProduct.position               = linkInterventionProduct.position
              existedLinkProduct.productName            = linkInterventionProduct.productName
              existedLinkProduct.isActif                = currentlinkInterventionProduct.isActif
              existedLinkProduct.addDate                = linkInterventionProduct.addDate
              existedLinkProduct.editDate               = linkInterventionProduct.editDate
              existedLinkProduct.synchronizationDate    = linkInterventionProduct.synchronizationDate
              existedLinkProduct.isToSync               = currentlinkInterventionProduct.isToSync
              
              console.log('ExistLinkProduct >>> DataUpdating : ' + JSON.stringify(existedLinkProduct))
              this.realm.write(() => {
                this.realm.create('LinkInterventionProduct', existedLinkProduct, true)
              })
            }
            resolve(true)
          } catch (e) {
            console.log('ErrorSyncLinkProductFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }

  removeNeedSync(linkInterventionProducts, accountId) {
    if (!accountId || accountId.length === 0) return Promise.resolve({ message: 'RemoveSyncedLinkProduct - Require account' })
    if (!linkInterventionProducts || linkInterventionProducts.length === 0) return Promise.resolve({ message: 'RemoveSyncedLinkProduct - No data' })
    // console.log('RemoveSyncedListProducts')
    return Promise.all(
      linkInterventionProducts.map(({ id, serverId, isToSync }) => {
        try {
          this.realm.write(() => {
            const data = {
              id,
              serverId: parseInt(serverId, 10),
              accountId: parseInt(accountId, 10),
              isToSync,
              synchronizationDate: new Date(),
            }
            // if (code) data.code = parseInt(code, 10)
            return this.realm.create('LinkInterventionProduct', data, true)
          })
        } catch (e) {
          // console.log('ErrorRemoveSyncedLinkProduct : ' + e)
          return { message: e.toString() }
        }
      }))
  }
}

export default new LinkInterventionProductServices()
