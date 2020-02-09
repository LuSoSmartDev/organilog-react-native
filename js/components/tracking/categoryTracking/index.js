import React, { Component } from 'react'
import { Text, Image, FlatList, TouchableOpacity,DeviceEventEmitter } from 'react-native'
import {
  Container, Header,
  Item, Icon, Input,
  Left, Content, Button, Spinner
} from 'native-base'
import I18n from 'react-native-i18n'
import { Actions } from 'react-native-router-flux'
import { observer } from 'mobx-react/native'
import IconBack from '../../../themes/IconBack'

import { componentStyles } from '../../../styles'
import styles from './styles'
import { RippleView as ListItem } from '../../../themes/RippleView'

import TrackingService from '../../../services/tracking'

import CategoryTrackingMobx from '../../../mobxs/category'

import SettingMobx from '../../../mobxs/setting'

const organilogIcon = require('../../../../images/organilog-logo-color.png')

observer
class CategoryList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pageIndex: 1,
      valSearching: '',
      dataCategoryFiltered: [],
      isLoading: false,
    }
    // this.renderItem = this.renderItem.bind(this)
    // this.onLoadMore = this.onLoadMore.bind(this)
  }

  withFontSize(style, percent = 1) {
    const fontSize = SettingMobx.fontSize * percent
    return { ...style, fontSize }
  }

  setTracking(category){
    data = {}
    data.tr_type = 'custom'
    data.tr_item_id = category.serverId.toString()
   
    TrackingService.insert(data).then((ret)=>{
               Actions.pop();
               setTimeout(()=>DeviceEventEmitter.emit('reloadbarcodelist'),50)
        }).catch((e)=> console.log(e))

  }
  renderItem(category, index) {
    const { id, code, title } = category
    // alert(JSON.stringify(category))
    return (
      <ListItem
        key={index}
        style={styles.item}
        onPress={() => this.setTracking(category)}
      >
        <Text style={this.withFontSize(styles.itemText)}>
          {(title || '').limit(60)}
        </Text>
      </ListItem>
    )
  }

  render() {
    //const filterClient = this.filterClient.bind(this)
    //alert(JSON.stringify(CategoryTrackingMobx.list))
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => Actions.pop()}>
              <IconBack />
              <Image source={organilogIcon} style={styles.organilogIcon} />
            </Button>
            <Text style={styles.title}>
              {I18n.t('TRACKING')}
            </Text>
          </Left>
        </Header>
        <Content>

          {Object.keys(CategoryTrackingMobx.list).map((item,index)=>this.renderItem(CategoryTrackingMobx.list[item],index))}
{/*           
          {this.state.valSearching != '' &&
            <FlatList
              data={this.state.dataCategoryFiltered}
              keyExtractor={(item, index) => item.id}
              renderItem={({ item }) =>
                <TouchableOpacity style={styles.item} onPress={() => Actions.clientDetail({ client: item })}>
                  <Text style={this.withFontSize(styles.itemText)}>
                    {`${item.code ? `#${item.code} ` : ''}`} {(item.title || '').limit(60)}
                  </Text>
                </TouchableOpacity>
              }
            />
          }  */}
         
        </Content>
      </Container>
    )
  }
}


export default CategoryList
