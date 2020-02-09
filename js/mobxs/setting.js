import moment from 'moment'
import { observable, computed } from 'mobx'
import SettingService from '../services/setting'
import setting from '../services/setting';
// import { Object } from 'realm';

class Setting {
  list = observable({})
  Alllist = observable({})
  // lastSyncTime
  accountId = 0
  lastSyncTime = ''
  lastSyncTimeProduct = ''
  // setting ui
  // list intervention
  isShowOldIntervention = true
  isDisplayTitle = true
  isDisplayPiority = true
  isDisplayCustomer = true
  isDisplayAddress = true
  isEnableProgressStatus = true
  // detail intervention
  isDisplayTimer = true
  isDisplayMap = true
  isAllowSendEmail = true
  // notification
  isNotifyNewMessage = true
  isNotifyNewIntervention = true
  // non-assign data
  isHandleNonAssignIntervention = false
  isLoadSetting = false;
  isEnableGPS = false;
  isActiveClientAdresse = false
  // create-modify intervention
  isAllowModifyClientAddress = true
  isAllowModifySpeeker = true
  isAllowModifyTitle = true
  isAllowModifyDate = true
  isAllowModifyTime = true

  //MOBILE_ACTIVATE_CLIENT_ADRESSE_ON_MENU
  setList(settings) {
    this.list = settings
    this._fetchSetting()

  }

  _fetchSetting = () => {
    this._fetchSettingHandleNonAssignIntervention()
    this._fetchSettingDisplayListIntervention()
    this._fetchSettingDisplayDetailIntervention()
    this._fetchSettingNotification()
    this._fetchSettingModifyIntervention()
  }

  setListWithoutCategory(settings, accountId) {
    this.accountId = accountId;
    if (settings && settings.length > 0) {
      this.Alllist = settings.reduce(
        (obj, item) => ({ ...obj, [item.name]: item }), {}
      )
    }

  }

  setValueItem(categoryKey, itemKey, value) {
    try {
      const list = { ...this.list }
      const category = list[categoryKey]
      if (categoryKey == 'SYNCHRONIZATION' && itemKey == 'PREF_INIT_LAST_SYNCHRO') {
        this.lastSyncTime = value
      }
      if (categoryKey == 'SYNCHRONIZATION' && itemKey == 'PREF_INIT_LAST_SYNCHRO_PRODUCT') {
        this.lastSyncTimeProduct = value
      }
      if (category && category.hasOwnProperty('items')) {
        const currentItem = category.items[itemKey]
        const newItem = { ...currentItem, value }
        SettingService.updateValue(value, currentItem.id)
        category.items[itemKey] = newItem
        this.Alllist[itemKey] = newItem
      } else {
        if (this.lastSyncTime && this.accountId != 0) {
          SettingService.updateLastSync(this.accountId, this.lastSyncTime)
        }
        if (this.lastSyncTimeProduct && this.accountId != 0) {
          SettingService.updateLastSyncProduct(this.accountId, this.lastSyncTimeProduct)
        }
      }
      //
      this.list = {
        ...list,
        [categoryKey]: { ...category },
      }

      this._fetchSettingDisplayListIntervention();
      this._fetchSettingNotification();
    } catch (e) {
      // console.log('ErrorUpdateSetting : ' + e)
    }
  }

  lastSync() {
    try {
      const last = this.Alllist.PREF_INIT_LAST_SYNCHRO
      if (last) {
        this.setValueItem(
          'SYNCHRONIZATION',
          'PREF_INIT_LAST_SYNCHRO',
          // moment().format('YYYY-MM-DD HH:mm:ss')
          moment().format('X')
        )
      }
    } catch (e) {
      // console.log('ErrorGetLastSync : ' + e)
    }
    this._fetchSetting()
  }

  updateLastSync(lastSyncTime) {
    try {
      this.setValueItem(
        'SYNCHRONIZATION',
        'PREF_INIT_LAST_SYNCHRO',
        lastSyncTime
      )
    } catch (e) {
      // console.log('ErrorUpdateLastSync : ' + e)
    }
  }

  getLastSync() {
    return this.Alllist.PREF_INIT_LAST_SYNCHRO;
  }

  updateLastSyncProduct(lastSyncTime) {
    try {
      this.setValueItem(
        'SYNCHRONIZATION',
        'PREF_INIT_LAST_SYNCHRO_PRODUCT',
        // lastSyncTime
        moment().format('X')
      )
    } catch (e) {
      // console.log('ErrorUpdateLastSync : ' + e)
    }
  }

