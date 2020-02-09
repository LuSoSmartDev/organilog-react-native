// import { Actions, ActionConst } from 'react-native-router-flux'
import { DeviceEventEmitter, NetInfo, Platform } from 'react-native'
import Auth from './auth'
import realm from './table'
import chemin from './chemin'
import client from './client'
import address from './address'
import filiale from './filiale'
import message from './message'
import user from './user'
import setting from './setting'
import intervention from './intervention'
import linkInterventionTask from './linkInterventionTask'
import task from './task'
import unite from './unite'
import uniteItem from './uniteItem'
import uniteLink from './uniteLink'
import media from './media'
import mediaLink from './mediaLink'
import seLocation from './location'
import seTracking from './tracking'
import cateTracking from './CategoryTracking'
import svProduct from './Products'
import svLinkInterventionProduct from './LinkInterventionProduct'

import { fetchApi, callApi, api as _api, 
  APP_VERSION, API_SERVER_TO_MOBILE_VERSION, API_MOBILE_TO_SERVER_VERSION, 
  API_HISTORY_VERSION, API_SERVER_TO_MOBILE_PRODUCT_VERSION 
} from './api'
import RNFetchBlob from 'react-native-fetch-blob'
import qs from 'querystring'

import SyncMobx from '../mobxs/sync'
import UserMobx from '../mobxs/user'
import ClientMobx from '../mobxs/client'
import AddressMobx from '../mobxs/address'
import MessageMobx from '../mobxs/message'
import SettingMobx from '../mobxs/setting'
import InterventionMobx from '../mobxs/intervention'
import CategoryTrackingMobx from '../mobxs/category'
import MobxProduct from '../mobxs/MobxProducts'

import { mapField } from './table/intervention'
import { mapFieldSearch } from './table/products'

let intervalAutoSync = require('../../configs/config.json')

class SyncService {
  constructor() {
    this.realm = realm
    this.tables = [
      'Addresses',
      'Clients',
      'Chemins',
      'Messages',
      'Filiales',
      'Users',
    ]
  }

  getNetworkInfo() {
    return NetInfo.fetch().then((connectionType) => {
      // console.log('connectionType : ' + connectionType)
      if (connectionType.toLowerCase() == 'wifi') {
        return 1;
      } else if (connectionType.toLowerCase() == 'none') {
        return 2;
      } else {
        return 0;
      }
    });
  }

  async sendMediaDataToServer(accountId, mediaUploadUrl, filePath, mediaId) {
    try {
      // console.log('SendedMediaDataToServer')
      return RNFetchBlob.fetch('POST', mediaUploadUrl, {
        'Content-Type': 'application/octet-stream',
      }, RNFetchBlob.wrap(filePath))
        .then(res => {
          // console.log('SendedMediaDataToServer : ' + JSON.stringify(res))
          // console.log('ResSyncMedia : ' + JSON.stringify(res))
          if (res) {
            resData = JSON.parse(res.data)
            if (resData && resData.hasOwnProperty('SUCCESS')) {
              status = resData.SUCCESS
              if (status.toUpperCase() == 'OK') {
                try {
                  const mediaSynced = {
                    isToSync: 2,
                    id: mediaId,
                    // serverId: resData.media_link_id, 
                    serverId: resData.media_id,
                    code: resData.media_code_id,
                  }
                  media.removeNeedSync(
                    mediaSynced,
                    accountId
                  )
                } catch (e) {
                  // console.log('ErrorHandleAfterSyncMediaFromLocal : ' + e)
                }
              }
            }
          }
        })
    } catch (e) {
      // console.log('ErrorSendMediaDataToServer : ' + e)
    }
  }

