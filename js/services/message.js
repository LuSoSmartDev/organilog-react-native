import uuid from 'uuid'
import realm from './table'
import { mapField, mapServerField } from './table/message'

class MessageServices {
  list

  constructor() {
    this.realm = realm
  }

  isRead(message) {
    if (message.isRead === 0) {
      const histories = message.histories
      const data = { isToSync: 1, editDate: new Date(), isRead: 1 }

      if (this.realm) {
        this.realm.write(() => {
          this.realm.create('Messages', { id: message.id, ...data }, true)
        })

        if (histories && histories.length > 0) {
          histories.forEach(history => {
            this.realm.write(() => {
              this.realm.create('Messages', { id: history.id, ...data }, true)
            })
          })
        }
      }
    }
  }

  drop(accountId) {
    const Messages = this.realm
      .objects('Messages')
      .filtered(
      `fkUserServerIdFrom = ${accountId} OR fkUserServerIdTo = ${accountId}`
      )
    this.realm.write(() => {
      this.realm.delete(Messages)
    })
  }

  fetch(accountId) {
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'FetchMessage - Require account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'FetchMessage - Ream not connectted' })
      } else {
        const localUsers = this.realm
          .objects('Users')
          .reduce((obj, item) => ({ ...obj, [item.id]: item }), {})

        const AllMessages = this.realm
          .objects('Messages')
          .filtered(
          `(fkUserServerIdFrom = ${accountId} OR fkUserServerIdTo = ${accountId}) AND isDelete = 0`
          )
        const Messages = AllMessages.reduce((obj, item) => {
          const data = obj
          const message = item
          message.from = localUsers[message.fkUserAppliIdFrom]
          data[message.id] = message
          // if (message.fkMessagerieAppliId === 0) {
          //   data[message.id] = message
          // } else if (data[message.fkMessagerieAppliId]) {
          //   data[message.fkMessagerieAppliId].histories = data[message.fkMessagerieAppliId].histories || []
          //   data[message.fkMessagerieAppliId].histories.push(message)
          // }
          return data
        }, {})

        resolve(Messages)
      }
    })
  }

  insert(message) {
    const localUsers = this.realm
      .objects('Users')
      .reduce((obj, item) => ({ ...obj, [item.id]: item }), {})

    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'MessageInsert - Real not connected' })
      } else if (!message || message.length === 0) {
        reject({ success: false, message: 'MessageInsert - Message null' })
      } else {
        try {
          this.realm.write(() => {
            const data = { ...message }
            data.id = uuid.v4()
            data.addDate = new Date()
            data.isActif = 1
            // data.fkMessagerieAppliId = uuid.v4();
            const newMessage = this.realm.create('Messages', data)
            newMessage.from = localUsers[newMessage.fkUserAppliIdFrom]
            resolve(newMessage)
          })
        } catch (e) {
          // console.log('ErrorInsertMessage : ' + e)
          reject(e.toString())
        }
      }
    })
  }

  getSyncFromLocal(accountId) {
    return this.realm
      .objects('Messages')
      .filtered(
      `(fkUserServerIdFrom = ${accountId} OR fkUserServerIdTo = ${accountId}) AND isToSync = 1`
      )
      .map(item =>
      // Object.keys(item).reduce(
      //   (obj, key) => ({ ...obj, [mapServerField[key]]: item[key] }),
      //   {}
      // )
      {
        keys = Object.keys(item);
        objSync = {};
        for (var i = 0; i < keys.length; i++) {
          if (item[keys[i]]) {
            if (mapServerField[keys[i]]) {
              objSync[mapServerField[keys[i]]] = item[keys[i]];
            }
          }
        }
        return objSync;
      })
  }

  syncFromLocal(messages, accountId) {
    if (!messages || messages.length === 0)
      return Promise.resolve({ message: 'No data' })
    return Promise.all(
      messages.map(
        ({ appli_id: appliId, server_id: serverId, ERROR: error }) => {
          if (error) throw new Error(error)
          const childOfMessage = this.realm
            .objects('Messages')
            .filtered(`fkMessagerieAppliId = "${appliId}"`)
          childOfMessage.forEach(message => {
            try {
              this.realm.write(() => {
                this.realm.create('Messages', {
                  id: message.id,
                  fkMessagerieServerId: serverId,
                  accountId: parseInt(accountId, 10),
                })
              })
            } catch (err) {
              // console.log('ErrorSyncMessageFromLocal : ' + err)
            }
          })

          this.realm.write(() => {
            return this.realm.create(
              'Messages',
              {
                isToSync: 0,
                id: parseInt(appliId, 10),
                serverId: parseInt(serverId, 10),
                synchronizationDate: new Date(),
              },
              true
            )
          })
        }
      )
    )
  }

  removeNeedSync(messages, accountId) {
    if (!accountId || accountId.length === 0) return Promise.resolve({ message: 'RemoveSyncedMessage - Require account' })
    if (!messages || messages.length === 0) return Promise.resolve({ message: 'RemoveSyncedMessage - No data' })
    return Promise.all(
      messages.map(
        ({ id, serverId, fkMessagerieAppliId, isToSync }) => {
          // if (error) throw new Error(error)
          this.realm.write(() => {
            try {
              const data = {
                id,
                isToSync,
                serverId,
                accountId: parseInt(accountId, 10),
                synchronizationDate: new Date(),
              }
              return this.realm.create('Messages', data, true)
            } catch (e) {
              // console.log('ErrorRemoveSyncedMessage : ' + e)
            }
          })
          // const childOfMessage = this.realm
          //   .objects('Messages')
          //   .filtered(`fkMessagerieAppliId = "${appliId}"`)
          // childOfMessage.forEach(message => {
          //   try {
          //     this.realm.write(() => {
          //       this.realm.create('Messages', {
          //         id: message.id,
          //         fkMessagerieServerId: serverId,
          //         accountId: parseInt(accountId, 10),
          //       })
          //     })
          //   } catch (err) {
          //     console.log(err)
          //   }
          // })

          // this.realm.write(() => {
          //   return this.realm.create(
          //     'Messages',
          //     {
          //       isToSync: 0,
          //       id: parseInt(appliId, 10),
          //       serverId: parseInt(serverId, 10),
          //       synchronizationDate: new Date(),
          //     },
          //     true
          //   )
          // })
        }
      )
    )
  }

  syncFromServer(Messages, accountId) {
    if (!Messages || Messages.length === 0)
      return Promise.reject({ success: false, message: 'SyncMessageFromServer - No message need sync' })
    // console.log('SyncMessageFromServer ('+Messages.length+')')
    const localMessages = this.realm
      .objects('Messages')
      .filtered(
      `fkUserServerIdFrom = ${accountId} OR fkUserServerIdTo = ${accountId}`
      )
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

    const localUsers = this.realm
      .objects('Users')
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})

    return Promise.all(
      Messages.map(item => {
        const message = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})

        const currentMessages = localMessages[message.serverId]

        return new Promise((resolve, reject) => {
          try {
            if (!currentMessages) {
              const fkUserAppliIdTo = (localUsers[message.fkUserServerIdTo] ||
                {}).id
              const fkUserAppliIdFrom = (localUsers[
                message.fkUserServerIdFrom
              ] || {}).id
              const fkMessagerieAppliId = (localMessages[
                message.fkMessagerieServerId
              ] || {}).id

              message.id = uuid.v4()
              message.accountId = parseInt(accountId, 10)
              message.fkMessagerieAppliId = fkMessagerieAppliId || ""
              message.fkUserAppliIdFrom = fkUserAppliIdFrom || ""
              message.fkUserAppliIdTo = fkUserAppliIdTo || ""
              message.synchronizationDate = new Date();
              ((obj) => {
                try {
                  obj.addDate = new Date(obj.addDate * 1000);
                  if (isNaN(obj.addDate.getTime())) {
                    obj.addDate = new Date()
                  }
                }
                catch (e) {
                  obj.addDate = new Date()
                }
              })(message);
              this.realm.write(() => {
                this.realm.create('Messages', message)
              })
            } else if (
              !!message.synchronizationDate &&
              currentMessages.synchronizationDate !==
              message.synchronizationDate
            ) {
              ((obj) => {
                try {
                  obj.addDate = new Date(obj.addDate * 1000);
                  if (isNaN(obj.addDate.getTime())) {
                    obj.addDate = new Date()
                  }
                }
                catch (e) {
                  obj.addDate = new Date()
                }
              })(message);
              this.realm.write(() => {
                this.realm.create(
                  'Messages',
                  { ...message, ...currentMessages },
                  true
                )
              })
            }
            resolve(true)
          } catch (e) {
            // console.log('ErrorSyncMessageFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }
}

export default new MessageServices()