  getLastSyncProduct() {
    return this.Alllist.PREF_INIT_LAST_SYNCHRO_PRODUCT;
  }

  _fetchSettingDisplayListIntervention = () => {
    try {
      const settingIntervention = this.dataArray['2']
      if (settingIntervention && Object.keys(settingIntervention).length > 0 && settingIntervention.hasOwnProperty('items')) {
        items = settingIntervention['items'];
        if (items && Object.keys(items).length > 0) {
          if (items.hasOwnProperty('PREF_REPORTER_INTERVENTIONS')) {
            this.isShowOldIntervention = items['PREF_REPORTER_INTERVENTIONS']['value'] !== '0';
          }
          if (items.hasOwnProperty('PREF_DISPLAY_HOME_INTERVENTION_TITLE')) {
            this.isDisplayTitle = items['PREF_DISPLAY_HOME_INTERVENTION_TITLE']['value'] !== '0';
          }
          if (items.hasOwnProperty('PREF_DISPLAY_HOME_INTERVENTION_PRIORITY')) {
            this.isDisplayPiority = items['PREF_DISPLAY_HOME_INTERVENTION_PRIORITY']['value'] !== '0';
          }
          if (items.hasOwnProperty('PREF_DISPLAY_HOME_INTERVENTION_CLIENT')) {
            this.isDisplayCustomer = items['PREF_DISPLAY_HOME_INTERVENTION_CLIENT']['value'] !== '0';
          }
          if (items.hasOwnProperty('PREF_DISPLAY_HOME_INTERVENTION_ADRESSE')) {
            this.isDisplayAddress = items['PREF_DISPLAY_HOME_INTERVENTION_ADRESSE']['value'] !== '0';
          }
          if (items.hasOwnProperty('PREF_DISPLAY_HOME_INTERVENTION_TOGGLE_PROGRESS')) {
            this.isEnableProgressStatus = items['PREF_DISPLAY_HOME_INTERVENTION_TOGGLE_PROGRESS']['value'] !== '0';
          }
        }
      }
    } catch (e) {
      // console.log('ErrorFetchSettingDisplayListIntervention : ' + e)
    }
  }

  _fetchSettingDisplayDetailIntervention = () => {
    const settingIntervention = this.dataArray['3']
    if (settingIntervention && Object.keys(settingIntervention).length > 0 && settingIntervention.hasOwnProperty('items')) {
      items = settingIntervention['items'];
      if (items && Object.keys(items).length > 0) {
        if (items.hasOwnProperty('PREF_DISPLAY_CHRONO')) {
          this.isDisplayTimer = items['PREF_DISPLAY_CHRONO']['value'] !== '0';
        }
        if (items.hasOwnProperty('PREF_DISPLAY_MAP')) {
          this.isDisplayMap = items['PREF_DISPLAY_MAP']['value'] !== '0';
        }
        if (items.hasOwnProperty('PREF_SEND_MAIL')) {
          this.isAllowSendEmail = items['PREF_SEND_MAIL']['value'] !== '0';

        }
      }
    }
  }

  _fetchSettingNotification = () => {
    try {
      const settingNotification = this.dataArray['6']
      if (settingNotification && Object.keys(settingNotification).length > 0 && settingNotification.hasOwnProperty('items')) {
        items = settingNotification['items'];
        if (items && Object.keys(items).length > 0) {
          if (items.hasOwnProperty('PREF_NOTIF_MESSAGE')) {
            this.isNotifyNewMessage = items['PREF_NOTIF_MESSAGE']['value'] !== '0';
          }
          if (items.hasOwnProperty('PREF_NOTIF_INTERVENTION')) {
            this.isNotifyNewIntervention = items['PREF_NOTIF_INTERVENTION']['value'] !== '0';
          }
        }
      }
    } catch (e) {
      // console.log('ErrorFetchSettingNotification : ' + e)
    }
  }
  _fetchSettingHandleNonAssignIntervention = () => {
    try {

      const undefied_item = this.dataArray['7'] //undified;
      if (undefied_item && Object.keys(undefied_item).length > 0 && undefied_item.hasOwnProperty('items')) {
        items = undefied_item['items'];
        console.log('items : ' + JSON.stringify(items))
        if (items.hasOwnProperty('PREF_NOT_ASSIGNED_IS_ACTIF')) {
          this.isHandleNonAssignIntervention = items['PREF_NOT_ASSIGNED_IS_ACTIF']['value'] !== '0';
        }
        if (items.hasOwnProperty('PREF_MOBILE_LOCATION_IS_ACTIF')) {
          this.isEnableGPS = items['PREF_MOBILE_LOCATION_IS_ACTIF']['value'] !== '0';
        }
        if (items.hasOwnProperty('PREF_MOBILE_ACTIVATE_CLIENT_ADRESSE_ON_MENU')) {
          // alert(items['PREF_MOBILE_ACTIVATE_CLIENT_ADRESSE_ON_MENU']['value'])
          this.isActiveClientAdresse = items['PREF_MOBILE_ACTIVATE_CLIENT_ADRESSE_ON_MENU']['value'] !== '0';
          // alert(this.isActiveClientAdresse)
        }
        // if (items.hasOwnProperty('MOBILE_ACTIVATE_CLIENT_ADRESSE_ON_MENU')){
        //   alert(items['MOBILE_ACTIVATE_CLIENT_ADRESSE_ON_MENU']['value'] )
        //   this.isActiveClientAdresse = items['MOBILE_ACTIVATE_CLIENT_ADRESSE_ON_MENU']['value'] !== '0';
        // }
      }

    } catch (e) {
      console.log('ErrorFetchSettingForNonAssign : ' + e)
    }
    isLoadSetting = true
  }

