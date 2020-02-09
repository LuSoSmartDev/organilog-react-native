import Auth from './auth'
import { fetchApi, callApi } from './api'

import uuid from 'uuid'
import moment from 'moment'
import {
  mapField,
  mapServerField,
} from './table/media'
import realm from './table'
import UserMobx from '../mobxs/user'

class MediasServices {
  accountId = 0

  constructor() {
    this.realm = realm
  }

  drop(id, accountId) {
    const media = this.realm
      .objects('Medias')
      .filtered(`accountId = ${accountId} AND id = ${id}`)
    this.realm.write(() => {
      this.realm.delete(media)
    })
  }

  fetchMediaWith(Ids) {
    if (!Ids || Ids.length === 0)
      return Promise.reject({
        success: false,
        message: 'Required a list of intervention',
      })

    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const ids = Ids.map(id => `id = "${id}"`).join(' OR ')
        const medias = this.realm
          .objects('Medias')
          .filtered(`(${ids}) AND isActif = 1`)
        resolve(medias.reduce((obj, item) => ({ ...obj, [item.id]: item }), {}))
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
        const medias = this.realm
          .objects('Medias')
          .filtered(`accountId = ${accountId}`)
        resolve(medias.reduce((obj, item) => ({ ...obj, [item.id]: item }), {}))
      }
    })
  }

  fetchByAccountAndId(accountId, mediaId) {
    if (!accountId || accountId === 0) return Promise.reject({ success: false, message: 'Required a account' })
    if (!mediaId) return Promise.reject({ success: false, message: 'Required media id' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const medias = this.realm
          .objects('Medias')
          .filtered(`accountId = ${accountId} AND id = "${mediaId}"`)
        resolve(medias.reduce((obj, item) => ({ ...obj, [item.id]: item }), {}))
      }
    })
  }

  insert(media) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'InsertMedia - Realm not connectted' })
      } else if (!media) {
        reject({ success: false, message: 'InsertMedia - Media is null' })
      } else {
        // console.log('InsertingMedia')
        try {
          this.realm.write(() => {
            const data = { ...media }
            data.id = uuid.v4()
            data.addDate = new Date()
            data.isToSync = 1
            const newMedia = realm.create('Medias', data)
            resolve(newMedia)
          })
        } catch (e) {
          // console.log('ErrorInsertMedia : ' + e)
          reject(e.toString())
        }
      }
    })
  }

  add(media) {
    if (!this.realm) return new Error({ success: false, message: 'AddMedia_Realm not connectted' })
    if (!media) return new Error({ success: false, message: 'AddMedia_Media is null' })
    try {
      this.realm.write(() => {
        const data = { ...media }
        data.id = uuid.v4()
        data.addDate = new Date()
        data.isToSync = 1
        const newMedia = realm.create('Medias', data)
        return newMedia
      })
    } catch (e) {
      e.toString()
      return;
    }
  }

  onEdit(media) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Date is not connect' })
      } else if (!media) {
        reject({ success: false, message: 'Date is null' })
      } else {
        try {
          this.realm.write(() => {
            const data = { ...media, isToSync: 1 }
            data.editDate = new Date()
            resolve(realm.create('Medias', data, true))
          })
        } catch (e) {
          reject(e.toString())
        }
      }
    })
  }

  onRead(id) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Date is not connect' })
      } else if (!id) {
        reject({ success: false, message: 'Date is null' })
      } else {
        try {
          this.realm.write(() => {
            const data = { id, isToSync: 1 }
            data.lastViewDate = new Date()
            resolve(realm.create('Medias', data, true))
          })
        } catch (e) {
          reject(e.toString())
        }
      }
    })
  }

  syncFromServer(medias, accountId, accountDomain = 'media', accountMediaId = '') {
    if (!medias || medias.length === 0) return Promise.reject({ success: false, message: 'SyncMediaFromServer - No data' })
    // console.log('SyncMediaFromServer (' + medias.length + ')')
    const localMedias = this.realm
      .objects('Medias')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
    return Promise.all(
      medias.map(item => {
        const media = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})
        // console.log('MediaName : ' + media.fileName)
        // parse data tytpe
        media.filePath = `http://${accountDomain}.organilog.com/media/${accountMediaId}/${media.accountId}/${media.year}/${media.month}/${media.fileName}`;
        // http://ACCOUNT.organilog.com/media/ACCOUNT_ID/USER_ID/YEAR/MONTH/FILENAME
        if (media.fileSize) {
          media.fileSize = parseInt(media.fileSize, 10)
        }
        if (media.imageWidth) {
          media.imageWidth = parseInt(media.imageWidth, 10)
        }
        if (media.imageHeight) {
          media.imageHeight = parseInt(media.imageHeight, 10)
        }
        media.addDate = new Date(media.addDate * 1000);
        if (media.editDate) {
          media.editDate = moment(media.editDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
        } else {
          media.editDate = moment().format('YYYY-MM-DD');
        }
        media.editDate = new Date(media.editDate);
        const currentMedias = localMedias[media.serverId]

        return new Promise((resolve, reject) => {
          try {
            if (!currentMedias) {
              media.id = media.id || uuid.v4()
              media.accountId = parseInt(accountId, 10)

              this.realm.write(() => {
                this.realm.create('Medias', media)
              })
            } else if (
              !!media.synchronizationDate &&
              currentMedias.synchronizationDate !== media.synchronizationDate
            ) {
              this.realm.write(() => {
                resolve(
                  this.realm.create('Medias', {
                    ...media,
                    ...currentMedias,
                  }, true),
                  true
                )
              })
            }

            resolve(true)
          } catch (e) {
            console.log('ErrorSyncMediaFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }

  getSyncFromLocal(accountId) {
    return this.realm
      .objects('Medias')
      .filtered(`accountId = ${accountId} AND isToSync = 1`)
      .map(item =>
        Object.keys(item).reduce(
          (obj, key) => (
            mapServerField[key] ?
              ({
                ...obj, [mapServerField[key]]:
                  key == 'addDate' || key == 'editDate'
                    ? ((item[key] && !isNaN(item[key])) ? moment(item[key], 'YYYY-MM-DD HH:mm:ss').format('X') : '')
                    : item[key]
              }) :
              obj
          ),
          {}
        )
      )
  }

  syncFromLocal(medias, accountId) {
    if (!medias || Object.keys(medias).length == 0 || medias.length === 0)
      return Promise.resolve({ message: 'No data' })
    // console.log('SyncMediaFromLocal (' + medias.length + ')')
    return Promise.all(
      medias.map(
        ({ media_appli_id: appliId, media_id: serverId, media_code_id: code, media_link_id: linkId, ERROR: error } = {}) => {
          if (error) {
            if (error.match(/POST is empty/i)) {
              return this.realm.write(() => {
                const media = this.realm
                  .objects('Medias')
                  .filtered(`id = '${appliId}'`)
                this.realm.delete(media)
              })
            }
            throw new Error(error)
          }
          if (appliId && serverId && accountId) {
            return this.realm.write(() => {
              const data = {
                isToSync: 0,
                id: `${appliId}`,
                serverId: parseInt(serverId, 10),
                synchronizationDate: new Date(),
                accountId: parseInt(accountId, 10),
              }

              if (code) data.code = parseInt(code, 10)
              return this.realm.create('Medias', data, true)
            })
          }
          return;
        }
      )
    )
  }

  removeNeedSync(syncedMedia, accountId) {
    if (!accountId || accountId.length === 0) return Promise.resolve({ message: 'RemoveSyncedMedia - Require account' })
    if (!syncedMedia || syncedMedia.length === 0) return Promise.resolve({ message: 'RemoveSyncedMedia - No data' })
    try {
      // console.log('RemovecSyncedMedia : ' + JSON.stringify(syncedMedia))
      const {
        id, serverId, isToSync, code
        // mediaIdReturn, mediaCodeReturn, mediaServerIdReturn 
      } = syncedMedia;
      this.realm.write(() => {
        const data = {
          id,
          // serverId: serverId ? parseInt(serverId, 10) : mediaServerIdReturn,
          serverId: parseInt(serverId, 10),
          accountId: parseInt(accountId, 10),
          isToSync,
          synchronizationDate: new Date(),
        }
        // if (id !== mediaIdReturn) {
        //   const newData = {...data}
        //   newData.id = mediaIdReturn;
        //   return this.realm.create('Medias', data, true)
        // }
        if (code) data.code = parseInt(code, 10)
        this.realm.create('Medias', data, true)
      })
    } catch (e) {
      // console.log('ErrorRemoveSyncedMedia : ' + e)
      // return { message: e.toString() }
    }
  }

  // upload(data) {
  //   return Auth.check().then(async userRes => {
  //     if (userRes) {
  //       const url = callApi(userRes.subDomain)
  //       await fetchApi(
  //         `${url}/set-media.php?user_name=${userRes.u_login}&password=${userRes.password}&api_version=7&appVersion=v2.0&mId=${data.serverId}&mAppId=${data.id}&mCreatedOn=${data.addDate}&mActif=${data.isActif}&mLegend=${encodeURI(data.legend)}&mlId=0

  //         ?user_name=${userRes.u_login}&password=${userRes.password}&api_version=7&format=json`,
  //         {
  //           method: 'POST',
  //           body: JSON.stringify(data),
  //         }
  //       )
  //     }
  //   })
  // }
}

export default new MediasServices()
