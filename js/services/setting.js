import uuid from 'uuid'

import moment from 'moment'
import realm from './table'
import { mapField, mapFieldTransform, } from './table/setting'
import settingDefault from './data/setting.json'
import SettingMobx from '../mobxs/setting'

import { mapObjectFactory } from './utils'

class SettingServices {
  constructor() {
    this.realm = realm

    this.ignore = ['SYNC_SIMPLE', 'MOBILE_DISTANCE_GEOLOC']
    this.mapFieldChange = {
      MOBILE_ACTIVATE_TAKE_PHOTO: 'PREF_DISPLAY_BTN_TAKE_PHOTO',
      MOBILE_ACTIVATE_SEARCH_PHOTO: 'PREF_DISPLAY_BTN_SEARCH_PHOTO',
      MOBILE_ACTIVATE_TAKE_SIGNATURE: 'PREF_DISPLAY_BTN_TAKE_SIGNATURE',
      // MOBILE_DISPLAY_CHECKBOX_IS_DONE: 'PREF_DISPLAY_CHECKBOX_IS_DONE',
      MOBILE_CAN_EDIT_USERS: 'PREF_CAN_EDIT_USERS',
      MOBILE_CAN_EDIT_DATES: 'PREF_CAN_EDIT_DATES',
      MOBILE_CAN_EDIT_HOURS: 'PREF_CAN_EDIT_HOURS',
      MOBILE_CAN_EDIT_CLIENT_ADRESSE: 'PREF_CAN_EDIT_CLIENT_ADRESSE',
      MOBILE_HOUR_START_DEFAULT: 'PREF_HOUR_START',
      MOBILE_HOUR_START_PAUSE_DEFAULT: 'PREF_HOUR_START_PAUSE',
      MOBILE_HOUR_END_PAUSE_DEFAULT: 'PREF_HOUR_END_PAUSE',
      MOBILE_HOUR_END_DEFAULT: 'PREF_HOUR_END',
      MOBILE_REPORTER_INTERVENTIONS_DEFAULT: 'PREF_NOTIF_INTERVENTION',
      MOBILE_PREREMPLIR_PLANNING_DATE: 'PREF_PREREMPLIR_PLANNING_DATE',
      MOBILE_ACTIVATE_MULTIPLY_HOUR_TASKS_WHEN_MULTIUSERS:
        'PREF_MULTIPLY_TASK_HOURS_WHEN_MULTIUSERS',
      NOT_ASSIGNED_IS_ACTIF: 'PREF_NOT_ASSIGNED_IS_ACTIF',
      MOBILE_LOCATION_IS_ACTIF: 'PREF_MOBILE_LOCATION_IS_ACTIF',
      MOBILE_ACTIVATE_CLIENT_ADRESSE_ON_MENU: 'PREF_MOBILE_ACTIVATE_CLIENT_ADRESSE_ON_MENU' //menu show hide 
    }
  }

  drop(accountId) {
    const Settings = this.realm
      .objects('Settings')
      .filtered(`accountId = ${accountId}`)
    this.realm.write(() => {
      this.realm.delete(Settings)
    })
  }

