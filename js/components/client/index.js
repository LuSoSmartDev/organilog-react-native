import React, { Component } from 'react'
import { Text, Image, FlatList, TouchableOpacity } from 'react-native'
import {
  Container, Header,
  Item, Icon, Input,
  Left, Content, Button, Spinner
} from 'native-base'
import I18n from 'react-native-i18n'
import { Actions } from 'react-native-router-flux'
import { observer } from 'mobx-react/native'
import IconBack from '../../themes/IconBack'

import { componentStyles } from '../../styles'
import styles from './styles'
import { RippleView as ListItem } from '../../themes/RippleView'
import ClientMobx from '../../mobxs/client'
import SettingMobx from '../../mobxs/setting'

const organilogIcon = require('../../../images/organilog-logo-color.png')

observer
class Client extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pageIndex: 1,
      valSearching: '',
      dataClientFiltered: [],
      isLoading: false,
    }
    this.renderItem = this.renderItem.bind(this)
    this.onLoadMore = this.onLoadMore.bind(this)
  }

  componentWillUnmount() {
    ClientMobx.setPage(1)
  }

  onLoadMore() {
    this.setState({
      isLoading: true
    })
    setTimeout(() => {
      const page = ClientMobx.page + 1
      ClientMobx.setPage(page)
      this.setState({
        pageIndex: page, 
        isLoading: false
      })
    }, 500)
  }

  filterClient(valSearch) {
    //console.log('SearchClient : ' + valSearch);
    var valSearching = valSearch.toLowerCase();
    dataClientFiltered = ClientMobx.filterClient(valSearching)
    this.setState({
      valSearching: valSearch,
      dataClientFiltered: dataClientFiltered,
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

  renderItem(client, index) {
    const { id, code, title } = client

    return (
      <ListItem
        key={index}
        style={styles.item}
        onPress={() => Actions.clientDetail({ client })}
      >
        <Text style={this.withFontSize(styles.itemText)}>
          {`${code ? `#${code} ` : ''}`} {(title || '').limit(60)}
        </Text>
      </ListItem>
    )
  }

  render() {
    const filterClient = this.filterClient.bind(this)
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => Actions.pop()}>
              <IconBack />
              <Image source={organilogIcon} style={styles.organilogIcon} />
            </Button>
            <Text style={styles.title}>
              {I18n.t('CUSTOMERS')}
            </Text>
          </Left>
        </Header>
        <Content>
          <Item rounded style={styles.searchBox}>
            <Icon name="ios-search" style={{ fontSize: 16 }} />
            <Input placeholder={I18n.t('FILTER_CLIENT')} style={{ fontSize: 13 }} value={this.state.valSearching} onChangeText={(text) => filterClient(text)} />
            {this.state.valSearching != '' ? <Icon name='ios-close-outline' onPress={this.clearSearching.bind(this)} /> : null}
          </Item>
          {this.state.valSearching == '' && ClientMobx.dataArray.map(this.renderItem)}
          {this.state.valSearching != '' &&
            <FlatList
              data={this.state.dataClientFiltered}
              keyExtractor={(item, index) => item.id}
              renderItem={({ item }) =>
                <TouchableOpacity style={styles.item} onPress={() => Actions.clientDetail({ client: item })}>
                  <Text style={this.withFontSize(styles.itemText)}>
                    {`${item.code ? `#${item.code} ` : ''}`} {(item.title || '').limit(60)}
                  </Text>
                </TouchableOpacity>
              }
            />
          }
          {!!(this.state.valSearching == '' && ClientMobx.loadMore) &&
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

Client.propTypes = {}

Client.defaultProps = {
  dataArray: [],
}

export default Client
