import moment from 'moment'
/** Define limit function for limition string**/

Object.defineProperty(String.prototype, 'limit', {
  value(length, postFix = '...') {
    if (this.length < length) return this.toString()
    return `${this.substr(0, length)}${postFix}`
  },
})

Object.defineProperty(String.prototype, 'toDateSeen', {
  value() {
    const current = moment(this.toString(), 'YYYY-MM-DD HH:mm:ss')
    return current.calendar()
  },
})

Object.defineProperty(String.prototype, 'toDateDuration', {
  value() {
    const duration = parseInt(this.toString(), 10)
    const hours = Math.trunc(duration / 3600)
    const minutes = Math.trunc(duration % 3600 / 60)
    const seconds = duration - hours * 3600 - minutes * 60

    return [
      hours > 9 ? `${hours}` : `0${hours}`,
      minutes > 9 ? `${minutes}` : `0${minutes}`,
      seconds > 9 ? `${seconds}` : `0${seconds}`,
    ]
  },
})

Object.defineProperty(String.prototype, 'toDateDurationWithoutSecond', {
  value() {
    const duration = parseInt(this.toString(), 10)
    const hours = Math.trunc(duration / 3600)
    const minutes = Math.trunc(duration % 3600 / 60)
    const seconds = duration - (hours * 3600) - (minutes * 60)

    return [
      hours > 9 ? `${hours}` : `0${hours}`,
      minutes > 9 ? `${minutes}` : `0${minutes}`,
    ].join(':')
  },
})

Object.defineProperty(Object.prototype, 'sortKey', {
  value() {
    return Object.keys(this).sort((a, b) => {
      if (+a > +b) return -1
      if (+a < +b) return 1
      return 0
    })
  },
})
