import uuid from 'uuid'
import moment from 'moment'
import realm from './table'
import { mapField, mapServerField, mapFieldTransform } from './table/task'
import { mapObjectFactory } from './utils'
import TaskMobx from '../mobxs/task'

class TaskServices {
  list

  constructor() {
    this.realm = realm
  }

  drop(accountId) {
    const Messages = this.realm
      .objects('v')
      .filtered(
        `fkUserServerIdFrom = ${accountId} OR fkUserServerIdTo = ${accountId}`
      )
    this.realm.write(() => {
      this.realm.delete(Messages)
    })
  }

  fetch(accountId) {
    console.log('FetchDataTask >>> Start')
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'FetchListTask - Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'FetchListTask - Ream is not connect' })
      } else {
        const tasks = this.realm
          .objects('Task')
          .filtered(`accountId = ${accountId} AND isActif = 1`)
          .sorted('sortIndex')
        resolve(tasks.reduce((obj, item) => ({ ...obj, [item.id]: item }), {}))
      }
    })
  }

  fetchTaskById(taskId) {
    if (!taskId) return Promise.reject({ success: false, message: 'Required a task id' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const tasks = this.realm
          .objects('Task')
          .filtered(`id = "${taskId}" AND isActif = 1`)
          .sorted('sortIndex')
        // resolve(tasks.reduce((obj, item) => ({ ...obj, [item.id]: item }), {}))
        resolve(tasks);
      }
    })
  }

  syncFromServer(tasks, accountId) {
    if (!tasks || tasks.length === 0)
      return Promise.reject({ success: false, message: 'SyncTaskFromServer - No task need sync' })
    // console.log('SyncTaskFromServer ('+tasks.length+')')
    var localTasks = {}
    if (TaskMobx.isNeedReloadTaskByServerId()) {
      localTasks = this.realm
        .objects('Task')
        .filtered(`accountId = ${accountId} AND serverId != 0`)
        .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
      TaskMobx.setListTaskByServerId(localTasks)
    } else {
      localTasks = TaskMobx.listTaskByServerId
    }
    const mapObject = mapObjectFactory({ mapField, mapFieldTransform })
    return Promise.all(
      tasks.map(item => {
        const task = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})
        // const task = mapObject(item)
        if (item.k) {
          task.id = item.k;
        } else {
          task.id = uuid.v4();
        }
        const currentTasks = localTasks[task.serverId]
        return new Promise((resolve, reject) => {
          if (!task.nom) {
            resolve(true)
          }
          try {
            if (!currentTasks) {
              // task.id = uuid.v4()
              task.synchronizationDate = new Date()
              task.accountId = parseInt(accountId, 10)
              if (task.isActif) {
                task.isActif = parseInt(task.isActif, 10)
              }
              task.addDate = new Date(task.addDate * 1000);

              this.realm.write(() => {
                this.realm.create('Task', task)
              })
            } else if (
              !!task.synchronizationDate &&
              currentTasks.synchronizationDate !== task.synchronizationDate
            ) {
              this.realm.write(() => {
                resolve(
                  this.realm.create('Task', {
                    ...task,
                    ...currentTasks,
                  }, true),
                  true
                )
              })
            }
            resolve(true)
          } catch (e) {
            // console.log('ErrorSyncTaskFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }
}

export default new TaskServices()
