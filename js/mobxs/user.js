import { observable, computed } from 'mobx'
// import remotedev from 'mobx-remotedev'

import Auth from '../services/auth'
import SyncService from '../services/sync'

class User {
  users = observable()
  currentUser = observable()
  // references
  listReferences = observable({})
  needReloadDataReference = observable(true)

  setUser(user, save = true) {
    user.id = user.u_uuid
    if (save) Auth.save(user)
    this.currentUser = user
    SyncService.fetchInit(user.u_id)
    // SyncService.fetch(user.u_id,user.u_fk_account_id)
    SyncService.syncFromServer(user.u_id)
  }

  setList(users) {
    const list = { ...users }
    const currentUser = { ...this.currentUser }
    const user = users[currentUser.u_id]
    this.currentUser = { ...currentUser, ...user }
    delete list[currentUser.u_id]
    this.users = list
    // this.setListReferences(this.users, true)
  }

  setListReferences(users, isRegroup) {
    if (isRegroup) {
      users.reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {}).then(rs => {
        this.listReferences = rs
        this.needReloadDataReference = false
      })
    } else {
      this.listReferences = users
      this.needReloadDataReference = false
    }
  }

  isNeedReloadDataReference() {
    return this.needReloadDataReference || Object.keys(this.listReferences).length == 0
  }

  onLogout() {
    this.users = null
    this.currentUser = null
    Auth.remove()
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
    const list = this.users
    const listKey = list.sortKey()
    return listKey.map(key => list[key])
  }

  computed
  get isLoggedIn() {
    return !!this.currentUser && !!this.currentUser.u_id
  }
}

export default new User()
