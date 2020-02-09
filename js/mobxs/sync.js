import { observable } from 'mobx'
import Setting from './setting'

class Sync {
  isSync = observable(false)
  isAutoSync = observable(false)
  isFetchInit = observable(false)
  isOnBackground = observable(true)

  start() {
    this.isSync = true
  }

  finish() {
    this.isSync = false
  }

  isSyncing() {
    return this.isSync;
  }

  isFetchedInitData() {
    return this.isFetchInit
  }

  appIsOnBackground() {
    return this.isOnBackground
  }

  getLastSync() {
    return Setting.getLastSync();
  }

  enableAutoSync() {
    this.isAutoSync = true
  }

  disableAutoSync() {
    this.isAutoSync = false
  }

  fetchedInitData(isFetchedInit) {
    this.isFetchInit = isFetchedInit
  }
}

export default new Sync()
