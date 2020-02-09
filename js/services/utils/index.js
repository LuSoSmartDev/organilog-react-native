import * as transforms from './transform'

export function mapObjectFactory({ mapField, mapFieldTransform } = {}) {
  return function mapOpject(item) {
    return Object.keys(item).reduce((obj, key) => {
      if (!item[key] || !mapField[key]) return obj
      const transform = mapFieldTransform && mapFieldTransform[mapField[key]]
      let value = item[key]
      if (transform) {
        value = transform(value)
      }
      return { ...obj, [mapField[key]]: value }
    }, {})
  }
}

export { transforms }
