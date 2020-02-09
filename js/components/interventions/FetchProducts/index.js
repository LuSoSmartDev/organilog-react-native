import React, { Component } from 'react'
import {
  Dimensions,
  DeviceEventEmitter,
  FlatList,
  Image,
  View,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  ListView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity
} from 'react-native'
import {
  Spinner,
} from 'native-base'
import I18n from 'react-native-i18n'
import { observer } from 'mobx-react/native'
import { observable } from 'mobx'
import moment from 'moment'
import SettingMobx from '../../../mobxs/setting'
import ServiceSync from '../../../services/sync'
import ServiceProduct from '../../../services/Products'
import MobxIntervention from '../../../mobxs/intervention'
import MobxProduct from '../../../mobxs/MobxProducts'

import { componentStyles, textStyles } from '../../../styles'
import styles from './styles'
const organilogIcon = require('../../../../images/organilog-logo-color.png')

import { Actions, ActionConst } from 'react-native-router-flux'
import { Container, Header, Left, Button, Text, Label, Right, Toast } from 'native-base'

import IconBack from '../../../themes/IconBack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })

const w = Dimensions.get('window').width
const h = Dimensions.get('window').height

observer
class FetchProducts extends Component {
  constructor(props) {
    super(props)
    this.state = {
      listProducts: [],
      prevNomToSearchProduct: '',
      quantityProductSelected: '',
      productSelected: null,
      isFetchingData: false,
      isSearched: false
    }
    this._keyboardDidHide = this._keyboardDidHide.bind(this)
  }

