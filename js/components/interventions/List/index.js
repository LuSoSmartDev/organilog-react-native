import React, { Component, PropTypes } from 'react'
import { DeviceEventEmitter, Text, Image, TouchableOpacity, Alert } from 'react-native'
import { ListItem, List, Left } from 'native-base'
import { observer } from 'mobx-react/native'
import I18n from 'react-native-i18n'
import { Actions } from 'react-native-router-flux'
import InterventionMobx from '../../../mobxs/intervention'
import SettingMbox from '../../../mobxs/setting'
import styles from './styles'
// import IconButton from '../../../../images/btn-arrow.png';
// import ImageResource from '../../../ImageResource';
// import IconCompleted from '../../../../images/btn_check_on_intervention.png'
// import IconProgress from '../../../../images/btn_check_progress_intervention.png'
// import IconUnCompleted from '../../../../images/btn_check_off_intervention.png'
import ServiceSync from '../../../services/sync'
import services from '../../../services/intervention'
import UserMobx from '../../../mobxs/user'

import utils from '../utils'
import moment from 'moment'
// import BackgroundTask from 'react-native-background-task'
// // const IS_DONE_ARRAY = [IconUnCompleted, IconCompleted, IconProgress]
// const ITV_Created = require('./../../../../images/btn_check_off_intervention.png');
// const ITV_Progress = require('./../../../../images/btn_check_progress_intervention.png');
// const ITV_Done = require('./../../../../images/btn_check_on_intervention.png');
const IS_DONE_ARRAY = [
  require('./../../../../images/btn_check_off_intervention.png'),
  require('./../../../../images/btn_check_on_intervention.png'),
  require('./../../../../images/btn_check_progress_intervention.png')
]

// BackgroundTask.define(() => {
//   console.log('FetchDataFromBackground')
//   const { currentUser } = UserMobx
//   ServiceSync.fetch(currentUser.u_id, currentUser.u_fk_account_id)
//   DeviceEventEmitter.emit('refresh')
//   BackgroundTask.finish()
// })

observer
class ListIntervention extends Component {
  constructor(props) {
    super(props)
    this.state = {
      latitude: 0,
      longitude: 0,
      isRefresh: false,
      lastTimeFinishJob: 0,
      isNotAssign: this.props.isNotAssign,
    }
    this.setIsDone = this.setIsDone.bind(this)
    this.renderItem = this.renderItem.bind(this)
    this.count = 0
  }

  componentWillMount() {

  }

