import { observable, computed } from 'mobx'

class Message {
  limit = 10
  page = observable(1)
  list = observable({})
  waiting = observable(false)

  async setList(messages) {
    this.list = messages
  }

  setPage(page) {
    this.page = page
    setTimeout(() => {
      this.waiting = false
    }, 500)
  }

  getMessage(id) {
    return this.list[id]
  }

  onAddNew(message) {
    const list = { ...this.list }
    this.list = {
      [message.id]: message,
      ...list,
    }
  }

  onReply(message) {
    const list = { ...this.list }
    const currentMessage = list[message.fkMessagerieAppliId]

    if (currentMessage) {
      currentMessage.histories = currentMessage.histories || []
      currentMessage.histories.push(message)
      list[message.fkMessagerieAppliId] = currentMessage
      this.list = { ...list }
    }
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
    const list = this.list
    const page = this.page || 1
    const listKey = list.sortKey()
    // console.log('ListMessage : ' + JSON.stringify(list))
    return listKey.slice(0, page * this.limit).map(key => list[key])
  }
}

export default new Message()
