import uuid from 'uuid'
import moment from 'moment'
import { mapField, mapServerField } from './table/uniteLink'
import realm from './table'

class UniteLinksServices {
  accountId = 0

  constructor() {
    this.realm = realm
  }

  drop(id, accountId) {
    const uniteLink = this.realm
      .objects('UniteLinks')
      .filtered(`accountId = ${accountId} AND id = ${id}`)
    this.realm.write(() => {
      this.realm.delete(uniteLink)
    })
  }

  fetch(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const uniteLinks = this.realm
          .objects('UniteLinks')
          .filtered(`accountId = ${accountId} AND isActif = 1`)
        resolve(
          uniteLinks.reduce((obj, item) => ({ ...obj, [item.id]: item }), {})
        )
      }
    })
  }

  getCountUniteOfIntervention(accountId, interventionId, interventionServerId) {
    try {
      conditionQuery = `accountId = ${accountId}`
      if (interventionId && interventionServerId) {
        conditionQuery = `accountId = ${accountId} AND isActif = 1 AND (fkColumnAppliId = "${interventionId}" OR fkColumnServerId = "${interventionServerId}")`
      } else {
        if (interventionServerId) {
          conditionQuery = `accountId = ${accountId} AND isActif = 1 AND fkColumnServerId = "${interventionServerId}"`
        } else {
          conditionQuery = `accountId = ${accountId} AND isActif = 1 AND fkColumnAppliId = "${interventionId}"`;
        }
      }
      return this.realm
        .objects('UniteLinks')
        .filtered(conditionQuery).length
    } catch (e) {
      console.log('CountLinkUniteError : ' + e)
      return 0;
    }
  }

  dropOldLinkUniteOfIntervention(accountId, interventionId, interventionServerId) {
    try {
      conditionQuery = `accountId = ${accountId}`
      if (interventionId && interventionServerId) {
        conditionQuery = `accountId = ${accountId} AND (fkColumnAppliId = "${interventionId}" OR fkColumnServerId = "${interventionServerId}")`
      } else {
        if (interventionServerId) {
          conditionQuery = `accountId = ${accountId} AND fkColumnServerId = "${interventionServerId}"`
        } else {
          conditionQuery = `accountId = ${accountId} AND fkColumnAppliId = "${interventionId}"`;
        }
      }
      uniteLinks = this.realm
        .objects('UniteLinks')
        // .filtered(`accountId = ${accountId} AND fkColumnAppliId = "${interventionId}" OR fkColumnServerId = "${interventionServerId}"`)
        .filtered(conditionQuery)
      keys = Object.keys(uniteLinks);
      for (var i = 0; i < keys.length; i++) {
        const itemUniteLink = uniteLinks[keys[i]];
        // realm.delete(itemUniteLink)
        // itemUniteLink.isDelete = 1;
        itemUniteLink.isActif = 0;
        itemUniteLink.isToSync = 1;
        realm.create('UniteLinks', itemUniteLink, true)
      }
    } catch (e) {
      console.log('RemoveUniteLinkError : ' + e)
    }
  }

  insertList(unites, columnId) {
    let selectUnites = unites.filter(item => {
      return item.value
    })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'InsertUniteLink - Realm not connectted' })
      } else {
        try {
          resolve(
            selectUnites.map(value => {
              try {
                const data = {}
                // if (!data.id) {
                //   data.id = uuid.v4()
                // }
                data.id = uuid.v4()
                data.accountId = value.accountId
                data.fkUniteAppliId = value.id
                data.fkUniteServerId = value.serverId
                data.linkTableName = 'interventions'
                data.fkColumnAppliId = columnId
                data.fkColumnServerId = 0
                data.addDate = new Date()
                data.synchronizationDate = new Date()
                data.isToSync = 1
                data.isActif = 1
                data.lastViewDate = new Date()
                data.editDate = new Date()
                data.linkTableName = 'interventions'
                data.uniteValue = value.value
                return realm.create('UniteLinks', data)
              } catch (eIE) {
                //console.log('InsertUpdateUniteLinkError : ' + eIE)
              }
            })
          )
        } catch (e) {
          //console.log('InsertOrUpdateUniteLinkError : ' + e)
          reject(e.toString())
        }
      }
    })
  }

  getSyncFromLocal(accountId) {
    return this.realm
      .objects('UniteLinks')
      .filtered(`accountId = ${accountId} AND isToSync = 1`)
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

  syncFromServer(uniteLinks, accountId) {
    if (!uniteLinks || uniteLinks.length === 0) return Promise.reject({ success: false, message: 'SyncLinkUniteFromServer - No uniteLinks need sync' })
    console.log('SyncLinkUniteFromServer (' + uniteLinks.length + ')')
    const localUniteLinks = this.realm
      .objects('UniteLinks')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

    const localUnites = this.realm
      .objects('Unite')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

    const localInterventions = this.realm
      .objects('Interventions')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

    return Promise.all(
      uniteLinks.map(item => {
        const uniteLink = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})
        if (item.k) {
          uniteLink.id = item.k;
        } else {
          uniteLink.id = uuid.v4();
        }
        try {
          uniteLink.editDate = new Date(uniteLink.editDate);
          if (isNaN(uniteLink.editDate.getTime())) {
            uniteLink.editDate = new Date();
          }
        }
        catch (e) {
          uniteLink.editDate = new Date();
        }
        const currentUniteLinks = localUniteLinks[uniteLink.serverId]

        return new Promise((resolve, reject) => {
          try {
            if (!currentUniteLinks) {
              uniteLink.accountId = parseInt(accountId, 10)
              uniteLink.synchronizationDate = new Date()
              uniteLink.isToSync = 1
              uniteLink.isActif = 1
              uniteLink.lastViewDate = new Date()
              // uniteLink.editDate = new Date()
              uniteLink.linkTableName = 'interventions'
              uniteLink.fkColumnAppliId = ""
              try {
                if (uniteLink.fkColumnServerId) {
                  uniteLink.fkColumnAppliId = (localInterventions[uniteLink.fkColumnServerId] || { id: "" }).id || ""
                }
              } catch (ePI) {
                console.log('ErrorParseIntervention : ' + ePI)
              }
              uniteLink.fkUniteAppliId = ""
              try {
                if (uniteLink.fkUniteServerId) {
                  uniteLink.fkUniteAppliId = (localUnites[uniteLink.fkUniteServerId] || { id: "" }).id || ""
                }
              } catch (ePU) {
                console.log('ErrorParseUnite : ' + ePU)
              }
              //
              ((obj) => {
                try {
                  obj.addDate = new Date(obj.addDate * 1000);
                  if (isNaN(obj.addDate.getTime())) {
                    obj.addDate = new Date()
                  }
                }
                catch (e) {
                  obj.addDate = new Date()
                }
              })(uniteLink);
              this.realm.write(() => {
                this.realm.create('UniteLinks', uniteLink)
              })
            } else if (
              !!uniteLink.synchronizationDate &&
              currentuniteLinks.synchronizationDate !==
              uniteLink.synchronizationDate
            ) {
              this.realm.write(() => {

                ((obj) => {
                  try {
                    obj.addDate = new Date(obj.addDate * 1000);
                    if (isNaN(obj.addDate.getTime())) {
                      obj.addDate = new Date()
                    }
                  }
                  catch (e) {
                    obj.addDate = new Date()
                  }
                })(uniteLink);
                this.realm.create('UniteLinks', {
                  ...uniteLink,
                  ...currentUniteLinks,
                }, true)
              })
            }
            resolve(true)
          } catch (e) {
            console.log('ErrorSyncLinkUniteFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }

  removeNeedSync(uniteLinksSynced, accountId) {
    if (!accountId || accountId.length === 0) return Promise.resolve({ message: 'RemoveSyncedUniteLinks - Require account' })
    if (!uniteLinksSynced || uniteLinksSynced.length === 0) return Promise.resolve({ message: 'RemoveSyncedUniteLinks - No data' })
    return Promise.all(
      uniteLinksSynced.map(({ id, serverId, isToSync }) => {
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
            return this.realm.create('UniteLinks', data, true)
          })
        } catch (e) {
          console.log('ErrorRemoveSyncedLinkUnite : ' + e)
          return { message: e.toString() }
        }
      }))
  }
}

export default new UniteLinksServices()