  componentDidMount() {
    // BackgroundTask.schedule()
    DeviceEventEmitter.addListener('reloadList', this._refresh)
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        })
      },
      error => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    )
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('reloadList', this._refresh);
  }

  _refresh = async () => {

    const { currentUser } = UserMobx
    services.fetchUnFinish(currentUser.u_id).then(rs => {
      //console.log('list after fetch : '+ JSON.stringify(rs))
      InterventionMobx.setListUnFinish(rs);
      if (SettingMbox.isHandleNonAssignIntervention) {
        services.fetchNonAssign(currentUser.u_id).then(rs => { // TODO handle non-assign
          InterventionMobx.setListNonAssign(rs);
          services.fetch(currentUser.u_id).then(rs => {
            InterventionMobx.setList(rs, true)
            DeviceEventEmitter.emit('refresh')
          })
        })
      } else {
        services.fetch(currentUser.u_id).then(rs => {

          InterventionMobx.setList(rs, true)
          DeviceEventEmitter.emit('refresh')
        })
      }
    })
  }

  getCurrentStatus = (prevStatus, isEnableProgressStatus = true) => {
    // console.log('isEnableProgressStatus : ' + isEnableProgressStatus + '---' + prevStatus)
    if (prevStatus === 0) {
      return isEnableProgressStatus ? 2 : 1;
    } else if (prevStatus === 1) {
      return 0
    } else if (prevStatus === 2) {
      return 1
    }
  }

  setIsDone(ID, IS_DONE, isEnableProgressStatus = true) {
    IS_DONE = this.getCurrentStatus(IS_DONE, isEnableProgressStatus);
    if (IS_DONE === 0) {
      Alert.alert(I18n.t('UNCHECK'), I18n.t('UNCHECK_NOTIFICATION'), [
        { text: I18n.t('CANCEL'), onPress: () => { } },
        {
          text: I18n.t('YES'),
          onPress: () => {
            services
              .toggleDone(ID, IS_DONE)
              .then(res => {

                InterventionMobx.onUpdate(res)
                DeviceEventEmitter.emit('refresh')
              })
          },
        },
      ])
    }
    else {
      let newData;
      if (SettingMbox.isEnableGPS) {
        newData = {
          ...ID,
          doneLongitude: String(this.state.longitude),
          doneLatittude: String(this.state.latitude),
        }
      } else {
        newData = ID;
      }
      services
        .toggleDone(newData, IS_DONE, InterventionMobx.lastTimeFinishJob)
        .then(res => {
          InterventionMobx.lastTimeFinishJob = InterventionMobx._getTimestamp(res.doneHourEnd)
          InterventionMobx.onUpdate(res)
          // this._refresh()
          DeviceEventEmitter.emit('refresh')

        })
    }
  }

  renderItem(intervention, index) {
    const { isNotAssign } = this.state;
    const {
      priority,
      nom,
      isDone,
      client,
    } = intervention
    const {
      isShowOldIntervention,
      isDisplayTitle,
      isDisplayPiority,
      isDisplayCustomer,
      isDisplayAddress,
      isEnableProgressStatus,
    } = SettingMbox
    statusDisplay = isDone
    if (!isEnableProgressStatus && isDone == 2) {
      statusDisplay = 0;
    }
    const priorityText = utils.getPriorityText(intervention)
    const fullAddress = utils.getFullAddress(intervention)
    const time = utils.getTime(intervention)

    return (
      <ListItem
        key={index}
        style={styles.item}
        onPress={() => {
          // console.log('ViewDetail : ' + JSON.stringify(intervention))
          // console.log('NonAssign : ' + isNotAssign)
          // console.log('DataIsNonAssign : ' + intervention.fkUserServerlId +", "+ intervention.fkUserServerlId)
          Actions.interventionDetail({
            intervention, isNotAssign
          })
        }
        }
      >
        <Left style={styles.left}>
          {!!isDisplayPiority &&
            <Text style={[styles.priority, styles[`priority${priority}`]]}>
              {priorityText}
            </Text>}
          {!!isDisplayTitle &&
            <Text style={styles.title}>
              {nom}
            </Text>}
          {!!(isDisplayCustomer && client && client.title) &&
            <Text style={styles.name}>
              {client.title}
            </Text>}
          {!!(isDisplayAddress && fullAddress) &&
            <Text style={styles.address}>
              {fullAddress}
            </Text>}
          {time !== '-' &&
            <Text style={styles.time}>
              {time}
            </Text>}
        </Left>
        {
          !isNotAssign && <TouchableOpacity
            onPress={() => this.setIsDone(intervention, isDone, isEnableProgressStatus)}
            style={styles.btn}
          >
            <Image style={styles.btnIcon} source={IS_DONE_ARRAY[statusDisplay]} />
          </TouchableOpacity>
        }
      </ListItem>
    )
  }

  render() {
    const { isShowOldIntervention } = SettingMbox
    const { isNotAssign } = this.state
    // console.log('count of unfinish data array ' + InterventionMobx.dataArrayUnFinish.length);
    // console.log('count of data array ' + InterventionMobx.dataArray.length);
    return (
      <List style={styles.list}>
        {isNotAssign && InterventionMobx.dataArrayNonAssign.map(this.renderItem)}
        {(!isNotAssign && !!isShowOldIntervention) && InterventionMobx.dataArrayUnFinish.map(this.renderItem)}
        {!isNotAssign && InterventionMobx.dataArray.map(this.renderItem)}

      </List>
    )
  }
}

ListIntervention.propTypes = {
  refresh: PropTypes.func,
}

ListIntervention.defaultProps = {
  refresh: () => { },
}

export default ListIntervention
