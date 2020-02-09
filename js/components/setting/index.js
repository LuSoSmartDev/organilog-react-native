import React, { Component } from 'react'
import { Image, TouchableOpacity } from 'react-native'
import { observer } from 'mobx-react'
import {
  Container,
  Header,
  Left,
  Content,
  ListItem,
  List,
  Text,
  Body,
  Right,
  Button,
} from 'native-base'
import I18n from 'react-native-i18n'
import CheckBox from 'react-native-check-box'
import { Actions } from 'react-native-router-flux'
import IconBack from '../../themes/IconBack'

import { componentStyles } from '../../styles'
import styles from './styles'
import SettingMbox from '../../mobxs/setting'

const organilogIcon = require('../../../images/organilog-logo-color.png')
const unCheckedImage = require('../../../images/btn_check_off.png')
const checkedImage = require('../../../images/btn_check_on_holo_light.png')

observer
class Settings extends Component {
  constructor(props) {
    super(props)
    this.renderItem = this.renderItem.bind(this)
    this.renderCategory = this.renderCategory.bind(this)
    this.renderItemHeader = this.renderItemHeader.bind(this)
  }

  renderItemHeader(header) {
    const { name } = header
    return (
      <ListItem style={styles.itemHeader}>
        <TouchableOpacity
          onPress={() => Actions.settingDetail({ id: 1 })}
          style={{ flex: 1 }}
        >
          <Text style={styles.itemHeaderTitle}>
            {I18n.t(name)}
          </Text>
        </TouchableOpacity>
      </ListItem>
    )
  }

  renderCheckbox(value) {
    return (
      <CheckBox
        onClick={() => { }}
        isChecked={!!value}
        checkedImage={<Image source={checkedImage} />}
        unCheckedImage={<Image source={unCheckedImage} />}
      />
    )
  }

  renderItem(item, index) {
    const { name, description, type } = item
    const value = item.value || item.default // eslint-disable-line

    return [
      <ListItem key={index} style={styles.item}>
        <Body>
          {
            <Text style={styles.itemTitle}>
              {I18n.t(name).toUpperCase()}
            </Text>
          }
          <Text style={styles.itemCaption}>
            {description}
          </Text>
        </Body>
        <Right>
          {!!type && eval(`this.render${type}(value)`) // eslint-disable-line
          }
        </Right>
      </ListItem>,
    ]
  }

  renderItems(items) {
    return (
      <List style={styles.list}>
        {Object.keys(items).map((key, index) =>
          this.renderItem(items[key], index)
        )}
      </List>
    )
  }

  renderCategory(category, index) {
    // eslint-disable-line class-methods-use-this
    const { name } = category
    console.log('Category : ' + name +" : "+ index)
    if ('SUPPORT' == name || 'UNDEFINED' == name) {
      return
    }
    return (
      <ListItem key={index} style={styles.cateHeader}>
        <TouchableOpacity
          onPress={() => Actions.settingDetail({ category })}
          style={{ flex: 1 }}
        >
          <Text style={styles.cateHeaderTitle}>
            {I18n.t(name)}
          </Text>
        </TouchableOpacity>
      </ListItem>
    )
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => Actions.pop()} style={componentStyles.backbutton} >
              <IconBack />
              <Image source={organilogIcon} style={styles.organilogIcon} />
            </Button>
            <Text style={styles.title}>
              {I18n.t('SETTINGS')}
            </Text>
          </Left>
        </Header>
        <Content>
          {SettingMbox.dataArray.map(this.renderCategory)}
        </Content>
      </Container>
    )
  }
}

Settings.propTypes = {}

Settings.defaultProps = {}

export default Settings
