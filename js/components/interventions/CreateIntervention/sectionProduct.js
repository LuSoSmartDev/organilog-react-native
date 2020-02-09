import React, { Component } from 'react'
import { FlatList, View, TouchableOpacity, Platform, TextInput } from 'react-native'
import { Text, Label, Icon } from 'native-base'
import I18n from 'react-native-i18n'
import styles from './styles'

class SectionProduct extends Component {
  static propTypes = {
    dataProducts: React.PropTypes.array,
    searchProducts: React.PropTypes.func,
    removeProduct: React.PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      dataProducts: props.dataProducts,
      product: null,
      userId: props.userId,
      intUserName: props.intUserName,
    }
    // this.renderItemProduct = this.renderItemProduct.bind(this)
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {
    const { dataProducts } = this.state
    if (nextProps.dataProducts !== dataProducts) {
      this.setState({
        dataProducts: nextProps.dataProducts,
      })
    }
  }

  onClickSearchProducts() {
    this.props.searchProducts()
  }

  onClickRemoveProduct(proId) {
    this.props.removeProduct(proId)
  }

  componentWillUnmount() { }

  renderHeader(name) {
    return (
      <View style={styles.view_title}>
        <View style={styles.view_title_1}>
          <Label style={styles.text_title}>{I18n.t(name)}</Label>
        </View>
      </View>
    )
  }

  renderItemProduct(product, index) {
    console.log('RenderItemProduct : ' + JSON.stringify(product))
    // const nomProduct = product.nom
    if (product.hasOwnProperty('productName')) {
      product.nom = product.productName
    }
    if (product.hasOwnProperty('quantity')) {
      product.quantitySelected = product.quantity
    }
    return (
      <View key={index} style={styles.intervenatTab_view}>
        <View style={styles.containerItemProductSelected}>
          <Text style={styles.quantityProductSelected}>
            {product.quantitySelected}
          </Text>
          <Text style={styles.nomProductSelected}>
            {product.nom}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => this.onClickRemoveProduct(product.id)}
          style={styles.speaker_btn}
        >
          <Icon name="md-close-circle" style={styles.speaker_icon} />
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    const { dataProducts } = this.state
    console.log('RenderDataProduct : ' + JSON.stringify(dataProducts))
    return (
      <View>
        {this.renderHeader('PRODUCTS')}
        <TouchableOpacity onPress={() => this.onClickSearchProducts()}>
          <View style={styles.btn_view}>
            <Text style={styles.btn_text}>{I18n.t('SEARCH_PRODUCT')}</Text>
          </View>
        </TouchableOpacity>
        <FlatList
          style={{ marginTop: 10, marginBottom: 20 }}
          data={dataProducts}
          keyExtractor={(item, index) => item.id}
          renderItem={({ item }) => this.renderItemProduct(item, item.id)}
        />
      </View>
    )
  }
}

export default SectionProduct
