import React, { Component } from 'react'
import { DeviceEventEmitter, Image, Alert } from 'react-native'
import {
  Container,
  Header,
  Left,
  Content,
  ListItem,
  List,
  View,
  Text,
  Body,
  Button,
} from 'native-base'
import moment from 'moment'
import I18n from 'react-native-i18n'
import { observer } from 'mobx-react'
import CheckBox from 'react-native-check-box'
import { Actions } from 'react-native-router-flux'
import DateTimePicker from 'react-native-modal-datetime-picker'
import IconBack from '../../themes/IconBack'

import Modal from './Modal'

import { componentStyles } from '../../styles'
import styles from './styles'
import SettingMobx from '../../mobxs/setting'
import style from '../sideBar/style';
import Spinner from 'react-native-loading-spinner-overlay';

const organilogIcon = require('../../../images/organilog-logo-color.png')
const unCheckedImage = require('../../../images/btn_check_off.png')
const checkedImage = require('../../../images/btn_check_on_holo_light.png')

observer
class SettingDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      category: {},
      currentModal: '',
      modal: false,
      visible_setting_reload: false,
      dateTimePickerVisible: {
        itemKey: '',
        visible: false,
        
        current: '00:00',
        currentDate: new Date(),
      },
    }
    this.onValue = this.onValue.bind(this)
    this.renderItem = this.renderItem.bind(this)
    this.renderItemHeader = this.renderItemHeader.bind(this)
    this.onDatePicked = this.onDatePicked.bind(this)
    this.onHideDateTimePicker = this.onHideDateTimePicker.bind(this)
  }

  componentWillMount() {
    const { category } = this.props
    // console.log('GroupSetting : ' + JSON.stringify(category))
    this.setState({ category })
  }

  onDatePicked(date) {
    const currentDate = moment(date).clone()
    const { name } = this.state.category || {}
    const { itemKey } = this.state.dateTimePickerVisible || {}
    if (!!itemKey) {
      this.setValueItem(name, itemKey, currentDate.format('HH:mm'))
    }

    this.onHideDateTimePicker()
  }

  onHideDateTimePicker() {
    this.setState({ dateTimePickerVisible: { itemKey: '', visible: false } })
  }

  onValue(name) {
    const currentLocale = I18n.currentLocale()
    const value = I18n.t(name)
    if (value === `[missing "${currentLocale}.${name}" translation]`)
      return name
    return value
  }

  setValueItem(categoryKey, itemKey, value) {
    const { category } = this.state
    const currentItem = category.items[itemKey]
    category.items[itemKey] = { ...currentItem, value, openModal: false }
    this.setState({ category })

    SettingMobx.setValueItem(categoryKey, itemKey, value)
  }

  setVisiableItem(categoryKey, itemKey, { key = 'openModal', value }) {
    const { category } = this.state
    const currentItem = category.items[itemKey]
    category.items[itemKey] = { ...currentItem, [key]: value }
    this.setState({ category })
  }

  setDateTimePickerVisible(categoryKey, itemKey, current) {
    this.setState({
      dateTimePickerVisible: { categoryKey, itemKey, current, visible: true },
    })
  }
 

  renderItemHeader(header) {
    const { name } = header
    return (
      <ListItem style={styles.itemHeader}>
        <Text style={styles.itemHeaderTitle}>
          {this.onValue(name).toUpperCase()}
        </Text>
      </ListItem>
    )
  }

  renderCheckbox(categoryKey, item, index) {
    if ('PREF_DISPLAY_CHECKBOX_IS_DONE' == item.name
      || 'PREF_PREREMPLIR_PLANNING_DATE' == item.name
      || 'PREF_MULTIPLY_TASK_HOURS_WHEN_MULTIUSERS' == item.name
      || 'PREF_HOUR_PAUSE_ENABLE' == item.name
      || 'PREF_DISPLAY_BTN_HISTORIQUE' == item.name
      || 'PREF_HOUR_END_ENABLE' == item.name
    ) {
      return;
    }
    const { name, description } = item
    const value = item.value || item.defaultValue

    return (
      <ListItem
        key={index}
        style={styles.item}
      >
        <Body>
          {
            <Text style={styles.itemTitle}>
              {this.onValue(name)}
            </Text>
          }
          <Text style={styles.itemCaption}>
            {description}
          </Text>
        </Body>
        <CheckBox
          isChecked={value !== '0'}
          checkedImage={<Image source={checkedImage} />}
          unCheckedImage={<Image source={unCheckedImage} />}
          onClick={() =>
            this.setValueItem(categoryKey, name, value === '0' ? '1' : '0')}
        />
      </ListItem>
    )
  }

  renderList(categoryKey, item, index) {
    if ('PREF_DISPLAY_HOME_INTERVENTION_BTN_STATUS' == item.name) {
      return;
    }
    const { name, arrange, openModal, description } = item
    const value = item.value || item.defaultValue

    return (
      <ListItem
        key={index}
        style={styles.item}
        onPress={() =>
          this.setVisiableItem(categoryKey, name, { value: !openModal })}
      >
        <Body>
          {
            <Text style={styles.itemTitle}>
              {this.onValue(name)}
            </Text>
          }
          {!description &&
            <Text style={styles.itemCaption}>
              {I18n.t('CURRENT_VALUE')}: {value}
            </Text>}
          {!!description &&
            <Text style={styles.itemCaption}>
              {description}: {value}
            </Text>}
        </Body>
        <Modal
          value={value}
          dataSource={arrange}
          title={this.onValue(name)}
          visible={!!openModal}
          onPress={res => this.setValueItem(categoryKey, name, res)}
          onCancel={() =>
            this.setVisiableItem(categoryKey, name, { value: false })}
        />
      </ListItem>
    )
  }

  renderTime(categoryKey, item, index) {
    if ('PREF_HOUR_START_PAUSE' == item.name
      || 'PREF_HOUR_END_PAUSE' == item.name
      || 'PREF_HOUR_END' == item.name
    ) {
      return
    }
    const { name, description } = item
    const value = item.value || item.defaultValue

    return (
      <ListItem
        key={index}
        style={styles.item}
        onPress={() => this.setDateTimePickerVisible(categoryKey, name, value)}
      >
        <Body>
          {
            <Text style={styles.itemTitle}>
              {this.onValue(name)}
            </Text>
          }
          {!description &&
            <Text style={styles.itemCaption}>
              {I18n.t('CURRENT_VALUE')}: {value}
            </Text>}
          {!!description &&
            <Text style={styles.itemCaption}>
              {description}: {value}
            </Text>}
        </Body>
      </ListItem>
    )
  }

  renderText(categoryKey, item, index) {
    const { name, description } = item
    const value = item.value || item.defaultValue

    return (
      <ListItem
        key={index}
        style={styles.item}
        onPress={() => {
          Alert.alert(I18n.t('SYNCHRO_TITLE'), I18n.t('SYNCHRO_CAPTION'), [
            { text: I18n.t('SYNCHRO_CANCEL') },
            {
              text: I18n.t('SYNCHRO_RESET'),
              onPress: () => {
                SettingMobx.setValueItem(categoryKey, name, item.defaultValue)
              },
            },
          ])
        }}
      >
        <Body>
          {
            <Text style={styles.itemTitle}>
              {this.onValue(name)}
            </Text>
          }
          {!description &&
            <Text style={styles.itemCaption}>
              {I18n.t('CURRENT_VALUE')}: {value}
            </Text>}
          {!!description &&
            <Text style={styles.itemCaption}>
              {description}: {value}
            </Text>}
        </Body>
      </ListItem>
    )
  }

  renderItem(categoryKey, item, index) {
    switch (item.type) {
      case 'List':
        return this.renderList(categoryKey, item, index)
      case 'Text':
        return this.renderText(categoryKey, item, index)
      case 'Time':
        return this.renderTime(categoryKey, item, index)
      case 'Checkbox':
        return this.renderCheckbox(categoryKey, item, index)
      default:
        return null
    }
  }

  renderItems(categoryKey, items) {
    return (
      <List style={styles.list}>
        {Object.keys(items).map((key, index) =>
          this.renderItem(categoryKey, items[key], index)
        )}
      </List>
    )
  }
  
  render() {
    const { name, items } = this.state.category || {}
    const { visible, current } = this.state.dateTimePickerVisible || {}
    const date = moment(current, 'HH:dd')
    const visible_setting_reload = this.state.visible_setting_reload
    const dateTimePicker = {
      mode: 'time',
      date: new Date(date),
      is24Hour: true,
      cancelTextIOS: I18n.t('DATETIMEPICKER_CANCEL'),
      confirmTextIOS: I18n.t('DATETIMEPICKER_CONFIRM'),
      titleIOS: I18n.t('DATETIMEPICKER_TITLE'),
    }
    // if (visible_setting_reload) {
    //   return (
    //     <View style={{ flex: 1 }}>
    //       <Spinner visible={visible_setting_reload} textContent={"Loading..."} textStyle={{color: '#FFF'}} />
    //     </View>
    //   );
    // }else{
      // alert(this.state.visible_setting_reload)
    return (
      
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => {
              this.setState({
                visible_setting_reload: true,
              })
              SettingMobx._fetchSetting()
              setTimeout(() => {
              Actions.pop()
              }, 200);
            }}>
              <IconBack />
              <Image source={organilogIcon} style={styles.organilogIcon} />
            </Button>
            <Text style={styles.title}>
              {I18n.t('SETTINGS')}
            </Text>
          </Left>
        </Header>
        <Content>
          {this.renderItemHeader({ name })}
          {this.renderItems(name, items)}
        </Content>
        <DateTimePicker
          {...dateTimePicker}
          isVisible={!!visible}
          onConfirm={this.onDatePicked}
          onCancel={this.onHideDateTimePicker}
        />
        <Spinner visible={visible_setting_reload} textContent={I18n.t('APPLY_SETTINGS')} textStyle={{color: '#FFF'}} />
      </Container>
      
    )}
  // }
}

SettingDetail.propTypes = {}

export default SettingDetail
