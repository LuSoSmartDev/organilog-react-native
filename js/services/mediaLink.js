import uuid from 'uuid'
import moment from 'moment'
import { mapField, mapServerField } from './table/mediaLink'
import realm from './table'

class MediaLinksServices {
  accountId = 0

  constructor() {
    this.realm = realm
  }

  drop(id, accountId) {
    const media = this.realm
      .objects('MediaLinks')
      .filtered(`accountId = ${accountId} AND id = ${id}`)
    this.realm.write(() => {
      this.realm.delete(media)
    })
  }

  dropOldMediaOfIntervention(accountId, interventionId, interventionServerId, table = 'intervention') {
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
      const media = this.realm
        .objects('MediaLinks')
        // .filtered(`accountId = ${accountId} AND fkColumnAppliId = "${interventionId}" AND linkTableName = "${table}"`)
        .filtered(conditionQuery)
      keys = Object.keys(media);
      for (var i = 0; i < keys.length; i++) {
        const itemMedia = media[keys[i]];
        // realm.delete(itemMedia)
        // itemMedia.isDelete = 1;
        // itemMedia.isDelete = 1;
        itemMedia.isActif = 0;
        itemMedia.isToSync = 1;
        realm.create('MediaLinks', itemMedia, true)
      }
    } catch (e) {
      // console.log('RemoveMediaLinkError : ' + e)
    }
  }

  fetchMediaInfo(mAppid, table = 'intervention') {
    if (!mAppid || mAppid === 0)
      return Promise.reject({
        success: false,
        message: 'FetchMediaInfo - Required a media id',
      })

    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'FetchMediaInfo - Realm is not connect' })
      } else {
        const mediaLinks = this.realm
          .objects('MediaLinks')
          .filtered(`fkMediaAppliId = "${mAppid}" AND isActif = 1 AND linkTableName = "${table}" AND isDelete = 0`)
        resolve(
          mediaLinks.reduce((obj, item) => ({ ...obj, [item.id]: item }), {})
        )
      }
    })
  }

  fetchMediaWith(id, serverId, table = 'intervention') {
    // console.log('Fetch ID - ServerID : ' + id + ' --- ' + serverId)
    if (!id || id === 0)
      return Promise.reject({
        success: false,
        message: 'Required a intervention id',
      })

    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Realm is not connect' })
      } else {
        conditionFK = '';
        if (serverId) {
          conditionFK = `fkColumnServerId = "${serverId}"`;
        } else {
          conditionFK = `fkColumnAppliId = "${id}"`
        }
        const mediaLinks = this.realm
          .objects('MediaLinks')
          .filtered(`${conditionFK} AND isActif = 1 AND linkTableName = "${table}" AND isDelete = 0`)
        // .filtered(`linkTableName = "${table}" AND isDelete = 0`)
        resolve(
          mediaLinks.reduce((obj, item) => ({ ...obj, [item.id]: item }), {})
        )
      }
    })
  }

  fetch(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const mediaLinks = this.realm
          .objects('MediaLinks')
          .filtered(`accountId = ${accountId} AND isActif = 1 AND isDelete = 0`)
        resolve(
          mediaLinks.reduce((obj, item) => ({ ...obj, [item.id]: item }), {})
        )
      }
    })
  }

  fetchByAccountAndIntervention(accountId, interventionId, table = 'intervention') {
    if (!accountId || accountId === 0) return Promise.reject({ success: false, message: 'Required a account' })
    if (!interventionId) return Promise.reject({ success: false, message: 'Required a Intervention' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const mediaLinks = this.realm
          .objects('MediaLinks')
          .filtered(`accountId = ${accountId} AND isActif = 1 AND fkColumnAppliId = "${interventionId}" AND linkTableName = "${table}" AND isDelete = 0`)
        resolve(
          mediaLinks.reduce((obj, item) => ({ ...obj, [item.id]: item }), {})
        )
      }
    })
  }

  getCountMediaOfIntervention(accountId, interventionId, interventionServerId) {
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
      // mediaLinkData = this.realm
      // .objects('MediaLinks')
      // .filtered(conditionQuery)
      return this.realm
        .objects('MediaLinks')
        .filtered(conditionQuery).length
    } catch (e) {
      // console.log('CountLinkMediaError : ' + e)
      return 0;
    }
  }

  insertList(arr, columnId, interventionServerId) {
    if (!this.realm) throw new Error({ success: false, message: 'InserList_Realm not connectted' })
    if (arr && Object.keys(arr).length > 0) {
      return arr.map(value => {
        try {
          const data = {}
          data.accountId = value.accountId
          data.linkTableName = 'intervention'
          if (data.fkColumnAppliId != columnId || data.fkColumnServerId != interventionServerId) {
            data.isToSync = 1
          } else {
            data.isToSync = 2
          }
          data.fkColumnAppliId = columnId
          if (interventionServerId) {
            data.fkColumnServerId = interventionServerId
          }
          data.addDate = new Date()
          data.isDelete = 0;
          data.isActif = 1;
          if (value && value.id) {
            data.id = value.id
            data.fkMediaAppliId = value.id
            return realm.create('MediaLinks', data, true)
          } else {
            data.id = uuid.v4()
            data.fkMediaAppliId = value.id
            data.isToSync = 1;
            return realm.create('MediaLinks', data)
          }
          // return realm.create('MediaLinks', data)
        } catch (e) {
          // console.log('ErrorInsertListLinkMedia : ' + e)
        }
      })
    }
  }

  async addList(arr, columnId, serverIntId) {
    if (!this.realm) throw new Error({ success: false, message: 'AddList_Realm not connectted' })
    if (arr && Object.keys(arr).length > 0) {
      return await arr.map(value => {
        const data = {}
        data.id = uuid.v4()
        data.accountId = value.accountId
        data.fkMediaAppliId = value.id
        data.linkTableName = 'intervention'
        data.fkColumnAppliId = columnId
        if (serverIntId) {
          data.fkColumnServerId = serverIntId
        }
        data.addDate = new Date()
        data.isDelete = 0;
        return this.realm.write(() => {
          return this.realm.create('MediaLinks', data)
        })
      })
    }
  }

  insert(media) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Date is not connect' })
      } else if (!media) {
        reject({ success: false, message: 'Date is null' })
      } else {
        try {
          this.realm.write(() => {
            const data = { ...media }
            data.id = uuid.v4()
            data.addDate = new Date()
            const newMedia = realm.create('MediaLinks', data)
            resolve(newMedia)
          })
        } catch (e) {
          reject(e.toString())
        }
      }
    })
  }

  syncFromServer(mediaLinks, accountId) {
    if (!mediaLinks || mediaLinks.length === 0) return Promise.reject({ success: false, message: 'SyncMediaLinkFromServer - No data' })
    // console.log('SyncMediaLinkFromServer ('+mediaLinks.length+')')
    const localMediaLinks = this.realm
      .objects('MediaLinks')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

    return Promise.all(
      mediaLinks.map(item => {
        const mediaLinkMapped = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})
        // parse data type
        const mediaFK = this.realm
          .objects('Medias')
          .filtered(`accountId = ${accountId} AND serverId = "${mediaLinkMapped.fkMediaServerId}"`)
        if (mediaFK && Object.keys(mediaFK).length > 0) {
          mediaLinkMapped.fkMediaAppliId = mediaFK['0']['id']
        } else {
          mediaLinkMapped.fkMediaAppliId = ''
        }
        const interventionFK = this.realm
          .objects('Interventions')
          .filtered(`accountId = ${accountId} AND serverId = "${mediaLinkMapped.fkColumnServerId}"`)
        if (interventionFK && Object.keys(interventionFK).length > 0) {
          mediaLinkMapped.fkColumnAppliId = interventionFK['0']['id']
        } else {
          mediaLinkMapped.fkColumnAppliId = ''
        }
        mediaLinkMapped.addDate = new Date(mediaLinkMapped.addDate * 1000);
        const currentMediaLink = localMediaLinks[mediaLinkMapped.serverId]

        return new Promise((resolve, reject) => {
          try {
            if (!currentMediaLink) {
              mediaLinkMapped.id = mediaLinkMapped.id || uuid.v4()
              mediaLinkMapped.accountId = parseInt(accountId, 10)

              this.realm.write(() => {
                this.realm.create('MediaLinks', mediaLinkMapped)
              })
            } else if (
              !!mediaLinkMapped.synchronizationDate &&
              currentMediaLink.synchronizationDate !== mediaLinkMapped.synchronizationDate
            ) {
              this.realm.write(() => {
                resolve(
                  this.realm.create('MediaLinks', {
                    ...mediaLinkMapped,
                    ...currentMediaLink,
                  }, true),
                  true
                )
              })
            }
            resolve(true)
          } catch (e) {
            // console.log('ErrorSyncedMediaLink : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }

  getSyncFromLocal(accountId) {
    return this.realm
      .objects('MediaLinks')
      .filtered(`accountId = ${accountId} AND isToSync = 1 AND isDelete = 0`)
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

  mappingKeysSyncToServer(id, table = 'intervention') {
    mediaLinks = this.fetchMediaWith(id).then(list => {
      const listKey = list.sortKey()
      const mediaData = listKey.map(key => list[key])
      return mediaData.map(item =>
        Object.keys(item).reduce(
          (obj, key) => (
            mapServerField[key] ?
              ({ ...obj, [mapServerField[key]]: item[key] }) :
              obj
          ),
          {}
        ))
    });
    return mediaLinks;
  }

  syncFromLocal(mediaLinks, accountId) {
    if (!mediaLinks || mediaLinks.length === 0)
      return Promise.resolve({ message: 'No data' })
    return Promise.all(
      mediaLinks.map(
        ({ appli_id: appliId, server_id: serverId, code_id: code }) =>
          new Promise((resolve, reject) => {
            try {
              this.realm.write(() => {
                const data = {
                  isToSync: 0,
                  id: `${appliId}`,
                  serverId: parseInt(serverId, 10),
                  synchronizationDate: new Date(),
                  accountId: parseInt(accountId, 10),
                }

                if (code) data.code = parseInt(code, 10)
                resolve(this.realm.create('MediaLinks', data, true))
              })
            } catch (e) {
              reject({ message: e.toString() })
            }
          })
      )
    )
  }

  removeNeedSync(mediaLinks, accountId) {
    if (!accountId || accountId.length === 0) return Promise.resolve({ message: 'RemoveSyncedMediaLink - Require account' })
    if (!mediaLinks || mediaLinks.length === 0) return Promise.resolve({ message: 'RemoveSyncedMediaLink - No data' })
    // console.log('RemoveSyncedMediaLink >>> ' + JSON.stringify(mediaLinks))
    return Promise.all(
      mediaLinks.map(({ id, serverId, isToSync }) => {
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
            return this.realm.create('MediaLinks', data, true)
          })
        } catch (e) {
          // console.log('ErrorRemoveSyncedMediaLink : ' + e)
          return { message: e.toString() }
        }
      }))
  }

}

export default new MediaLinksServices()
