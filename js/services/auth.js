import Storage from 'react-native-storage'

class Auth {
  cache = new Storage()

  check() {
    return this.cache.load({
      key: 'user',
    })
  }

  save(user) {
    this.cache.save({
      key: 'user',
      rawData: user,
    })
  }

  remove() {
    return this.cache.remove({
      key: 'user',
    })
  }
}

export default new Auth()
