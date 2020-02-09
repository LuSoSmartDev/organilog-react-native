import { observable, computed } from 'mobx'
import moment from 'moment'
import SettingMobx from './setting'

class Intervention {
  limit = 100
  page = observable(1)
  list = observable({})
  listByDate = observable({})
  listUnFinishByDate = observable({})
  listNonAssign = observable({})
  waiting = observable(false)
  currentDate = observable(moment().format('YYYY-MM-DD'))
  prevLastTimeFinishJob = 0
  lastTimeFinishJob = 0
  totalDataNew = 0
  // references
  listReferences = observable({})
  needReloadDataReference = observable(true)
  productSelected = observable()

  setListNonAssign({ byDate }) {
    this.listNonAssign = byDate
    //console.log('NonAssinged'+Object.keys(this.listNonAssign))
  }

  setListUnFinish({ byDate }) {
    this.listUnFinishByDate = byDate
  }

  setList({ byId, byDate }, isRefresh = false) {
    this.list = byId
    this.listByDate = byDate
    this._prepareLastTimeFinishJob(isRefresh)
    // this.setListReferences(this.list, true)
  }

  setListReferences(interventions, isRegroup) {
    if (isRegroup) {
      interventions.reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {}).then(rs => {
        this.listReferences = rs
        this.needReloadDataReference = false
      })
    } else {
      this.listReferences = interventions
      this.needReloadDataReference = false
    }
  }

  _prepareLastTimeFinishJob = (isRefresh = false, defaultVal = 0) => {
    if (this.listByDate && Object.keys(this.listByDate).length > 0) {
      listInterventions = [];
      Object.keys(this.listByDate).forEach(key => {
        if (key == moment(this.currentDate).format('YYYY-MM-DD')) {
          listInterventions = this.listByDate[key];
          return;
        }
      })
      if (!!listInterventions) {
        if (isRefresh) {
          this.lastTimeFinishJob = defaultVal;
        }
        keys = Object.keys(listInterventions);
        keys.map(key => {
          item = listInterventions[key]
          if (item['isDone'] === 1) {
            dCurrent = this._getTimestamp(item['doneHourEnd']);
            if (dCurrent && !isNaN(dCurrent) && dCurrent > this.lastTimeFinishJob) {
              this.lastTimeFinishJob = dCurrent;
            }
          }
        })
      }
    }
    if (this.lastTimeFinishJob == 0) {
      this.lastTimeFinishJob = this._getTimestamp(this._fetchSetting());
    }
    return;
  }

  _fetchSetting = () => {
    const settingIntervention = SettingMobx.dataArray['5']
    if (settingIntervention && Object.keys(settingIntervention).length > 0 && settingIntervention.hasOwnProperty('items')) {
      items = settingIntervention['items'];
      if (items && Object.keys(items).length > 0) {
        if (items.hasOwnProperty('PREF_HOUR_START')) {
          return items['PREF_HOUR_START']['value'];
        }
      }
    }
    return '00:00'
  }

  _getTimestamp = (hours) => {
    if (hours) {
      arrTime = hours.split(':');
      if (arrTime.length == 2) {
        return parseInt(arrTime[0]) * 60 + parseInt(arrTime[1])
      }
    }
    return 0;
  }

  getIntervention(id) {
    return this.list[id]
  }

  insertIntervention(item) { }

  editInterventtion(item) { }

  deleteIntervention({ id, byDate }) {
    // const byDate = moment(addDate, 'X').format('YYYY-MM-DD')
    // const byDate = addDate
    // console.log('ByData : ' + byDate)
    const list = { ...this.list }
    const listByDate = { ...this.listByDate }
    delete list[id]
    delete listByDate[byDate][id]
    this.list = { ...list }
    this.listByDate = { ...listByDate }
  }

  deleteOldIntervention({ id, byDate }) {
    // const byDate = moment(addDate, 'X').format('YYYY-MM-DD')
    // console.log('ByData : ' + byDate)
    const list = { ...this.list }
    const listByDate = { ...this.listUnFinishByDate }
    delete list[id]
    delete listByDate[byDate][id]
    this.list = { ...list }
    this.listUnFinishByDate = { ...listByDate }
  }

  deleteNonAssignIntervention({ id, byDate }) {
    const listByDate = { ...this.listNonAssign }

    delete listByDate[byDate][id]
    this.listNonAssign = { ...listByDate }
  }

  assign(intervention, isSuccess = true) {
    // Alert.alert('intervention' + JSON.stringify(intervention))
    const item = intervention;
    //intervention1.forEach(item => {
    let byDate = moment(item.addDate, 'X').format('YYYY-MM-DD')
    // alert(byDate)
    if (item.isDone == 1) {
      if (item.doneDateEnd) {
        byDate = moment(item.doneDateEnd, 'X').format('YYYY-MM-DD')
      } else if (item.doneDateStart) {
        byDate = moment(item.doneDateStart, 'X').format('YYYY-MM-DD')
      }
    } else {
      if (item.planningDateStart) {
        byDate = moment(item.planningDateStart, 'X').format('YYYY-MM-DD')
      }
    }
    if (isSuccess) {
      console.log(moment(this.currentDate).format('YYYY-MM-DD'));
      if (moment(byDate).isBefore(moment(this.currentDate).format('YYYY-MM-DD'), 'day')) {
        const listByDate = { ...this.listUnFinishByDate }
        listByDate[byDate] = listByDate[byDate] || {}
        listByDate[byDate][item.id] = { ...item }
        this.listUnFinishByDate = { ...listByDate }
      } else {
        const listByDate = { ...this.listByDate }
        listByDate[byDate] = listByDate[byDate] || {}
        listByDate[byDate][item.id] = { ...item }
        this.listByDate = { ...listByDate }
      }
    }
    // add to current list 
    const list = { ...this.list }
    list[item.id] = { ...item }
    this.list = { ...list }
    // remove from non-assign list
    const id = item.id;
    this.deleteNonAssignIntervention({ id, byDate })
    // const listByDate = { ...this.listNonAssign }
    // delete listByDate[byDate][item.id]
    // this.listNonAssign = { ...listByDate }
    //})
  }

  onAddNew(intervention) {
    intervention.forEach(item => {
      const byDate = moment(item.addDate, 'X').format('YYYY-MM-DD')
      const list = { ...this.list }
      const listByDate = { ...this.listByDate }
      list[item.id] = { ...item }
      listByDate[byDate] = listByDate[byDate] || {}
      listByDate[byDate][item.id] = { ...item }
      this.list = { ...list }
      this.listByDate = { ...listByDate }
    })
  }

  onUpdate(intervention) {
    const byDate = moment(intervention.addDate, 'x').format('YYYY-MM-DD')
    const list = { ...this.list }
    const listByDate = { ...this.listByDate }
    list[intervention.id] = { ...list[intervention.id], ...intervention }
    listByDate[byDate] = listByDate[byDate] || {}
    listByDate[byDate][intervention.id] = {
      ...listByDate[byDate][intervention.id],
      ...intervention,
    }
    this.list = { ...list }
    this.listByDate = { ...listByDate }
  }

  setCountDataNew(totalDataNew) {
    if (SettingMobx.isNotifyNewIntervention) {
      this.totalDataNew = totalDataNew;
    } else {
      this.totalDataNew = 0;
    }
  }

  clearSelectedProduct() {
    this.productSelected = observable()
  }

  computed
  get loadMore() {
    return this.length > this.page * this.limit
  }

  computed
  get length() {
    return Object.keys(this.list).length
  }

  computed
  get dataArray() {
    list = [];
    Object.keys(this.listByDate).forEach(key => {
      if (key == moment(this.currentDate).format('YYYY-MM-DD')) {
        list = this.listByDate[key];
        return;
      }
    })
    if (!list) return []
    const page = this.page || 1
    const listKey = list.sortKey()
    return listKey.slice(0, page * this.limit).map(key => list[key])
  }

  computed
  get dataArrayUnFinish() {
    list = [];
    Object.keys(this.listUnFinishByDate).forEach(key => {
      if (moment(key).isBefore(moment(this.currentDate).format('YYYY-MM-DD'), 'day')) {
        listWillAdd = this.listUnFinishByDate[key];
        if (!!listWillAdd) {
          keys = Object.keys(listWillAdd);
          keys.map(keyAdding => {
            list[keyAdding] = listWillAdd[keyAdding]
          })
        }
      }
    })
    if (!list) return []
    const page = this.page || 1
    const listKey = list.sortKey()
    return listKey.slice(0, page * this.limit).map(key => list[key])
  }

  computed
  get dataArrayNonAssign() {
    const { isShowOldIntervention } = SettingMobx
    list = [];
    if (isShowOldIntervention) {
      console.log('isShowOldIntervention')
      Object.keys(this.listNonAssign).forEach(key => {

        if (moment(key).isSameOrBefore(moment(this.currentDate).format('YYYY-MM-DD'), 'day')) {
          listWillAdd = this.listNonAssign[key];
          if (!!listWillAdd) {
            keys = Object.keys(listWillAdd);
            keys.map(keyAdding => {
              list[keyAdding] = listWillAdd[keyAdding]
            })
          }
        }
      })
    } else {
      console.log('isShowOldIntervention' + JSON.stringify(this.listNonAssign))
      Object.keys(this.listNonAssign).forEach(key => {

        if (key == moment(this.currentDate).format('YYYY-MM-DD')) {
          list = this.listNonAssign[key];
          return;
        }
      })
    }
    if (!list) return []
    const page = this.page || 1
    const listKey = list.sortKey()
    return listKey.slice(0, page * this.limit).map(key => list[key])
  }
}


export default new Intervention()