  updateValue(value, id) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject('Ream is not connect')
      } else {
        this.realm.write(() => {
          this.realm.create('Settings', { id, value, isToSync: 1 }, true)
        })
      }
    })
  }

  fetch(accountId) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Ream is not connect' })
      } else {
        const settings = this.realm
          .objects('Settings')
          .filtered(`accountId = '${accountId}' AND isActif != '0'`)
        if (settings.length === 0) {
          reject({ success: true, message: 'No record in settings' })
        } else {
          SettingMobx.setListWithoutCategory(settings, accountId)
          resolve(
            settings.reduce((preObj, item) => {
              if (item.name === 'PREF_DISTANCE_GEOLOC') return preObj

              const setting = { ...item }
              const obj = { ...preObj }
              if (setting.name === 'PREF_FONT_SIZE')
                setting.value = parseInt(setting.value, 10)

              if (setting.arrange) setting.arrange = JSON.parse(setting.arrange)

              const currentCategory = obj[setting.categoryKey]
              if (!currentCategory) {
                obj[setting.categoryKey] = {
                  items: {
                    [setting.name]: setting,
                  },
                  name: setting.categoryKey,
                }
              } else {
                obj[setting.categoryKey].items[setting.name] = setting
              }

              return obj
            }, {})
          )
        }
      }
    })
  }

  runDefault(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'Required a account' })
    if (!this.realm)
      return Promise.reject({ success: false, message: 'Ream is not connect' })

    const settings = this.realm
      .objects('Settings')
      .filtered(`accountId = ${accountId}`)

    if (settings.length === 0) {
      SettingMobx.accountId = accountId;
      return Promise.all(
        settingDefault.map(category =>
          Object.keys(category.items).map(
            key =>
              new Promise((resolve, reject) => {
                const categoryKey = category.name
                const {
                  name,
                  type,
                  arrange,
                  description,
                  defaultValue,
                  defaultValue: value,
                } = category.items[key]

                const setting = {
                  name,
                  type,
                  value,
                  categoryKey,
                  defaultValue,
                  id: uuid.v4(),
                  description: description || '',
                  accountId: parseInt(accountId, 10),
                  arrange: JSON.stringify(arrange || ''),
                  addDate: new Date(),
                }
                // console.log('SettingDefaultItem : ' + JSON.stringify(setting))
                try {
                  this.realm.write(() => {
                    this.realm.create('Settings', setting)
                  })
                  resolve(true)
                } catch (e) {
                  reject({ success: false, message: e.toString() })
                }
              })
          )
        )
      )
    }
    return Promise.resolve(true)
  }

  syncFromServer(Settings, accountId) {
    if (!Settings || Settings.length === 0)
      return Promise.reject({ success: false, message: 'SyncSettingFromServer - No setting need sync' })
    // console.log('SyncSettingFromServer (' + Settings.length + ')')
    const localSettings = this.realm
      .objects('Settings')
      .filtered(`accountId = ${accountId}`)
      .reduce((obj, item) => ({ ...obj, [item.name]: item }), {})

    const mapObject = mapObjectFactory({
      mapField,
      mapFieldTransform,
    })
    return Promise.all(
      Settings.map(item => {
        // console.log('ItemSetting : ' + JSON.stringify(item))
        const Setting = mapObject(item)
        console.log('SettingParse : ' + JSON.stringify(Setting))
        if (this.ignore.includes(Setting.name)) return Promise.resolve(true)
        if (this.mapFieldChange[Setting.name])
          Setting.name = this.mapFieldChange[Setting.name]
        if (Setting.name === 'PREF_DISTANCE_GEOLOC')
          return Promise.resolve(true)
        const currentSetting = localSettings[Setting.name]

        return new Promise((resolve, reject) => {
          if (Setting.isActif !== '')
            Setting.isActif = parseInt(Setting.isActif, 10)
          try {
            if (!currentSetting) {
              Setting.id = uuid.v4()
              Setting.accountId = parseInt(accountId, 10)
              Setting.synchronizationDate = new Date()

              Setting.addDate = new Date(Setting.addDate * 1000);
              if (isNaN(Setting.addDate.getTime())) {
                Setting.addDate = new Date();
              }
              this.realm.write(() => {
                resolve(this.realm.create('Settings', Setting))
              })
              // console.log('SyncSetting -------------------- 1');
            } else if (
              currentSetting.synchronizationDate !==
              Setting.synchronizationDate &&
              parseInt(currentSetting.isToSync, 10) !== 1
            ) {
              this.realm.write(() => {
                Setting.addDate = new Date(Setting.addDate * 1000);
                if (isNaN(Setting.addDate.getTime())) {
                  Setting.addDate = currentSetting.addDate || new Date();
                }
                const setting = { ...currentSetting, ...Setting }
                resolve(this.realm.create('Settings', setting, true))
              })
              // console.log('SyncSetting -------------------- 2');
            } else resolve(true)
          } catch (e) {
            // console.log('ErrorSyncSettingFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }

  updateLastSync(accountId, lastSyncTime) {
    try {
      const existSetting = this.realm
        .objects('Settings')
        .filtered(`accountId = ${accountId} AND name = "PREF_INIT_LAST_SYNCHRO" && categoryKey = "SYNCHRONIZATION"`);
      this.realm.write(() => {
        const setting = { ...existSetting[0] }
        setting.value = lastSyncTime
        return this.realm.create('Settings', setting, true)
      })
    } catch (e) {
      // console.log('ErrorUpdateLastSync : ' + e)
    }

  }

  updateLastSyncProduct(accountId, lastSyncTime) {
    try {
      lastSyncTime = moment().format('X')
      const existSetting = this.realm
        .objects('Settings')
        .filtered(`accountId = ${accountId} AND name = "PREF_INIT_LAST_SYNCHRO_PRODUCT" && categoryKey = "SYNCHRONIZATION"`);
      console.log('ExistSettingProduct : ' + JSON.stringify(existSetting))
      if (!existSetting) {
        existSetting.id = uuid.v4()
        existSetting.accountId = parseInt(accountId, 10)
      }
      existSetting.name = 'PREF_INIT_LAST_SYNCHRO_PRODUCT'
      existSetting.categoryKey = 'SYNCHRONIZATION'
      console.log('SettingProduct : ' + JSON.stringify(existSetting))
      this.realm.write(() => {
        const setting = { ...existSetting[0] }
        setting.value = lastSyncTime
        return this.realm.create('Settings', setting, true)
      })
      SettingMobx.updateLastSyncProduct(lastSyncTime)
    } catch (e) {
      // console.log('ErrorUpdateLastSync : ' + e)
    }

  }
}

export default new SettingServices()
