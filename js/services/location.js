import Auth from './auth'
import { fetchApi, callApi } from './api'
import uuid from 'uuid'
import realm from './table'
import moment from 'moment'

class LocationService {

    constructor() {
        this.realm = realm
      }

    drop( accountId) {
        const location = this.realm
          .objects('Locations')
          .filtered(`accountId = ${accountId}`)
        this.realm.write(() => {
          this.realm.delete(location)
        })
    }  
    //insert new location 
    insert(location) {
        return new Promise((resolve, reject) => {
          if (!this.realm) {
            reject({ success: false, message: 'InsertLocation - Realm not connectted' })
          } else if (!location) {
            reject({ success: false, message: 'InsertLocation - Location is null' })
          } else {
        
            try {
              this.realm.write(() => {
                const data = { ...location }
                data.lId = uuid.v4()
                data.lDate = new Date()
                data.isToSync = 1
                const newLocation = realm.create('Locations', data)
                resolve(newLocation)
              })
            } catch (e) {
              // console.log('ErrorInsertMedia : ' + e)
              reject(e.toString())
            }
          }
        })
      }
     sendLogToServer() {
        return Auth.check().then(async userRes => {
        if (userRes) {
            const data = this.realm.
            objects('Locations')
            .filtered(`accountId = ${userRes.u_id} AND isToSync = 1`)
            if(!data || data.length == 0)
                return;
            
            const reducerData = data.map(location=>{
                let newLoc = {};
                newLoc.lLong = location.lLong
                newLoc.lDate =  moment(location.lDate).format("X")
                newLoc.lLat = location.lLat
                return newLoc;
            })
            let postData = {api_version:3,location:reducerData}
            const url = callApi(userRes.subDomain)
            await fetchApi(
            `${url}/set-geoloc.php?user_name=${userRes.u_login}&password=${userRes.password}&api_version=3&appVersion=v2.2`,
            {
                method: 'POST',
                body: JSON.stringify(postData),
            }
            ).then(res=>{
                resData = JSON.parse(res._bodyText)
                if (resData && resData.hasOwnProperty('SUCCESS')) {
                    this.drop(userRes.u_id);
                }
            })
        }
    })
    }

}
export default new LocationService();