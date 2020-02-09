import React, { Component } from 'react'
import { Dimensions ,DeviceEventEmitter, Image, TouchableOpacity } from 'react-native'
import { Container, Content, Text, View ,Icon} from 'native-base'
import { Actions, ActionConst } from 'react-native-router-flux'
import I18n from 'react-native-i18n'
import { observer } from 'mobx-react/native'

import { gridStyles } from '../../styles'
import styles from './style'
import UserMobx from '../../mobxs/user'
import InterventionMobx from '../../mobxs/intervention'
import DrawerMobx from '../../mobxs/drawer'
import SettingData from '../../mobxs/setting';

const bgHeader = require('../../../images/bgHeader.jpg')
import TimerMixin from 'react-timer-mixin';
import IconBadge from 'react-native-icon-badge';
import settingService from '../../services/setting'
import Icon1 from 'react-native-vector-icons/MaterialIcons'
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons'
const listItemMenu = [
  { icon: 'md-clipboard', name: 'INTERVENTIONS', action: 'home' },
  { icon: 'assignment-returned', name: 'INTERVENTIONS_NOT_ASSIGN', action: 'nonAssignIntervention' },
  { icon: 'md-chatbubbles', name: 'MESSAGES', action: 'message' },
  { icon: 'md-person', name: 'CUSTOMERS', action: 'client' },
  { icon: 'md-information-circle', name: 'ADDRESSES', action: 'address' },
  { icon: 'barcode-scan', name: 'TRACKING', action: 'tracking'},
  //history 
  // { icon: 'history', name: 'HISTORY', action: 'listHist'},
  //setting 
  { icon: 'md-settings', name: 'SETTINGS', action: 'setting' },
  { icon: 'md-help-circle', name: 'ABOUT', action: 'about' },
  { icon: 'md-log-out', name: 'LOGOUT', logout: true },
]

observer
class SideBar extends Component {
  static propTypes = {
    navigateTo: React.PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      isRefreshData: false,
      BadgeCount: 0
    }
    this.onItemPress = this.onItemPress.bind(this)
  }

  componentDidMount() {
    DeviceEventEmitter.addListener('refresh', this._refresh)
    // DeviceEventEmitter.addListener('refresh', this._refreshData)
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('refresh', this._refresh);
  }
  _refresh = () => {
    //console.log('SettingData.isHandleNonAssignIntervention : ' + SettingData.isHandleNonAssignIntervention)
    this.setState({
      isRefreshData: true,
      BadgeCount: InterventionMobx.dataArrayNonAssign.length,
    });
  }

  onItemPress({ action, logout }) {
    DrawerMobx.onClose()
    if (action) {
      Actions[action]()
    } else if (logout) {
      // if (SettingData.isHandleNonAssignIntervention) {
      //   settingService.updateLastSync(SettingData.accountId,'0')
      // }
      UserMobx.onLogout()
      Actions.login({ type: ActionConst.RESET })
    }
  }

  navigateTo(route) {
    this.props.navigateTo(route, 'home')
  }

  renderHeader() {
    const user = UserMobx.currentUser || {}
    const subDomain = user.subDomain
    const name = [user.u_prenom, user.u_nom].join(' ')

    return (
      <View style={styles.header}>
        <View style={[styles.cover_image]}>
          <Image source={bgHeader} style={[gridStyles.fullWidth, gridStyles.fullHeight]} resizeMode="cover" />
        </View>
        <Text style={styles.text_header}>
          {subDomain}
        </Text>
        <Text style={styles.text_subname}>
          {name}
        </Text>
      </View>
    )
  }

  renderItemMenu() {
    // alert(UserMobx.currentUser.u_rang)
    const isSupperUser =  UserMobx.currentUser.u_rang !== '12'
    return listItemMenu.map(item => {
      if (item.name == 'INTERVENTIONS_NOT_ASSIGN' ) {
        if(!SettingData.isHandleNonAssignIntervention)
          return <View key={item.name} />
        else{
          return <TouchableOpacity key={item.name} onPress={() => this.onItemPress(item)}>
            <View style={styles.item_row2 }>
              <Icon1 name={item.icon} style={styles.item_icon1} /> 
              <Text style={styles.item_name_menu}>
                {I18n.t(item.name)}
              </Text>
              <IconBadge 
                BadgeElement={
                  <Text style={{ color: '#FFFFFF' }}>{this.state.BadgeCount}</Text>
                }
                IconBadgeStyle={styles.item_badge_count}
                Hidden={this.state.BadgeCount == 0}
              />
            </View>
          </TouchableOpacity>
        }
      }else if(item.name == 'CUSTOMERS' || item.name == 'ADDRESSES'){
          
          if(isSupperUser || SettingData.isActiveClientAdresse){
            //  alert('isActiveClientAdresse '+SettingData.isActiveClientAdresse)
            return <TouchableOpacity key={item.name} onPress={() => this.onItemPress(item)}>
              <View style={styles.item_row}>
                <Icon name={item.icon} style={styles.item_icon} /> 
                <Text style={styles.item_name_menu}>
                  {I18n.t(item.name)}
                </Text>
              </View>
            </TouchableOpacity>
          }
      } else if(item.name == 'HISTORY'){
        return <TouchableOpacity key={item.name} onPress={() => this.onItemPress(item)}>
              <View style={styles.item_row}>
                <Icon1 name={item.icon} style={styles.item_icon} /> 
                <Text style={styles.item_name_menu}>
                  {I18n.t(item.name)}
                </Text>
              </View>
            </TouchableOpacity>
      } else {
        return <TouchableOpacity key={item.name} onPress={() => this.onItemPress(item)}>
          <View style={styles.item_row}>
            {(item.name == 'TRACKING' ) && <Icon2 name={item.icon} style={styles.item_icon1} />}
            {(item.name != 'TRACKING') && <Icon name={item.icon} style={styles.item_icon} /> }
            <Text style={styles.item_name_menu}>
              {I18n.t(item.name)}
            </Text>
          </View>

        </TouchableOpacity>
      }
    })
  }

  render() {
    return (
      <Container>
        {this.renderHeader()}
        <Content style={styles.sidebar}>
          {this.renderItemMenu()}
        </Content>
      </Container>
    )
  }
}

export default SideBar
