import Auth from './auth'
import { fetchApi, callApi } from './api'
import uuid from 'uuid'
import realm from './table'
import moment from 'moment'
import userMox from '../mobxs/user'



class TrackingService {

    constructor() {
        this.realm = realm
      }
    insert(trackingData) {
        return new Promise((resolve, reject) => {
          if (!this.realm) {
            reject({ success: false, message: 'InsertMedia - Realm not connectted' })
          } else if (!trackingData) {
            reject({ success: false, message: 'InsertMedia - Media is null' })
          } else {
            try {
              this.realm.write(() => {
                const data = { ...trackingData }
                data.tr_id = uuid.v4()
                data.tr_date = new Date()
                data.isToSync = 1,
                data.isActif = 1,
                data.tr_user_id = userMox.currentUser.u_id
                const trackingDataStorage = realm.create('Trackings', data)
                resolve(trackingDataStorage)
              })
            } catch (e) {
              reject(e.toString())
            }
          }
        })
    }
    getHistory(options){
          if (!this.realm) {
            return [];
          } else {
            const getHistory = this.realm
              .objects('Trackings')
              .filtered(`tr_user_id = "${options.accountId}" AND isActif = 1 ` )
              .sorted('tr_date',true)
            return getHistory
          }
    }

    async syscTracking(user_id){
        const notSync = this.realm.objects('Trackings')
        .filtered(`tr_user_id = "${user_id}" AND isActif = 1 AND isToSync = 1 `)
        .sorted('tr_date',true)

        const newObject =  Object.keys(notSync).map((key)=>{
          let item = {...notSync[key]};
          item.tr_date = Date.parse(item.tr_date)/1000
          delete item.isActif
          delete item.isToSync 
          delete item.tr_id
          return item;
        })
        if(!newObject|| newObject.length==0)
          return;
        let postData = {tracking : newObject,api_version:1}
        const {subDomain,u_login,password} = userMox.currentUser
        // alert(password)
        const url = callApi(subDomain)
        await fetchApi(
          `${url}/set-tracking.php?user_name=${u_login}&password=${password}&api_version=1&appVersion=v2.2`,
          {
              method: 'POST',
              body: JSON.stringify(postData),
          }
          ).then(res=>{
              resData = JSON.parse(res._bodyText)
              
              if (resData && resData.hasOwnProperty('SUCCESS')) {
                try {
                   this.deActiveData()
                } catch (e) {
                  reject(e.toString())
                }
              }
          })
    }
    deActiveData(){
      const cars = realm.objects('Trackings');
      realm.write(() => {
        cars.forEach(car => {
          car.isToSync = 0;
        });
      });
    }
    
}

export default new TrackingService()