  _fetchSettingModifyIntervention = () => {
    try {
      const settingModifyIntervention = this.dataArray['4']
      if (settingModifyIntervention && Object.keys(settingModifyIntervention).length > 0 && settingModifyIntervention.hasOwnProperty('items')) {
        items = settingModifyIntervention['items'];
        if (items && Object.keys(items).length > 0) {
          if (items.hasOwnProperty('PREF_CAN_EDIT_CLIENT_ADRESSE')) {
            this.isAllowModifyClientAddress = items['PREF_CAN_EDIT_CLIENT_ADRESSE']['value'] !== '0';
          }
          if (items.hasOwnProperty('PREF_CAN_EDIT_USERS')) {
            this.isAllowModifySpeeker = items['PREF_CAN_EDIT_USERS']['value'] !== '0';
          }
          if (items.hasOwnProperty('PREF_DISPLAY_FIELD_TITLE')) {
            this.isAllowModifyTitle = items['PREF_DISPLAY_FIELD_TITLE']['value'] !== '0';
          }
          if (items.hasOwnProperty('PREF_CAN_EDIT_DATES')) {
            this.isAllowModifyDate = items['PREF_CAN_EDIT_DATES']['value'] !== '0';
          }
          if (items.hasOwnProperty('PREF_CAN_EDIT_HOURS')) {
            this.isAllowModifyTime = items['PREF_CAN_EDIT_HOURS']['value'] !== '0';
          }
        }
      }
    } catch (e) {
      // console.log('ErrorFetchSettingModifyIntervention : ' + e)
    }
  }

  computed
  get fontSize() {
    const item = this.Alllist.PREF_FONT_SIZE
    if (item) return parseInt(item.value || item.defaultValue, 10) || 12
    return 12
  }

  computed
  get mediaSize() {
    const item = this.Alllist.PREF_MEDIA_SIZE_MAX
    if (item) return parseInt((item.value || '').replace('px', ''), 10) || 0
    return 0
  }

  computed
  get takePhoto() {
    const item = this.Alllist.PREF_DISPLAY_BTN_TAKE_PHOTO || {}
    return !!(parseInt(item.value || 0, 10) || 0)
  }

  computed
  get getPhoto() {
    const item = this.Alllist.PREF_DISPLAY_BTN_SEARCH_PHOTO || {}
    return !!(parseInt(item.value || 0, 10) || 0)
  }

  computed
  get takeSignature() {
    const item = this.Alllist.PREF_DISPLAY_BTN_TAKE_SIGNATURE || {}
    return !!(parseInt(item.value || 0, 10) || 0)
  }

  computed
  get enableHourStart() {
    const item = this.Alllist.PREF_HOUR_START_ENABLE || {}
    return parseInt(item.value, 10) === 1 || false
  }

  computed
  get enableHourEnd() {
    const item = this.Alllist.PREF_HOUR_END_ENABLE || {}
    return parseInt(item.value, 10) === 1 || false
  }

  computed
  get hourStart() {
    const item = this.Alllist.PREF_HOUR_START || {}
    return item.value || '09:00'
  }

  computed
  get hourEnd() {
    const item = this.Alllist.PREF_HOUR_END || {}
    return item.value || '18:00'
  }

  computed
  get length() {
    return Object.keys(this.list).length
  }

  computed
  get dataArray() {
    const list = this.list
    const listKey = list.sortKey()
    return listKey.map(key => list[key])
  }
}

export default new Setting()