  componentWillMount() {
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide)
  }

  componentDidMount() {
    this._fetchAllProduct()
  }

  componentWillUnmount() {
    this.keyboardDidHideListener.remove()
  }

  _keyboardDidHide() {
  }

  _fetchAllProduct = () => {
    // from network
    this.setState({
      isFetchingData: true
    })
    ServiceSync.fetchAllProductFromServer().then(results => {
      ServiceProduct.fetch().then(rs => {
        MobxProduct.setList(rs)
        this.setState({
          isFetchingData: false
        })
        console.log('AllProduct : ' + JSON.stringify(MobxProduct.listProducts))
      })
      // MobxProduct.setList(results)
      // this.setState({
      //   isFetchingData: false
      // })
      // console.log('AllProduct : ' + JSON.stringify(MobxProduct.listProducts))
    })
  }

  _fetchProduct = (nom) => {
    // from network
    this.setState({
      isFetchingData: true
    })
    var valSearching = nom.toLowerCase();
    if (valSearching) {
      dataProductFiltered = MobxProduct.filterProduct(valSearching)
      this.setState({
        prevNomToSearchProduct: nom,
        isSearched: true,
        isFetchingData: false,
        listProducts: dataProductFiltered,
      })
    } else {
      this.setState({
        prevNomToSearchProduct: nom,
        isSearched: true,
        isFetchingData: false,
        listProducts: [],
      })
    }
  }

  selectedProduct(product) {
    product.isSelected = true
    MobxIntervention.selectedProduct = product
    const { listProducts } = this.state
    const arr = listProducts.slice()
    arr.forEach((item, index) => {
      if (item.id == product.id) {
        item.isSelected = true
      } else {
        item.isSelected = false
      }
    })
    this.setState({
      listProducts: arr,
    })
  }

  _addProduct = (quantity) => {
    // const { productSelected } = this.state
    if (MobxIntervention.selectedProduct) {
      MobxIntervention.selectedProduct.quantitySelected = quantity
      DeviceEventEmitter.emit('reloadListProduct')
      Actions.pop()
    } else {
      alert('Please select product first!')
    }
  }

  renderBody() {
    // const scrollView = {
    //   style: styles.scrollview,
    //   contentContainerStyle: styles.scrollview,
    // }
    const { listProducts, isFetchingData, isSearched } = this.state
    if (!listProducts) return null
    console.log('ListProductDisplay : ' + JSON.stringify(listProducts))
    return (
      <View style={styles.containerProductFetched}>
        {(listProducts && Object.keys(listProducts).length > 0)
          && <View style={styles.containerProductFetchedDisplayUI}>
            <FlatList
              style={{ marginBottom: 20 }}
              showsVerticalScrollIndicator={true}
              data={listProducts}
              keyExtractor={(item, index) => item.id}
              renderItem={({ item }) =>
                <TouchableOpacity key={item.id} style={styles.listItemHeader} onPress={() => this.selectedProduct(item)}>
                  {this.renderItemProduct(item, item.id)}
                </TouchableOpacity>
              }
            />
          </View>}
        {(isSearched && (!listProducts || Object.keys(listProducts).length == 0))
          && <Text style={styles.resultSearchNotFound}>{I18n.t('SEARCH_NOT_FOUND')}</Text>}
        {isFetchingData && <Spinner />}
      </View>
    )
  }

  renderItemProduct(product, index) {

    console.log('RenderItemProduct : ' + JSON.stringify(product))
    return (
      <View key={index} style={product.isSelected ? styles.productSelected : styles.productNormal} >
        <Text style={{
          fontSize: 18,
          color: 'black',
          marginLeft: 5,
          marginTop: 5,
        }}>
          {product.nom}
        </Text>

      </View>
    )
  }

  renderHeaderMain() {
    return (
      <Header style={styles.header}>
        <Left style={componentStyles.headerLeft}>
          <Button transparent onPress={() => Actions.pop()}>
            <IconBack />
            <Image source={organilogIcon} style={styles.organilogIcon} />
          </Button>
          <Text style={styles.title}>{I18n.t('NEW_INTERVENTION')}</Text>
        </Left>
      </Header>
    )
  }
  renderInputTextSearch() {
    return (
      <View style={{ width: w - 30, marginLeft: 15, marginTop: 5 }}>
        <Text style={{ fontSize: 14, marginTop: 5 }}>
          {I18n.t('SEARCH_PRODUCT')}
        </Text>
        <TextInput
          style={styles.inputTextSearch}
          value={this.state.prevNomToSearchProduct}
          placeholder=""
          keyboardType='default'
          onChangeText={text => this._fetchProduct(text)}
        // underlineColorAndroid='transparent'
        />
      </View>
    )
  }
  renderInputTextQuantity() {
    return (
      <View style={{ width: w - 30, marginLeft: 15, marginTop: 5 }}>
        <Text style={{ fontSize: 14, marginTop: 5 }}>
          {I18n.t('QUANTITY')}
        </Text>
        <TextInput
          // placeholder="Name of product"
          // autoCorrect
          // placeholderTextColor="black"
          style={styles.inputTextSearch}
          value={this.state.quantityProductSelected}
          placeholder=""
          keyboardType='numeric'
          onChangeText={text => this.setState({
            quantityProductSelected: text
          })}
        // underlineColorAndroid='transparent'
        />
      </View>
    )
  }
  render() {
    return (
      <Container style={styles.container} collapsable={false}>
        <KeyboardAwareScrollView >
          {this.renderHeaderMain()}
          {this.renderInputTextSearch()}
          <Button
            onPress={() => this._fetchProduct(this.state.prevNomToSearchProduct)}
            style={styles.btn_Add}
            block
          >
            <Text>{I18n.t('SEARCH')}</Text>
          </Button>
          {this.renderBody()}
          {this.renderInputTextQuantity()}
          <Button
            onPress={() => this._addProduct(this.state.quantityProductSelected)}
            style={styles.btn_Add}
            block
          >
            <Text>{I18n.t('ADD_PRODUCT_INTERVENTION')}</Text>
          </Button>
        </KeyboardAwareScrollView>

      </Container>

    )
  }
}

export default FetchProducts