  async syncMediaToServer(accountId, baseUrl, method, username, password, mediaLinks, interventionsSynced) {
    try {
      // if (!interventionsSynced || !username) {
      //   return
      // }
      // console.log('SyncMediaToServer (' + mediaLinks.length + ') : ' + JSON.stringify(interventionsSynced))
      const medias = await media.getSyncFromLocal(accountId)
      // console.log('MediaNeedSync : ' + JSON.stringify(medias))
      if (medias && Object.keys(medias).length > 0) {
        await medias.map(item => {
          mediaLink.fetchMediaInfo(item.mAppId).then(res => {
            keys = Object.keys(res);
            for (var i = 0; i < keys.length; i++) {
              mediaInfo = res[keys[i]];
              if (mediaInfo && mediaInfo['fkMediaAppliId'] == item.mAppId && mediaInfo['fkColumnAppliId']) {
                item['intId'] = mediaInfo['fkColumnAppliId'];
                item['mMediaSize'] = mediaLink.getCountMediaOfIntervention(accountId, item['intId'], -1)
                const mediaParams = {
                  user_name: username,
                  password: password,
                  api_version: API_MOBILE_TO_SERVER_VERSION,
                  appVersion: APP_VERSION,
                  ...item,
                }
                const filePath = item.mFilePath.replace(/^file:\/\//, '')
                // console.log('SyncMedia : ' + JSON.stringify(mediaParams))
                // console.log('SyncMediaFilePath : ' + filePath)
                const mediaUploadUrl = `${baseUrl}/set-media.php?${qs.stringify(mediaParams)}&sMethod=${method}&appVersion=${APP_VERSION}`
                return this.sendMediaDataToServer(accountId, mediaUploadUrl, filePath, item.mAppId)
                // break;
              }
            }
          })
        })

        // const mediaUpload = medias.map(async (med = {}) => {
        //   const mediaParams = {
        //     user_name: userRes.u_login,
        //     password: userRes.password,
        //     api_version: API_VERSION,
        //     appVersion: APP_VERSION,
        //     ...med,
        //   }
        //   const filePath = med.mFilePath.replace(/^file:\/\//, '')
        //   // console.log('SyncMedia : ' + JSON.stringify(mediaParams))
        //   // console.log('SyncMediaFilePath : ' + filePath)
        //   const mediaUploadUrl = `${baseUrl}/set-media.php?${qs.stringify(mediaParams)}&sMethod=${method}&appVersion=${APP_VERSION}`
        //   return this.sendMediaDataToServer(mediaUploadUrl, filePath)
        //   // return RNFetchBlob.fetch('POST', mediaUploadUrl, {
        //   //   'Content-Type': 'application/octet-stream',
        //   // }, RNFetchBlob.wrap(filePath))
        //   //   // .then((res) => res.json())
        //   //   .then(res => {
        //   //     // console.log('ResSyncMedia : ' + JSON.stringify(res))
        //   //     if (res) {
        //   //       resData = JSON.parse(res.data)
        //   //       if (resData && resData.hasOwnProperty('SUCCESS')) {
        //   //         status = resData.SUCCESS
        //   //         if (status.toUpperCase() == 'OK') {
        //   //           try {
        //   //             // remove synced media
        //   //             // console.log('MediaSynced : ' + JSON.stringify(med))
        //   //             // mediaIdReturn = resData.media_id;
        //   //             // mediaCodeReturn = resData.media_code_id;
        //   //             // mediaServerIdReturn = resData.media_link_id;
        //   //             const mediaSynced = {
        //   //               id: med.mAppId, serverId: resData.media_id, isToSync: 2,
        //   //               mediaIdReturn: resData.media_id,
        //   //               mediaCodeReturn: resData.media_code_id,
        //   //               mediaServerIdReturn: resData.media_link_id
        //   //             }
        //   //             media.removeNeedSync(
        //   //               mediaSynced,
        //   //               accountId
        //   //             )
        //   //           } catch (e) {
        //   //             console.log('ErrorHandleAfterSyncMediaFromLocal : ' + e)
        //   //           }
        //   //         }
        //   //       }
        //   //     }
        //   //   })
        // })
      }
    } catch (e) {
      // console.log('ErrorSyncMediaToServer : ' + e)
    }
  }

  async syncFromLocal(accountId, method = 1) {
    // console.log('StartSyncDataFromMobile')
    // this.getNetworkInfo()
    //check again §


    const interventions = await intervention.getSyncFromLocal(accountId)
    const linkInterventionTasks1 = await linkInterventionTask.getSyncFromLocal(accountId)
    const linkInterventionTasks = linkInterventionTasks1.map(item => {
      let temp = { ...item }
      delete temp.litPlanningMinute
      delete temp.litPlanningToDo
      temp.litOn = 1
      return temp
    })
    const listTasks = linkInterventionTasks.filter(item => item.litDoneMinute != undefined)

    // 
    // console.log("linkInterventionTasks" + JSON.stringify(listTasks))

    const uniteLinks = await uniteLink.getSyncFromLocal(accountId)
    // console.log('InterventionSyncFromMobile : ' + JSON.stringify(interventions))
    const messageries = await message.getSyncFromLocal(accountId)
    const clients = await client.getSyncFromLocal(accountId)
    const addresses = await address.getSyncFromLocal(accountId)
    const medias = await media.getSyncFromLocal(accountId)
    const mediaLinks = await mediaLink.getSyncFromLocal(accountId)
    const linkProducts = await svLinkInterventionProduct.getSyncFromLocal(accountId)
    console.log('LinkProduct : ' + JSON.stringify(linkProducts))
    if (medias) {
      await medias.map(item => {
        mediaLink.fetchMediaInfo(item.mAppId).then(res => {
          keys = Object.keys(res);
          for (var i = 0; i < keys.length; i++) {
            mediaInfo = res[keys[i]];
            if (mediaInfo && mediaInfo['fkMediaAppliId'] == item.mAppId && mediaInfo['fkColumnAppliId']) {
              item['intId'] = mediaInfo['fkColumnAppliId'];
              item['mMediaSize'] = mediaLink.getCountMediaOfIntervention(accountId, item['intId'], -1)
              break;
            }
          }
        })
      })
    }
    // console.log('MediaFromMobile : ' + JSON.stringify(medias));
    // console.log('MediaLinksFromMobile : ' + JSON.stringify(mediaLinks));
    data = {};
    if (clients && Object.keys(clients).length > 0) {
      data.clients = clients
    }
    if (addresses && Object.keys(addresses).length > 0) {
      data.addresses = addresses
    }
    if (messageries && Object.keys(messageries).length > 0) {
      data.messageries = messageries
    }
    if (interventions && Object.keys(interventions).length > 0) {


      let newItem = interventions.filter((x) => {
        return (x !== null)
      });
      data.interventions = newItem


    }
    if (listTasks && Object.keys(listTasks).length > 0) {
      data.lit = listTasks
    }
    if (uniteLinks && Object.keys(uniteLinks).length > 0) {
      data.unite_links = uniteLinks
    }
    if (linkProducts && Object.keys(linkProducts).length > 0) {
      data.lip = linkProducts
    }
    if (mediaLinks && Object.keys(mediaLinks).length > 0) {
      data.mediaLinks = mediaLinks
    }
    console.log('DataSyncFromLocal : ' + JSON.stringify(data))
    if (!data || Object.keys(data).length == 0) {
      seTracking.syscTracking(accountId)
      seLocation.sendLogToServer();
      return
    }
    data.api_version = API_MOBILE_TO_SERVER_VERSION
    data.appVersion = APP_VERSION
    const device_type = Platform.OS === 'ios' ? '2' : '1'
    console.log('SyncDataLocal2Server >>>' + JSON.stringify(data))
    return Auth.check().then(async userRes => {
      if (userRes) {
        const baseUrl = callApi(userRes.subDomain)
        const netWorkStatus = await this.getNetworkInfo();
        // console.log('APISyncFromMobile : ' + `${baseUrl}/set-sync.php?user_name=${userRes.u_login}&password=${userRes.password}&api_version=${API_VERSION}&appVersion=${APP_VERSION}&sMethod=${method}&wifi=${netWorkStatus}&format=json`)
        await fetchApi(
          `${baseUrl}/set-sync.php?user_name=${userRes.u_login}&password=${userRes.password}&device_type=${device_type}&api_version=${API_MOBILE_TO_SERVER_VERSION}&appVersion=${APP_VERSION}&sMethod=${method}&wifi=${netWorkStatus}&format=json`,
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
        )
          .then(res => {
            console.log('ResSyncDataLocal2Server : ' + JSON.stringify(res))
            if (res) {
              resData = JSON.parse(res._bodyText)
              if (resData && resData.hasOwnProperty('SUCCESS')) {
                status = resData.SUCCESS
                if (status.toUpperCase() == 'OK') {
                  // console.log('RemoveSyncedData >>> Start')
                  //
                  try {
                    this.syncMediaToServer(accountId, baseUrl, method, userRes.u_login, userRes.password, mediaLinks, resData.interventions);
                  } catch (e) {
                    // console.log('SyncMediaFailled : ' + e)
                  }
                  try {
                    //send Location to server 
                    seTracking.syscTracking(accountId)
                    seLocation.sendLogToServer();


                  } catch (e) {

                  }
                  try {
                    // remove synced client
                    const clientsOfServer = clients
                      .filter(item => item.cIdServer !== 0)
                      .map(item => ({ id: item.cId, serverId: item.cIdServer, isToSync: 2 }))
                    client.removeNeedSync(
                      clientsOfServer,
                      accountId
                    )
                  } catch (e) {
                    // console.log('RemoveSyncedClientError : ' + e)
                  }
                  //
                  try {
                    // remove synced intervention
                    const interventionsReturn = resData.interventions
                    // console.log('interventionsReturn : ' + JSON.stringify(interventionsReturn))
                    if (interventionsReturn && Object.keys(interventionsReturn).length > 0) {
                      // user_name: userRes.u_login,
                      //     password: userRes.password,
                      // this.syncMediaToServer(accountId, baseUrl, userRes.u_login, userRes.password, mediaLinks, interventionsReturn);
                      const interventionsSynced = interventionsReturn.map(item => ({
                        id: item.appli_id,
                        serverId: item.server_id,
                        code: item.code_id,
                        accountId: accountId,
                        isToSync: 2
                      }))
                      intervention.removeNeedSync(
                        interventionsSynced,
                        accountId
                      )
                    } else {
                      const interventionsOfServer = interventions
                        .filter(item => item.intId !== 0)
                        .map(item => ({
                          id: item.intId,
                          serverId: item.intIdServer,
                          code: item.intCode,
                          accountId: accountId,
                          isToSync: 2
                        }))
                      intervention.removeNeedSync(
                        interventionsOfServer,
                        accountId
                      )
                    }
                  } catch (e) {
                    // console.log('RemoveSyncedInterventionError : ' + e)
                  }
                  //
                  try {
                    // remove synced address
                    const addressesOfServer = addresses
                      .filter(item => item.aId !== 0)
                      .map(item => ({ id: item.aId, serverId: item.aIdServer, isToSync: 2 }))
                    address.removeNeedSync(
                      addressesOfServer,
                      accountId
                    )
                  } catch (e) {
                    // console.log('ErrorHandleSyncedAddress : ' + e)
                  }
                  //
                  try {
                    // remove synced message
                    const messageriesOfServer = messageries
                      .filter(item => item.mesId !== 0)
                      .map(item => ({
                        id: item.mesId,
                        serverId: item.mesIdServer ? item.mesIdServer : 0,
                        fkMessagerieAppliId: item.mesFkMesAppliTo,
                        isToSync: 2
                      }))
                    message.removeNeedSync(
                      messageriesOfServer,
                      accountId
                    )
                  } catch (e) {
                    // console.log('ErrorRemoveSyncedMessage : ' + e)
                  }
                  //
                  try {
                    // remove synced media-link
                    const mediaLinksOfServer = mediaLinks
                      .filter(item => (item.ulId !== 0 || (item.ulAppId != null && item.ulAppId != '')))
                      .map(item => ({
                        id: item.ulAppId,
                        serverId: item.ulId,
                        isToSync: 2
                      }))
                    mediaLink.removeNeedSync(
                      mediaLinksOfServer,
                      accountId
                    )
                  } catch (e) {
                    // console.log('ErrorRemoveSyncedLinkMedia : ' + e)
                  }
                  //
                  try {
                    // remove synced link task
                    const linkTaskSynced = linkInterventionTasks
                      .filter(item => item.litUUID !== '')
                      .map(item => ({
                        id: item.litUUID,
                        serverId: item.litId,
                        isToSync: 2
                      }))
                    linkInterventionTask.removeNeedSync(
                      linkTaskSynced,
                      accountId
                    )
                  } catch (e) {
                    // console.log('ErrorRemoveSyncedLinkTask : ' + e)
                  }
                  //
                  try {
                    // remove synced link unite
                    const uniteLinksSynced = uniteLinks
                      .filter(item => item.litId !== 0)
                      .map(item => ({
                        id: item.ulId,
                        serverId: item.ulIdServer,
                        isToSync: 2
                      }))
                    uniteLink.removeNeedSync(
                      uniteLinksSynced,
                      accountId
                    )
                  } catch (e) {
                    // console.log('ErrorRemoveSyncedLinkUnite : ' + e)
                  }
                }
              }
            }
            this.fetch(accountId)
          }).catch(console.warn)
      }
    })
  }

  async syncFromServer(accountId, method = 1) {
    if (SyncMobx.appIsOnBackground()) {
      console.log('IsOnBackground >>> TerminateSync')
      setInterval(() => {
        if (!SyncMobx.isSyncing()) {
          this.syncFromServer(accountId)
        }
      }, intervalAutoSync.intervalAutoSync)
      return
    }
    console.log('SyncAllDataFromServer >>> Start')
    SyncMobx.start()
    const lastSync = SettingMobx.getLastSync();

    this.syncFromLocal(accountId, method)
    const device_type = Platform.OS === 'ios' ? '2' : '1'
    const netWorkStatus = await this.getNetworkInfo();
    return Auth.check().then(userRes => {
      if (userRes) {
        const companyID = userRes.u_fk_account_id;
        const url = callApi(userRes.subDomain)
        const lastSyncTime = '';
        if (lastSync && userRes.u_id == lastSync.accountId && !isNaN(lastSync.value)) {
          lastSyncTime = lastSync.value;
        }
        urlService = '';
        if (lastSyncTime && !isNaN(lastSyncTime)) {
          urlService = `${url}/get-sync.php?user_name=${userRes.u_login}&password=${userRes.password}&device_type=${device_type}&api_version=${API_SERVER_TO_MOBILE_VERSION}&appVersion=${APP_VERSION}&wifi=${netWorkStatus}&last_synchro=${lastSyncTime}`;
        } else {
          urlService = `${url}/get-sync.php?user_name=${userRes.u_login}&password=${userRes.password}&device_type=${device_type}&api_version=${API_SERVER_TO_MOBILE_VERSION}&appVersion=${APP_VERSION}&wifi=${netWorkStatus}`;
        }
        console.log('APISync : ' + urlService);
        return fetchApi(
          urlService
        )
          .then(res => res.json())
          .then(async res => {
            if (res.length == 0) {
              console.log('CompleteSync >>> FetchInitData : ' + SyncMobx.isFetchInit);
              if (SyncMobx.isFetchedInitData()) {
                console.log('CompleteSync >>> FetchInitData_1');
                SyncMobx.finish();
                DeviceEventEmitter.emit('refresh')
              } else {
                console.log('FetchInitData >>> Start')
                this.fetch(accountId).then(() => {
                  // console.log('FetchDataAfterSyncfinished')
                  SyncMobx.finish()
                  SyncMobx.fetchedInitData(true)
                  DeviceEventEmitter.emit('refresh')
                })
              }
              // SyncMobx.finish()
              // DeviceEventEmitter.emit('refresh')
              // this.fetch(accountId)
              return;
            }

            const syncObj = {}
            Object.keys(res).forEach(key => {
              res[key].forEach(item => {
                syncObj[item.i] = syncObj[item.i] || []
                item.v['0'] = key
                syncObj[item.i].push(item.v)
              })
            })
            // console.log('syncObj'+ Object.keys(syncObj.int))
            await setting.runDefault(accountId)
            console.log("se: " + (syncObj.se || {}).length);
            console.log("che: " + (syncObj.che || {}).length);
            console.log("fi: " + (syncObj.fi || {}).length);
            console.log("c: " + (syncObj.c || {}).length);
            console.log("a: " + (syncObj.a || {}).length);
            console.log("u: " + (syncObj.u || {}).length);
            console.log("mes: " + (syncObj.mes || {}).length);
            console.log("int: " + (syncObj.int || {}).length);
            console.log("ta: " + (syncObj.ta || {}).length);
            console.log("un: " + (syncObj.un || {}).length);
            console.log("uli: " + (syncObj.uli || {}).length);
            console.log("unl: " + (syncObj.unl || {}).length);
            console.log("lit: " + (syncObj.lit || {}).length);
            console.log("Media : " + (syncObj.med || {}).length);
            console.log("MediaLink : " + (syncObj.medl || {}).length);
            console.log("CategoryTracking : " + (syncObj.tcc || {}).length);
            console.log("Product : " + (syncObj.pro || {}).length);
            console.log("LinkProductOfIntervention : " + (syncObj.lip || {}).length);
            arrPromises = [];
            // try {
            //   if (!isNaN((syncObj.se || {}).length) && (syncObj.se || {}).length > 0) {
            //     arrPromises.push(setting.syncFromServer(syncObj.se, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.un || {}).length) && (syncObj.un || {}).length > 0) {
            //     arrPromises.push(unite.syncFromServer(syncObj.un, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.uli || {}).length) && (syncObj.uli || {}).length > 0) {
            //     arrPromises.push(uniteItem.syncFromServer(syncObj.uli, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.ta || {}).length) && (syncObj.ta || {}).length > 0) {
            //     arrPromises.push(task.syncFromServer(syncObj.ta, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.fi || {}).length) && (syncObj.fi || {}).length > 0) {
            //     arrPromises.push(filiale.syncFromServer(syncObj.fi, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.u || {}).length) && (syncObj.u || {}).length > 0) {
            //     arrPromises.push(user.syncFromServer(syncObj.u, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.mes || {}).length) && (syncObj.mes || {}).length > 0) {
            //     arrPromises.push(message.syncFromServer(syncObj.mes, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.che || {}).length) && (syncObj.che || {}).length > 0) {
            //     arrPromises.push(chemin.syncFromServer(syncObj.che, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.c || {}).length) && (syncObj.c || {}).length > 0) {
            //     arrPromises.push(client.syncFromServer(syncObj.c, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.a || {}).length) && (syncObj.a || {}).length > 0) {
            //     // arrPromises.push(address.syncFromServer(syncObj.a.slice(0, 100), accountId))
            //     arrPromises.push(address.syncFromServer(syncObj.a, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.int || {}).length) && (syncObj.int || {}).length > 0) {
            //     //console.log('syncObj.int => ' + JSON.stringify(syncObj.int));
            //     arrPromises.push(intervention.syncFromServer(syncObj.int, accountId, companyID))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.unl || {}).length) && (syncObj.unl || {}).length > 0) {
            //     arrPromises.push(uniteLink.syncFromServer(syncObj.unl, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.lit || {}).length) && (syncObj.lit || {}).length > 0) {
            //     arrPromises.push(linkInterventionTask.syncFromServer(syncObj.lit, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.med || {}).length) && (syncObj.med || {}).length > 0) {
            //     arrPromises.push(media.syncFromServer(syncObj.med, accountId, userRes.subDomain, userRes.u_fk_account_id))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.medl || {}).length) && (syncObj.medl || {}).length > 0) {
            //     arrPromises.push(mediaLink.syncFromServer(syncObj.medl, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.tcc || {}).length) && (syncObj.tcc || {}).length > 0) {
            //     arrPromises.push(cateTracking.syncFromServer(syncObj.tcc, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            // try {
            //   if (!isNaN((syncObj.pro || {}).length) && (syncObj.pro || {}).length > 0) {
            //     arrPromises.push(svProduct.syncFromServer(syncObj.pro, accountId))
            //   }
            // } catch (e) {
            //   console.log(e)
            // }
            try {
              if (!isNaN((syncObj.lip || {}).length) && (syncObj.lip || {}).length > 0) {
                arrPromises.push(svLinkInterventionProduct.syncFromServer(syncObj.lip, accountId))
              }
            } catch (e) {
              console.log(e)
            }
            if (arrPromises && arrPromises.length > 0) {
              console.log('SyncingData...' + arrPromises.length)
              await Promise.all(arrPromises).catch((error) => {
                console.log('ErrorSyncDataFromServer : ' + error.message);
                //SyncMobx.finish()
                //DeviceEventEmitter.emit('refresh')
              });
              console.log('SyncFinished')
              this.fetch(accountId).then(() => {
                // console.log('FetchDataAfterSyncfinished')
                SyncMobx.finish()
                DeviceEventEmitter.emit('refresh')
                if (InterventionMobx.totalDataNew > 0) {
                  DeviceEventEmitter.emit('notification')
                }
              })
              return;
            } else {
              // console.log('NoDataNeedSync...')
              if (SyncMobx.isFetchInit) {
                SyncMobx.finish();
                DeviceEventEmitter.emit('refresh')
              } else {
                console.log('FetchInitData >>> Start')
                this.fetch(accountId).then(() => {
                  // console.log('FetchDataAfterSyncfinished')
                  SyncMobx.finish()
                  SyncMobx.fetchedInitData(true)
                  DeviceEventEmitter.emit('refresh')
                })
              }
              // SyncMobx.finish();
              // DeviceEventEmitter.emit('refresh')
              return;
            }
          })
          // .then(Actions.main({ type: ActionConst.RESET }))
          .catch(
            () => {
              console.log('Exception_occur_when sync from server')
              this.fetch(accountId).then(() => {
                SyncMobx.finish()
                DeviceEventEmitter.emit('refresh')
                InterventionMobx.setCountDataNew(0) // prevent show notification if maybe error occur
              });
              return;
            }
          )
      }
    }).then(
      setInterval(() => {
        if (!SyncMobx.isSyncing()) {
          this.syncFromServer(accountId)
        }
      }, intervalAutoSync.intervalAutoSync)
    )
  }

  async getHistoryIntervention(accountId, interventionServerId) {
    return Auth.check().then(userRes => {
      if (userRes) {
        const url = callApi(userRes.subDomain)
        const device_type = Platform.OS === 'ios' ? '2' : '1'
        urlService = `${url}/get-interventions-historique-sync.php?user_name=${userRes.u_login}&password=${userRes.password}&device_type=${device_type}&appVersion=${APP_VERSION}&api_version=${API_HISTORY_VERSION}&int_id=${interventionServerId}`;
        // console.log('APIGetHistoryIntervention : ' + urlService);
        return fetchApi(
          urlService
        )
          .then(res => res.json())
          .then(async res => {
            if (res && Object.keys(res).length > 0) {
              const listInterventionFromServer = res.interventions
              // const localAddresses = this.realm
              //   .objects('Addresses')
              //   .filtered(`accountId = ${accountId} AND serverId != 0`)
              //   .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
              // const localClients = this.realm
              //   .objects('Clients')
              //   .filtered(`accountId = ${accountId} AND serverId != 0`)
              //   .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
              // const localChemins = this.realm
              //   .objects('Chemins')
              //   .filtered(`accountId = ${accountId} AND serverId != 0`)
              //   .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
              // const localUsers = this.realm
              //   .objects('Users')
              //   .filtered(`accountId = ${accountId} AND serverId != 0`)
              //   .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
              // const localFiliales = this.realm
              //   .objects('Filiales')
              //   .filtered(`accountId = ${accountId} AND serverId != 0`)
              //   .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

              HistoryInterventions = listInterventionFromServer.map(item => {
                // console.log('ItemHistoryIntervention : ' + JSON.stringify(item))
                const Intervention = Object.keys(item).reduce((obj, key) => {
                  if (!item[key] || !mapField[key]) return obj
                  return { ...obj, [mapField[key]]: item[key] }
                }, {})
                // Intervention.fkAdresseAppliId = (localAddresses[Intervention.fkAdresseServerId] || {}).id || ""
                // Intervention.fkUserAppliId = (localUsers[Intervention.fkUserServerlId] || {}).id
                // Intervention.fkCheminAppliId = (localChemins[Intervention.fkCheminServerId] || {}).id
                // Intervention.fkFilialeAppliId = (localFiliales[Intervention.fkFilialeServerId] || {}).id
                // Intervention.fkParentApplId = (localInterventions[Intervention.fkParentServerlId] || {}).id
                return Intervention;
              })
              return HistoryInterventions
            }
            return [];
          })
          .catch(() => {
            // console.log('Error - GetHistoryIntervention')
            return [];
          })
      }
    })
  }

  async findProductWithNom(nom) {
    return Auth.check().then(userRes => {
      if (userRes) {
        const url = callApi(userRes.subDomain)
        const device_type = Platform.OS === 'ios' ? '2' : '1'
        urlService = `${url}/get-product-by-name.php?user_name=${userRes.u_login}&password=${userRes.password}&device_type=${device_type}&name=${nom}`;
        console.log('APIFindProductWithNom : ' + urlService);
        return fetchApi(
          urlService
        )
          .then(res => res.json())
          .then(async res => {
            // console.log('FindProductWithNom >>> Response : ' + JSON.stringify(res))
            if (res && Object.keys(res).length > 0) {
              listProducts = res.map(item => {
                console.log('ItemProduct : ' + JSON.stringify(item))
                // const itemProduct = Object.keys(item).reduce((obj, key) => {
                //   if (!item[key] || !mapFieldSearch[key]) return obj
                //   return { ...obj, [mapFieldSearch[key]]: item[key] }
                // }, {})
                return item;
              })
              return listProducts
            }
            return [];
          })
          .catch(() => {
            console.log('Error - FindProductWithNom')
            return [];
          })
      }
    })
  }

  async fetchAllProductFromServer() {
    return Auth.check().then(userRes => {
      if (userRes) {
        const url = callApi(userRes.subDomain)
        const device_type = Platform.OS === 'ios' ? '2' : '1'
        const lastSyncTime = '';
        const lastSyncProduct = SettingMobx.getLastSyncProduct();
        if (lastSyncProduct && userRes.u_id == lastSyncProduct.accountId && !isNaN(lastSyncProduct.value)) {
          lastSyncTime = lastSyncProduct.value;
        }
        urlService = '';
        if (lastSyncTime && !isNaN(lastSyncTime)) {
          urlService = `${url}/get-products.php?user_name=${userRes.u_login}&password=${userRes.password}&device_type=${device_type}&api_version=${API_SERVER_TO_MOBILE_PRODUCT_VERSION}&last_synchro=${lastSyncTime}`;
        } else {
          urlService = `${url}/get-products.php?user_name=${userRes.u_login}&password=${userRes.password}&device_type=${device_type}&api_version=${API_SERVER_TO_MOBILE_PRODUCT_VERSION}&last_synchro=0`;
        }
        console.log('fetchAllProductFromServer >>> API-Url : ' + urlService);
        return fetchApi(
          urlService
        )
          .then(res => res.json())
          .then(async res => {
            // console.log('fetchAllProductFromServer >>> Response : ' + JSON.stringify(res))
            if (res && Object.keys(res).length > 0) {
              // listProducts = res.map(item => {
              //   console.log('fetchAllProductFromServer >>> ItemProduct : ' + JSON.stringify(item))
              //   return item;
              // })
              svProduct.syncFromServer(res)
              setting.updateLastSyncProduct(userRes.u_id)
              // SettingMobx.updateLastSyncProduct()
              // svProduct.fetch(accountId).then(rs => MobxProduct.setList(rs))
              // await Promise.all([
              //   svProduct.syncFromServer(res),
              //   // SettingMobx.updateLastSyncProduct(),
              //   svProduct.fetch(accountId).then(rs => MobxProduct.setList(rs))
              // ]).catch(console.log)
              // return listProducts
              
            }
            return [];
          })
          .catch(() => {
            console.log('Error - fetchAllProductFromServer')
            return [];
          })
      }
    })
  }

  async joinInterventionNonAssigned(interventionServerId) {
    // console.log("interventionServerId"+interventionServerId)
    return Auth.check().then(userRes => {
      if (userRes) {
        const url = callApi(userRes.subDomain)
        const device_type = Platform.OS === 'ios' ? '2' : '1'
        urlService = `${url}/set-intervention-assignation.php?user_name=${userRes.u_login}&password=${userRes.password}&device_type=${device_type}&appVersion=${APP_VERSION}&api_version=${API_HISTORY_VERSION}&intervention_id=${interventionServerId}`;
        // console.log('Assined Url : ' + urlService);
        return fetchApi(
          urlService
        )
          .then(res => res.json())
          .then(async res => {
            //JSON.stringify(res, undefined, 2);
            return res;
          })
          .catch(() => {
            // console.log('Error - GetHistoryIntervention')
            return [];
          })
      }
    })
  }

  async fetchInit(accountId) {
    Promise.all([
      user.fetch(accountId).then(rs => UserMobx.setList(rs)),
      setting.fetch(accountId).then(rs => SettingMobx.setList(rs)),
    ]).catch(console.log)
    return;
  }

  async fetch(accountId, companyID = 0) {
    // console.log("HDEBUG Start fetch, AccountID : " + accountId);
    // alert(JSON.stringify(cateTracking))
    Promise.all([
      user.fetch(accountId).then(rs => UserMobx.setList(rs)),
      message.fetch(accountId).then(rs => MessageMobx.setList(rs)),
      client.fetch(accountId).then(rs => ClientMobx.setList(rs)),
      address.fetch(accountId).then(rs => AddressMobx.setList(rs)),
      setting.fetch(accountId).then(rs => SettingMobx.setList(rs)),
      intervention.fetch(accountId).then(rs => InterventionMobx.setList(rs)),
      intervention.fetchUnFinish(accountId).then(rs => InterventionMobx.setListUnFinish(rs)),
      intervention.fetchNonAssign(accountId, companyID).then(rs => InterventionMobx.setListNonAssign(rs)),
      cateTracking.fetch(accountId).then(rs=> CategoryTrackingMobx.setList(rs))
    ]).catch(console.log)
    // console.log("HDEBUG End Auth()")
    SyncMobx.fetchedInitData(true)
    return;
  }

  drop(table, accountId) {
    const data = this.realm.objects(table).filtered(`accountId = ${accountId}`)
    this.realm.write(() => {
      this.realm.delete(data)
    })
  }

  dropWithout(table) {
    const data = this.realm.objects(table)
    this.realm.write(() => {
      this.realm.delete(data)
    })
  }

  dropAll(accountId) {
    this.tables.forEach(table => this.drop(table, accountId))
  }

  dropAllWithout() {
    this.tables.forEach(table => this.dropWithout(table))
  }
}

export default new SyncService()
