import uuid from 'uuid'
import moment from 'moment'
import { mapField, mapServerField } from './table/linkInterventionTask'
import { parseDateFromUnixTime } from './utils/transform.js'
import realm from './table'

class LinkInterventionTaskServices {
  accountId = 0

  constructor() {
    this.realm = realm
  }

  drop(accountId) {
    const linkInterventionTasks = this.realm
      .objects('LinkInterventionTask')
      .filtered(`accountId = ${accountId}`)
    this.realm.write(() => {
      this.realm.delete(linkInterventionTasks)
    })
  }

  fetch(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const linkInterventionTasks = this.realm
          .objects('LinkInterventionTask')
          .filtered(`accountId = ${accountId} AND isActif = 1`)
        const all = linkInterventionTasks.map(item => ({ ...item }))
        resolve(all)
      }
    })
  }

  dropOldLinkTaskOfIntervention(accountId, interventionId, interventionServerId) {
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
      linkTasks = this.realm
        .objects('LinkInterventionTask')
        .filtered(conditionQuery)
      keys = Object.keys(linkTasks);
      for (var i = 0; i < keys.length; i++) {
        try {
          const itemLinkTask = linkTasks[keys[i]];
          // realm.delete(itemLinkTask)
          // itemLinkTask.isDelete = 1;
          itemLinkTask.isActif = 0;
          itemLinkTask.isToSync = 1;
          realm.create('LinkInterventionTask', itemLinkTask, true)
        } catch (eD) {
          // console.log('ErrorDeleteItemLinkTask : ' + eD)
        }
      }
    } catch (e) {
      // console.log('RemoveLinkTaskError : ' + e)
    }
  }

  insertList(tasks, intervention) {
    //console.log("sap den dich : "+JSON.stringify(tasks))
    let selectTask = tasks.filter(item => {
      return item.isSelect
    })
    let itemUnselected = tasks.filter(item => {
      return !item.isSelect && item.planningMinute!=undefined
    })

    let selectTasks = selectTask.concat(itemUnselected)
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Realm not connectted' })
      } else {
        try {
          resolve(selectTasks.map(item => {
            let data = {}
            if (!data.id) {
              data.id = uuid.v4()
            }
            // console.log('DLMN1')
            data.id = uuid.v4()
            data.accountId = item.accountId
            data.fkTaskAppliId = item.id
            data.fkTaskServerId = item.serverId
            data.fkInterventionAppliId = intervention.id
            data.fkInterventionServerId = intervention.serverId
            data.isActif = 1
            data.isPlanningToDo = intervention.isDone == 1 ? 0 : 1
            data.isDone = intervention.isDone == 1 ? 1 : 0
            data.synchronizationDate = new Date()
            data.editDate = new Date()
            data.serverId = 0
            let seconds = parseInt(item.time.split(':')[1])
            let minutes = parseInt(item.time.split(':')[0])
            if(item.hasOwnProperty("planningMinute")){
              data.planningMinute = item.planningMinute
            }
            if(minutes * 60 + seconds>0){
              data.doneMinute = minutes * 60 + seconds
            }
            if(!item.isSelect){
              if(minutes * 60 + seconds>0){
                data.doneMinute = -10
              }else{
                data.doneMinute = 0
              }
            }
              //data.doneMinute = 0
            
            data.comment = ''
            data.isToSync = 1
            data.addDate = new Date()
            data.lastViewDate = new Date()
            console.log('DLMN2 =>'+ JSON.stringify(data))
            return realm.create('LinkInterventionTask', data,true)
          })
        )
          
         
        } catch (e) {
          reject({ message: e.toString() })
        }
      }
    })
  }

  getCountTaskOfIntervention(accountId, interventionId, interventionServerId) {
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
        .objects('LinkInterventionTask')
        .filtered(conditionQuery).length
    } catch (e) {
      // console.log('CountLinkTaskError : ' + e)
      return 0;
    }
  }

  getSyncFromLocal(accountId) {
    return this.realm
      .objects('LinkInterventionTask')
      .filtered(`accountId = ${accountId} AND isToSync = 1`)
      .map(item =>
        Object.keys(item).reduce(
          (obj, key) =>{
            if( !mapServerField[key] || item[key] == -1 || (key=='doneMinute' && item[key]==0)) {
              return obj
            } else {
              let temp = item[key];
              if(key=='doneMinute' && item[key]==-10)
                temp = 0
              return ({ ...obj, [mapServerField[key]]: temp })
            }
          },
          {}
        )
      )
  }

  syncFromServer(linkInterventionTasks, accountId) {
    
    if (!linkInterventionTasks || linkInterventionTasks.length === 0)
      return Promise.reject({ success: false, message: 'SyncLinkTaskFromServer - No linkInterventionTasks need sync' })
  
    const localLinkInterventionTasks = this.realm
      .objects('LinkInterventionTask')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})


    const localTasks = this.realm
      .objects('Task')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

    const localInterventions = this.realm
      .objects('Interventions')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
  
    return Promise.all(
      linkInterventionTasks.map(item => {
        
        const linkInterventionTask = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})

        if (item.k) {
          linkInterventionTask.id = item.k
        } else {
          linkInterventionTask.id = uuid.v4()
        }
        try {
          linkInterventionTask.addDate = parseDateFromUnixTime(linkInterventionTask.addDate)
          try {
            linkInterventionTask.editDate = new Date(linkInterventionTask.editDate * 1000);
            if (isNaN(linkInterventionTask.editDate.getTime())) {
              linkInterventionTask.editDate = new Date()
            }
          } catch (e) {
            linkInterventionTask.editDate = new Date()
          }
        } catch (e) {

        }
        const currentlinkInterventionTasks = localLinkInterventionTasks[linkInterventionTask.serverId]
        // alert('findout=>'+JSON.stringify(currentlinkInterventionTasks))

        return new Promise((resolve, reject) => {
          try {
            if (!currentlinkInterventionTasks) {
              linkInterventionTask.accountId = parseInt(accountId, 10)
              linkInterventionTask.synchronizationDate = new Date()
              linkInterventionTask.isToSync = 2
              linkInterventionTask.lastViewDate = new Date()
              linkInterventionTask.fkTaskAppliId = linkInterventionTask.fkTaskServerId ? ((localTasks[linkInterventionTask.fkTaskServerId] || { id: 0 }).id || "") : ""
              linkInterventionTask.fkInterventionAppliId = linkInterventionTask.fkInterventionServerId ? ((localInterventions[linkInterventionTask.fkInterventionServerId] || { id: 0 }).id || "") : ""
              //need to check 
              if(!linkInterventionTask.planningMinute){
                linkInterventionTask.planningMinute = 0
              }

              this.realm.write(() => {
                this.realm.create('LinkInterventionTask', linkInterventionTask)
              })
            } else if (
              !!linkInterventionTask.synchronizationDate &&
              currentlinkInterventionTasks.synchronizationDate !==
              linkInterventionTask.synchronizationDate
            ) {
              this.realm.write(() => {
                this.realm.create('LinkInterventionTask', {
                  ...linkInterventionTask,
                  ...currentlinkInterventionTasks,
                }, true)
              })
            }
            resolve(true)
          } catch (e) {
            console.log('ErrorSyncLinkTaskFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }

  removeNeedSync(linkInterventionTasks, accountId) {
    if (!accountId || accountId.length === 0) return Promise.resolve({ message: 'RemoveSyncedLinkTask - Require account' })
    if (!linkInterventionTasks || linkInterventionTasks.length === 0) return Promise.resolve({ message: 'RemoveSyncedLinkTask - No data' })
    // console.log('RemoveSyncedListTasks')
    return Promise.all(
      linkInterventionTasks.map(({ id, serverId, isToSync }) => {
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
            return this.realm.create('LinkInterventionTask', data, true)
          })
        } catch (e) {
          // console.log('ErrorRemoveSyncedLinkTask : ' + e)
          return { message: e.toString() }
        }
      }))
  }
}

export default new LinkInterventionTaskServices()
