'use strict';
import React, { Component } from 'react'
import { ActivityIndicator, AppState, DeviceEventEmitter, NetInfo, Alert } from 'react-native'
import {
  Container,
  Header,
  Button,
  Icon,
  Left,
  Right,
  Content,
  Footer,
  Text,
} from 'native-base'
import I18n from 'react-native-i18n'
import { Actions } from 'react-native-router-flux'
import { observer } from 'mobx-react/native'

import BarTop from './BarTop'

import { componentStyles } from '../../styles'
import styles from './styles'
import Interventions from '../interventions/List'
import Sync from '../../services/sync'
import SyncMobx from '../../mobxs/sync'
import UserMobx from '../../mobxs/user'
import DrawerMobx from '../../mobxs/drawer'
import InterventionMobx from '../../mobxs/intervention'

observer
class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isConnected: false,
      isSyncing: SyncMobx.isSyncing(),
      selectedDate: new Date(),
      isRefreshData: false
    }
    InterventionMobx.currentDate = this.state.selectedDate;
    this.onSync = this.onSync.bind(this)
    this.syncFinish = this.syncFinish.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onOpenDrawer = this.onOpenDrawer.bind(this)
    this.onConnectivityChange = this.onConnectivityChange.bind(this)
    NetInfo.isConnected
      .fetch()
      .then(isConnected => this.setState({ isConnected }))
    NetInfo.isConnected.addEventListener('change', this.onConnectivityChange)
  }

  componentDidMount() {
    DeviceEventEmitter.addListener('refresh', this._refreshData)
    // if (!SyncMobx.isFetchInit) {
    //   const currentUser = { UserMobx }
    //   Sync.fetch(currentUser.u_id, currentUser.u_fk_account_id)
    //   SyncMobx.fetchedInitData(true)
    // }
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('refresh', this._refreshData);

  }

  _startSync = () => {
    this.setState({ isSyncing: true })
  }
  _refreshData = () => {
    if (this.state.isSyncing) {
      this.setState({ isRefreshData: true })
      setTimeout(() => {
        this.setState({
          isSyncing: false
        })
      }, 500)
    } else {
      this.setState({ isRefreshData: true })
      setTimeout(() => {
        this.setState({
          isSyncing: false
        })
      }, 100)

    }
  }

  onConnectivityChange(isConnected) {
    if (isConnected !== this.state.isConnected) {
      this.setState({ isConnected })
    }
  }

  onChange(currentDate) {
    InterventionMobx.currentDate = currentDate.format('YYYY-MM-DD')
    this.setState({
      selectedDate: new Date()
    });
  }

  onOpenDrawer() {
    Actions.drawerOpen()
    // DrawerMobx.onOpen()
  }

  syncFinish() {
    setTimeout(() => {
      this.setState({
        isSyncing: false
      })
    }, 500);
  }

  onSync() {
    if (this.state.isConnected) {
      const { currentUser } = UserMobx
      if (currentUser && currentUser.u_id) {
        this.setState({
          isSyncing: true
        })
        Sync.syncFromServer(currentUser.u_id, 2).then(this.syncFinish)
      }
    } else {
      Alert.alert(I18n.t('NO_NETWORK'), I18n.t('NO_NETWORK_NOTIFICATION'), [
        { text: 'OK' },
      ])
    }
  }

  renderIconSync() {
    //console.log('Syncing : ' + this.state.isSyncing)
    return (
      <Button transparent onPress={this.onSync}>
        {this.state.isSyncing && <ActivityIndicator color="#FFFFFF" style={styles.sync} />}
        {!this.state.isSyncing && <Icon style={styles.rightIcon} name="md-sync" />}
      </Button>
    )
  }

  render() {
    //console.log('ContentAssigned')
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={this.onOpenDrawer}>
              <Icon
                style={styles.leftIcon}
                active
                ios="ios-menu"
                android="md-menu"
              />
            </Button>
            <Text style={styles.title}>
              {I18n.t('INTERVENTIONS')}
            </Text>
          </Left>
          <Right>
            {this.renderIconSync()}
          </Right>
        </Header>
        <BarTop selectedDate={this.state.selectedDate} onChange={this.onChange} />
        <Content>
          <Interventions isNotAssign={false} />
        </Content>
        <Footer style={styles.footer}>
          <Button
            full
            style={styles.btnAdd}
            onPress={() => Actions.createIntervention()}
          >
            <Text style={styles.btnAddText}>
              {I18n.t('ADD_AN_INTERVENTION')}
            </Text>
          </Button>
        </Footer>
      </Container>
    )
  }
}

export default Home
