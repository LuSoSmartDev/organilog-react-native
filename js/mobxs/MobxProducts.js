import { observable, computed } from 'mobx'

class Products {
  list = observable({})
  waiting = observable(false)
  listProducts = []

  setList(products) {
    this.list = products
    this.prepareDataFilter(products);
  }

  async prepareDataFilter(products) {
    this.listProducts = [];
    const listKey = products.sortKey();
    index = 0;
    return listKey.map(key => {
      this.listProducts[index] = products[key];
      index ++;
    })
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
    return listKey.slice(0, page * this.limit).map(key => list[key])
  }

  filterProduct(valSearching) {
    return this.listProducts.filter((product) => product.nom.toLowerCase().includes(valSearching))
  }
}

export default new Products()
