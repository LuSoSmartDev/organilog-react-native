import uuid from 'uuid'
import moment from 'moment'
import realm from './table'
import { mapField, mapFieldSearch, mapFieldTransform } from './table/products'

import { mapObjectFactory } from './utils'

class ProductService {

  constructor() {
    this.realm = realm
  }

  drop(accountId) {
    const productItem = this.realm
      .objects('Products')
      .filtered(
      `accountId = ${accountId}`
      )
    this.realm.write(() => {
      this.realm.delete(productItem)
    })
  }

  fetch(accountId) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'FetchProducts - Ream is not connect' })
      } else {
        const products = this.realm.objects('Products')
        resolve(products.reduce((obj, item) => ({ ...obj, [item.id]: item }), {}))
      }
    })
  }

  syncFromServer(products, accountId) {
    console.log('SyncProductsFromServer (' + products.length + ')')
    if (!products || products.length === 0)
      return Promise.reject({ success: false, message: 'SyncProductsFromServer - No product need sync' })
    console.log('SyncProductsFromServer (' + products.length + ')')
    const localProducts = this.realm
      .objects('Products')
      // .filtered(`accountId = ${accountId} AND serverId != 0`)
      .filtered(`serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
    const mapObject = mapObjectFactory({ mapFieldSearch, mapFieldTransform })
    return Promise.all(
      products.map(item => {
        // console.log('ItemProduct : ' + JSON.stringify(item))
        // const productItem = mapObject(item)
        // console.log('ItemProductMatched : ' + JSON.stringify(productItem))
        const productItem = item
        try {
          productItem.editDate = new Date(productItem.editDate);
          if (isNaN(productItem.editDate.getTime())) {
            productItem.editDate = new Date();
          }
        }
        catch (e) {
          productItem.editDate = new Date();
        }
        // productItem.serverId = productItem.pro_id
        // productItem.codeId = productItem.pro_code_id
        productItem.serverId = parseInt(productItem.pro_id, 10)
        productItem.codeId = parseInt(productItem.pro_code_id, 10)
        productItem.nom = productItem.pro_nom
        productItem.code = productItem.pro_code
        // productItem.codeComptable = productItem.pro_code_id
        productItem.codeComptable = parseInt(productItem.pro_code_id, 10)
        productItem.price = productItem.pro_sell_pu_ht
        productItem.priceTax = productItem.pro_sell_pu_ttc
        productItem.tax = productItem.pro_sell_tx_tax
        productItem.comment = productItem.pro_comment
        const currentProduct = localProducts[productItem.pro_id]
        return new Promise((resolve, reject) => {
          try {
            if (!currentProduct) {
              productItem.id = uuid.v4()
              // categoryTrackingItem.accountId = parseInt(accountId, 10)
              // unite.isActif = parseInt(unite.isActif, 10)
              this.realm.write(() => {
                this.realm.create('Products', productItem)
              })
            } 
            // else if (
            //   !!productItem.synchronizationDate &&
            //   currentProduct.synchronizationDate !== productItem.synchronizationDate
            // ) 
            else {
              this.realm.write(() => {
                resolve(
                  this.realm.create('Products', { ...productItem, ...currentProduct }, true),
                  true
                )
              })
            }
            resolve(true)
          } catch (e) {
            console.log('ErrorSyncProductsFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }
}

export default new ProductService()
