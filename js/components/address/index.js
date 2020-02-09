import React, { Component } from 'react'
import { Text, Image, FlatList, TouchableOpacity } from 'react-native'
import { Container, Header, Item, Icon, Input, Left, Content, Button, Spinner } from 'native-base'
import I18n from 'react-native-i18n'
import { Actions } from 'react-native-router-flux'
import { observer } from 'mobx-react/native'

import { componentStyles } from '../../styles'
import styles from './styles'
import { RippleView as ListItem } from '../../themes/RippleView'
import SettingMobx from '../../mobxs/setting'
import AddressMobx from '../../mobxs/address'
import IconBack from '../../themes/IconBack'

const organilogIcon = require('../../../images/organilog-logo-color.png')

observer
class Address extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pageIndex: 1,
      valSearching: '',
      dataAddressFiltered: [],
      isLoading: false,
    }
    this.renderItem = this.renderItem.bind(this)
    this.onLoadMore = this.onLoadMore.bind(this)
  }

  componentWillUnmount() {
    AddressMobx.setPage(1)
  }

  onLoadMore() {
    this.setState({
      isLoading: true
    })
    setTimeout(() => {
      const page = AddressMobx.page + 1
      AddressMobx.setPage(page)
      this.setState({
        pageIndex: page,
        isLoading: false
      })
    }, 500)
  }

  filterAddress(valSearch) {
    var valSearching = valSearch.toLowerCase();
    dataAddressFiltered = AddressMobx.filterAddress(valSearching)
    this.setState({
      valSearching: valSearch,
      dataAddressFiltered: dataAddressFiltered,
    })
  }

  clearSearching() {
    this.setState({
      valSearching: '',
      dataClientFiltered: []
    });
  }

  withFontSize(style, percent = 1) {
    const fontSize = SettingMobx.fontSize * percent
    return { ...style, fontSize }
  }

  renderItem(address, index) {
    const fontSize = SettingMobx.fontSize
    const { code, adresse, codePostal, ville } = address
    const title = `${code ? `#${code} ` : ''} ${adresse} ${codePostal} ${ville}`

    return (
      <ListItem
        key={index}
        style={styles.item}
        onPress={() => Actions.addressDetail({ address, fontSize })}
      >
        <Text style={this.withFontSize(styles.itemText)}>
          {title.limit(120)}
        </Text>
      </ListItem>
    )
  }

  render() {
    const filterAddress = this.filterAddress.bind(this)
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => Actions.pop()}>
              <IconBack />
              <Image source={organilogIcon} style={styles.organilogIcon} />
            </Button>
            <Text style={styles.title}>
              {I18n.t('ADDRESSES')}
            </Text>
          </Left>
        </Header>
        <Content>
          <Item rounded style={styles.searchBox}>
            <Icon name="ios-search" style={{ fontSize: 16 }} />
            <Input placeholder={I18n.t('FILTER_ADDRESS')} style={{ fontSize: 13 }} value={this.state.valSearching} onChangeText={(text) => filterAddress(text)} />
            {this.state.valSearching != '' ? <Icon name='ios-close-outline' onPress={this.clearSearching.bind(this)} /> : null}
          </Item>
          {this.state.valSearching == '' && AddressMobx.dataArray.map(this.renderItem)}
          {this.state.valSearching != '' &&
            <FlatList
              data={this.state.dataAddressFiltered}
              keyExtractor={(item, index) => item.id}
              renderItem={({ item }) =>
                <TouchableOpacity style={styles.item} onPress={() => Actions.addressDetail({ address: item, fontSize: SettingMobx.fontSize })}>
                  <Text style={this.withFontSize(styles.itemText)}>
                    {`${item.code ? `#${item.code} ` : ''} ${item.adresse} ${item.codePostal} ${item.ville}`.limit(120)}
                  </Text>
                </TouchableOpacity>
              }
            />
          }
          {!!(this.state.valSearching == '' && AddressMobx.loadMore) &&
            <Button full transparent onPress={this.onLoadMore}>
              {this.state.isLoading && <Spinner />}
              <Text>
                {I18n.t('LOAD_MORE')}
              </Text>
            </Button>}
        </Content>
      </Container>
    )
  }
}

Address.propTypes = {}

Address.defaultProps = {
  dataArray: [],
}

export default Address
