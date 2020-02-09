import uuid from 'uuid'
import moment from 'moment'
import realm from './table'
import { mapField, mapFieldTransform } from './table/categoryTracking'

import { mapObjectFactory } from './utils'

class CategoryTrackingService {

  constructor() {
    this.realm = realm
  }

  drop(accountId) {
    const categoryTrackingItem = this.realm
      .objects('CategoryTracking')
      .filtered(
        `accountId = ${accountId}`
      )
    this.realm.write(() => {
      this.realm.delete(categoryTrackingItem)
    })
  }

  fetch(accountId) {
    // if (!accountId || accountId === 0)
    //   return Promise.reject({ success: false, message: 'FetchUniteItem - Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'FetchCategoryTracking - Ream is not connect' })
      } else {
        const categoriesTracking = this.realm.objects('CategoryTracking')
        resolve(categoriesTracking.reduce((obj, item) => ({ ...obj, [item.id]: item }), {}))
      }
    })
  }

  syncFromServer(categoriesTracking, accountId) {
    if (!categoriesTracking || categoriesTracking.length === 0)
      return Promise.reject({ success: false, message: 'SyncCategoryTrackingFromServer - No category-tracking need sync' })
    console.log('SyncCategoryTrackingFromServer (' +categoriesTracking.length+ ')')
    const localCategoriesTracking = this.realm
      .objects('CategoryTracking')
      // .filtered(`accountId = ${accountId} AND serverId != 0`)
      .filtered(`serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
    const mapObject = mapObjectFactory({ mapField, mapFieldTransform })
    return Promise.all(
      categoriesTracking.map(item => {
        const categoryTrackingItem = mapObject(item)
        try {
          categoryTrackingItem.editDate = new Date(categoryTrackingItem.editDate);
          if (isNaN(categoryTrackingItem.editDate.getTime())) {
            categoryTrackingItem.editDate = new Date();
          }
        }
        catch (e) {
          categoryTrackingItem.editDate = new Date();
        }
        const currentCategoryTracking = localCategoriesTracking[categoryTrackingItem.serverId]
        return new Promise((resolve, reject) => {
          try {
            if (!currentCategoryTracking) {
              categoryTrackingItem.id = uuid.v4()
              // categoryTrackingItem.accountId = parseInt(accountId, 10)
              // unite.isActif = parseInt(unite.isActif, 10)
              this.realm.write(() => {
                this.realm.create('CategoryTracking', categoryTrackingItem)
              })
            } else if (
              !!categoryTrackingItem.synchronizationDate &&
              currentCategoryTracking.synchronizationDate !== categoryTrackingItem.synchronizationDate
            ) {
              this.realm.write(() => {
                resolve(
                  this.realm.create('CategoryTracking', { ...categoryTrackingItem, ...currentCategoryTracking }, true),
                  true
                )
              })
            }
            resolve(true)
          } catch (e) {
            console.log('ErrorSyncCategoryTrackingFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }
}

export default new CategoryTrackingService()
