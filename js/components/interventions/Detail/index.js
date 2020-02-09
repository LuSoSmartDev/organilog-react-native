import React, { Component, PropTypes } from 'react'
import {
  DeviceEventEmitter,
  View,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  NetInfo,
  Platform
} from 'react-native'
import {
  Container,
  Header,
  Left,
  Icon,
  Right,
  Content,
  Button,
  Tab,
  Tabs,
  Toast,
} from 'native-base'
import I18n from 'react-native-i18n'
import { observer } from 'mobx-react/native'
import { observable } from 'mobx'
import moment from 'moment'
import ImagePicker from 'react-native-image-picker'
import { Actions } from 'react-native-router-flux'
import SignatureCapture from 'react-native-signature-capture'
import { phonecall, email as emailCall } from 'react-native-communications'
import Switch from '../../../themes/Switch'
import TabHeader from './TabHeader'
import SettingMobx from '../../../mobxs/setting'
import InterventionMobx from '../../../mobxs/intervention'
import InterventionService from '../../../services/intervention'
import UserMobx from '../../../mobxs/user'
import Sync from '../../../services/sync'
import SyncMobx from '../../../mobxs/sync'
import SeTask from '../../../services/task'
import SeTaskLink from '../../../services/linkInterventionTask'
import SVLinkUnite from '../../../services/uniteLink'
import SeMedia from '../../../services/media'
import SeMediaLink from '../../../services/mediaLink'
import { mapFieldDetail as mapClient } from '../../../services/table/client'
import { mapFieldDetail as mapAddress } from '../../../services/table/address'
import MediaDetailModal from './Modal'
import Timer from './Timer'
import TimeUtills from '../../../utils/TimeUtils'
import AppLinking from '../../../utils/AppLinking'
import StringUtils from '../../../utils/StringUtils'
import { componentStyles } from '../../../styles'
import styles from './styles'

import utils from '../utils'
import { callApi } from '../../../services/api';
import auth from '../../../services/auth';
import intervention from '../../../services/table/intervention';
import sync from '../../../services/sync';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'



const organilogIcon = require('../../../../images/organilog-logo-color.png')

// import { Object } from 'realm';

observer
class Detail extends Component {
  intervention = observable({})

  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      isConnected: false,
      intervention: this.props.intervention,
      isRefreshData: false,
      taskNameIncompleted: '',
      taskNameCompleted:'',
      isSyncData: SyncMobx.isSyncing(),
      isNotAssign: this.props.isNotAssign,
      isLoading: (this.props.intervention && !this.props.intervention.isLoadListUserAdded),
      isDone: false,
    }
    // console.log('DetailIntervention, NotAssign : ' + this.state.isNotAssign)
    // console.log('DetailIntervention : ' + this.state.intervention.serverId + ", " + this.state.intervention.fkUserServerlId)
    this.onSync = this.onSync.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onEditMedia = this.onEditMedia.bind(this)
    this.onDeleteMedia = this.onDeleteMedia.bind(this)
    this.onValueChange = this.onValueChange.bind(this)
    this.onMediaDetail = this.onMediaDetail.bind(this)
    this.onShowMessage = this.onShowMessage.bind(this)
    this.onSaveSignature = this.onSaveSignature.bind(this)
    this.onPhotoFromCameraOrLibrary = this.onPhotoFromCameraOrLibrary.bind(this)
    this.keyPhone = ['PHONE_FIXE', 'PHONE_MOBILE', 'PHONE_PRO', 'EMAIL']
    this.newSignature = false;
    this.currentTab = 0;
    NetInfo.isConnected.fetch().then(isConnected => this.setState({ isConnected }))
    NetInfo.isConnected.addEventListener('change', this.onConnectivityChange)
    this.countLog = 0
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ intervention: nextProps.intervention })
  }

  componentWillMount() {
    this._fetchWorkers()
    const { id, serverId } = this.state.intervention
    this.fetchImages(id, serverId)
    InterventionService.isRead(id)
  }

  componentDidMount() {
    DeviceEventEmitter.addListener('refresh', this._refreshData)
    this._fetchTask()
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('refresh', this._refreshData);
  }

  _refreshData = () => {
    if (this.state && this.state.intervention) {
      const id = this.state.intervention.id;
      setTimeout(()=>this.setState({
        intervention: InterventionMobx.getIntervention(id),
        isSyncData: false,
        isLoading: this.state.intervention.isLoadListUserAdded
      }),200)
      
      this._fetchWorkers();
      this._fetchTask();
      console.log('this.state.intervention.id'+this.state.intervention.id)
      this.fetchImages(this.state.intervention.id, this.state.intervention.serverId)
      this.setState({
        isRefreshData: true
      })
    }
  }

  _fetchTask = () => {
    const tasks = this.state.intervention[`linkInterventionTasks`] || I18n.t('EMPTY2')
    
    if (I18n.t('EMPTY2') != tasks) {
      const actionNameIncompleted = '';
      const actionNameCompleted = '';
      Object.keys(tasks).map(key => {
        SeTask.fetchTaskById(tasks[key]['fkTaskAppliId']).then(itemTask => {
          Object.keys(itemTask).map(iKey => {
            // console.log('TaskFinded : ' + itemTask[iKey]['nom'] + ' ------ ' + tasks[key]['planningMinute'])
            if(tasks[key]['doneMinute'] > 0)
              actionNameCompleted += '\n-' + itemTask[iKey]['nom'] + ' (' + TimeUtills.getTimeJob(tasks[key]['doneMinute']) + ')'
            if(tasks[key].planningMinute != -1)
              actionNameIncompleted += '\n-' + itemTask[iKey]['nom'] + ' (' + TimeUtills.getTimeJob(tasks[key]['planningMinute']) + ')'
          })
        }).then(() => {
          this.setState({
            taskNameCompleted: actionNameCompleted,
            taskNameIncompleted:actionNameIncompleted
          })
        })
      })
    }
  }

  _fetchWorkers = () => {
    const { intervention } = this.state
    if (intervention && !intervention.isLoadListUserAdded) {
      // console.log('GetListUserAdded >>> Start')
      // InterventionService.getListUserAddedOfIntervention(intervention, intervention.accountId).then(res => {
      //   intervention.listUserAdded = res
      //   intervention.isLoadListUserAdded = true
      //   InterventionMobx.onUpdate(intervention)
      //   this.setState({
      //     intervention,
      //     isLoading: false
      //   })
      // })
      intervention.listUserAdded = InterventionService.getListUserAddedOfIntervention(intervention, intervention.accountId)
      intervention.isLoadListUserAdded = true
      InterventionMobx.onUpdate(intervention)
      this.setState({
        intervention,
        isLoading: false
      })
    }
  }

  withFontSize(style, percent = 1) {
    const fontSize = SettingMobx.fontSize * percent
    return { ...style, fontSize }
  }

  onShowMessage(text) {
    return Toast.show({
      text,
      duration: 3000,
      position: 'bottom',
      supportedOrientations: ['Potrait', 'Landscape'],
    })
  }

  onEditMedia({ id, comment, legend }) {
    const data = { id }
    if (legend) data.legend = legend
    if (comment) data.comment = comment
    this.onMediaChangeProgress(data)
  }

  onDeleteMedia({ id }) {
    this.onMediaChangeProgress({ id, isActif: 0 })
  }

  onDelete() {
    const { id } = this.state.intervention
    let byDate = moment(this.state.intervention.addDate, 'X').format('YYYY-MM-DD')
    if (this.state.intervention.isDone == 1) {
      if (this.state.intervention.doneDateEnd) {
        byDate = moment(this.state.intervention.doneDateEnd, 'X').format('YYYY-MM-DD')
      } else if (this.state.intervention.doneDateStart) {
        byDate = moment(this.state.intervention.doneDateStart, 'X').format('YYYY-MM-DD')
      }
    } else {
      if (this.state.intervention.planningDateStart) {
        byDate = moment(this.state.intervention.planningDateStart, 'X').format('YYYY-MM-DD')
      }
    }
    // console.log('ID : ' + id + "---" + byDate)
    Alert.alert(I18n.t('DELETE'), I18n.t('DELETEMEDIA_NOTIFICATION'), [
      { text: I18n.t('CANCEL'), onPress: () => { } },
      {
        text: I18n.t('YES'),
        onPress: () => {
          InterventionService.onEdit({ id, isActif: 0 })
            .then(() => {
              if (moment(byDate).isBefore(moment(InterventionMobx.currentDate).format('YYYY-MM-DD'), 'day')) {
                InterventionMobx.deleteOldIntervention({ id, byDate })
              } else {
                InterventionMobx.deleteIntervention({ id, byDate })
              }
              DeviceEventEmitter.emit('reloadList')
              // DeviceEventEmitter.emit('refresh')
              Actions.pop()
            })
            .catch(this.onShowMessage)
        },
      },
    ])
  }

  onSync() {
    if (this.state.isConnected) {
      const { currentUser } = UserMobx
      if (currentUser && currentUser.u_id) {
        this.setState({
          isSyncData: true
        })
        Sync.syncFromServer(currentUser.u_id, 2)
      }
    } else {
      Alert.alert(I18n.t('NO_NETWORK'), I18n.t('NO_NETWORK_NOTIFICATION'), [{ text: 'OK' }])
    }
  }

  onMediaChangeProgress(media) {
    SeMedia.onEdit(media)
      .then(() => {
        this.fetchImages()
        this.onMediaDetailClose()
      })
      .catch(this.onShowMessage)
  }

  onValueChange(toDone) {
    const isDone = toDone ? 1 : 2
    const isChange = this.state.intervention.isDone === 1
    if (isChange === toDone) return

    if (!toDone) {
      Alert.alert(I18n.t('INPROGRESS'), I18n.t('INPROGRESS_NOTIFICATION'), [
        {
          text: I18n.t('CANCEL'),
          onPress: () => this.switch && this.switch.activate(),
        },
        {
          text: I18n.t('YES'),
          onPress: () => {
            this.onChangeInProgress(this.state.intervention, isDone)
            
          },
        },
      ])
    } else {
      this.onChangeInProgress(this.state.intervention, isDone)
    }
  }

  onChangeInProgress(id, isDone) {
    InterventionService.toggleDone(id, isDone, InterventionMobx.lastTimeFinishJob).then(res => {
      InterventionMobx.onUpdate(res)
      if (isDone == 1) {
        InterventionMobx.lastTimeFinishJob = InterventionMobx._getTimestamp(res.doneHourEnd)
      } else {
        InterventionMobx._prepareLastTimeFinishJob(true);
      }
      this.state.intervention = { ...this.state.intervention, ...res }
      //console.log("XN: "+JSON.stringify(this.state.intervention))
      DeviceEventEmitter.emit('refresh')
    })
  }

  onChange(initialPage) {
    this.setState({ initialPage })
  }

  onSaveSignature(rs) {
    const media = {
      fileData: rs.encoded,
      fileName: rs.pathName.split('/').pop(),
      filePath: rs.pathName,
    }
    // this.signature.resetImage()
    // this.newSignature = false;
    return this.onSaveMedia(media)
  }

  onPhotoFromCameraOrLibrary(type = 'launchCamera') {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true,
        waitUntilSaved: true,
      },
    }

    const accountId = parseInt(UserMobx.currentUser.u_id, 10)
    if (type === 'launchCamera' || type == 'launchCamera') {
      ImagePicker.launchCamera(options, response => {
        // console.log('Response = ', response)
        if (response.didCancel) {
          // console.log('User cancelled photo picker')
        } else if (response.error) {
          // console.log('ImagePicker Error: ', response.error)
        } else if (response.customButton) {
          // console.log('User tapped custom button: ', response.customButton)
        } else {
          // console.log('PathCaptured : ' + response.uri)
          if (response.data) {
            const {
              data,
              fileName,
              fileSize,
              uri,
              width,
              height,
            } = response
            const media = {
              accountId: accountId,
              fileName: fileName ? fileName : "media",
              fileSize,
              filePath: uri,
              imageWidth: width,
              imageHeight: height,
              fileData: data,
            }

            this.onSaveMedia(media)
          }
        }
      })
    } else if (type === 'launchImageLibrary' || type == 'launchImageLibrary') {
      ImagePicker.launchImageLibrary(options, response => {
        // console.log('Response = ', response)
        if (response.didCancel) {
          // console.log('User cancelled photo picker')
        } else if (response.error) {
          // console.log('ImagePickerưError: ', response.error)
        } else if (response.customButton) {
          // console.log('User tapped custom button: ', response.customButton)
        } else {
          // console.log('PathCaptured : ' + response.uri)
          if (response.data) {
            const {
              data,
              fileName,
              fileSize,
              uri,
              width,
              height,
            } = response
            const media = {
              accountId: accountId,
              fileName,
              fileSize,
              filePath: uri,
              imageWidth: width,
              imageHeight: height,
              fileData: data,
            }

            this.onSaveMedia(media)
          }
        }
      })
    }
  }

  onSaveMedia(media) {
    const { id, serverId } = this.state.intervention
    if (!id) return null
    // console.log('CapturedImage : ' + JSON.stringify(media))
    const accountId = parseInt(UserMobx.currentUser.u_id, 10)
    return SeMedia.insert({ ...media, accountId }).then(res => {
      // console.log('SavedImage : ' + JSON.stringify(res))
      SeMediaLink.addList([res], id, serverId).then(() => {
        this.fetchImages(id, serverId)
        this.tabs.goToPage(1)
        if (this.signature) {
          this.signature.resetImage()
        }
      })
    })
  }

  onMediaDetail(media) {
    if (this.mediaDetail) this.mediaDetail.onOpenWith(media)
  }

  onMediaDetailClose() {
    if (this.mediaDetail) this.mediaDetail.onClose()
  }

  fetchImages(id, serverId) {
    SeMediaLink.fetchMediaWith(id || this.state.intervention.id, serverId).then(list => {
      if (list && Object.keys(list).length > 0) {
        const listKey = list.sortKey()
        const mediaIds = listKey.map(key => list[key].fkMediaAppliId)
        SeMedia.fetchMediaWith(mediaIds).then(dataSource => this.setState({ dataSource }))
      } else {
        this.setState({ dataSource: [] })
      }
    })
  }

  get planDate() {
    let text
    const intervention = { ...this.state.intervention }
    intervention.planningDateStart = moment(intervention.planningDateStart).format('YYYY-MM-DD');
    const startDate = (intervention.planningDateStart || '').replace(
      /\D|[0-9]{0,3}:[0-9]{0,3}:[0-9]{0,3}/g,
      ''
    )
    intervention.planningDateEnd = moment(intervention.planningDateEnd).format('YYYY-MM-DD');
    const endDate = (intervention.planningDateEnd || '').replace(
      /\D|[0-9]{0,3}:[0-9]{0,3}:[0-9]{0,3}/g,
      ''
    )
    if (!!startDate && !!endDate) {
      const dates = [moment(startDate).format('DD/MMM/YYYY'), moment(endDate).format('DD/MMM/YYYY')]
      const datesArr = dates.map(date => date.split('/'))
      if (dates[0] === dates[1]) {
        text = [datesArr[1][0], datesArr[0][1]].join(' ')
      } else if (datesArr[0][1] === datesArr[1][1] && datesArr[0][2] === datesArr[1][2]) {
        text = [datesArr[0][0], '-', datesArr[1][0], datesArr[0][1]].join(' ')
      } else if (datesArr[0][1] === datesArr[1][1]) {
        text = [datesArr[0][0], datesArr[0][1], '-', datesArr[1][0], datesArr[1][1]].join(' ')
      } else {
        text = [dates[0], '-', dates[1]].join(' ')
      }
    }

    return text
  }

  renderPlan(type, header) {
    let date
    let termine = I18n.t('NO')
    let hour = I18n.t('EMPTY2')
    const intervention = { ...this.state.intervention }
    const startDate = intervention[`${type}DateStart`]
    const endDate = intervention[`${type}DateEnd`]
    const startHour = intervention[`${type}HourStart`]
    const endHour = intervention[`${type}HourEnd`]
    const commentment = intervention[`${type}Comment`] || I18n.t('EMPTY2')
    const travaille = intervention[`${type}Hour`]
    const status = intervention['isDone']
    //show tasknames 
    const actionNameIncompleted = this.state.taskNameIncompleted //check how to commit to server side 
    const actionNameCompleted = this.state.taskNameCompleted
    // (status === 1 ? this.state.taskName : I18n.t('EMPTY2'))
    if (!!startHour && !!endHour) hour = [startHour, endHour].join(' - ')

    if (!!startDate && !!endDate) {
      // console.log('status'+status)
      if (status==1) {
        termine = I18n.t('YES')
      }else{
        termine = I18n.t('NO')
      }
      const startMoment = moment(startDate)
      const endMoment = moment(endDate)
      // if (startMoment.format('DD/MM/YYYY') === endMoment.format('DD/MM/YYYY')) {
        // date = startMoment.format('DD/MM/YYYY')
      // } else {
        date = [moment(startDate).format('DD/MM/YYYY'), moment(endDate).format('DD/MM/YYYY')].join(
          ' - '
        )
      // }
    }

    return (
      <View style={styles.plan}>
        <Text style={this.withFontSize(styles.detailHeader)}>{I18n.t(header)}</Text>
        {header === 'EFFECTUE' && (
          <Text style={this.withFontSize(styles.planText)}>
            {I18n.t('TERMINE')}: {termine}
          </Text>
        )}
        {header === 'EFFECTUE' &&
          !!date && <Text style={this.withFontSize(styles.planText)}>{date}</Text>}
        <Text style={this.withFontSize(styles.planText)}>
          {I18n.t('HEURES')}: {hour}
        </Text>
        <Text style={this.withFontSize(styles.planText)}>
          {I18n.t('TEMPS_TRAVAILLE')}: {travaille}
        </Text>
        {header === 'EFFECTUE' &&<Text style={this.withFontSize(styles.planText)}>
          {I18n.t('ACTIONS')}: {actionNameCompleted}
        </Text>}
        {header != 'EFFECTUE' &&<Text style={this.withFontSize(styles.planText)}>
          {I18n.t('ACTIONS')}: {actionNameIncompleted}
        </Text>}
        <Text style={this.withFontSize(styles.planText)}>
          {I18n.t('COMMENT')}: {commentment}
        </Text>
      </View>
    )
  }

  _sendMailToClient = (clientEmail) => {
    const { intervention } = this.state
    const now = moment(new Date())
    const data = { ...intervention }
    data.editDate = now.toDate()
    data.isToSync = 1
    data.sendMail = 1 & !data.sendMail

    InterventionService.updateSendMail(data).then(item => {
      InterventionMobx.onUpdate(data)
      this.setState({
        intervention: data
      })
    })
  }
  //todo more code
  _assignToMe = () => {
    sync.joinInterventionNonAssigned(this.state.intervention.serverId).then(
      res => {
        const { id } = this.state.intervention
        
        if (res.hasOwnProperty('MESSAGE')) {
          const { currentUser } = UserMobx
          if (currentUser && currentUser.u_id) {
            Sync.syncFromServer(currentUser.u_id).then(()=>{
              Alert.alert('', I18n.t('INTERVENTION_ASSIGNED'))
              DeviceEventEmitter.emit('reloadList')
            }).catch(()=>{
                  DeviceEventEmitter.emit('reloadList')
                  //Alert.alert('', I18n.t('INTERVENTION_ASSIGNED'))
                }
              );
            
            //interventionEdit.fkUserServerlId = 209860
            // interventionEdit.fkUserServerlId = isNaN(currentUser.u_id)? parseInt(currentUser.u_id) : currentUser.u_id;
            //
          }
        } else if (res.hasOwnProperty('ERROR')) {
          InterventionService.onEdit({ id, isActif: 0 }).then(() => {
            Alert.alert('', I18n.t('INTERVENTION_ALREADY_ASSIGNED'))
            let byDate = moment(this.state.intervention.addDate, 'X').format('YYYY-MM-DD')
            InterventionMobx.assign(this.state.intervention, false)
            DeviceEventEmitter.emit('refresh')
          })
        }
        //  let byDate = moment(this.state.intervention.addDate, 'X').format('YYYY-MM-DD')
        //  InterventionMobx.deleteNonAssignIntervention(this.state.intervention.serverId,byDate)

        Actions.nonAssignIntervention()
      }
    );
  }

  renderWorker() {
    const { intervention } = this.state
    if (intervention && intervention.listUserAdded) {
      const workers = intervention.listUserAdded
      if (workers && Object.keys(workers).length > 0) {
        return (
          <View style={styles.section}>
            <Text style={this.withFontSize(styles.detailHeader)}>
              {I18n.t('LS_WORKER')}
            </Text>
            {
              workers.map((iWorker, index) =>
                <Text key={index} style={this.withFontSize(styles.itemText)}>
                  - {[iWorker.prenom, iWorker.nom].join(' ')}
                </Text>
              )
            }
          </View>
        )
      }
    }
    return <View />
  }

  renderClientItem(key, value, index) {
    const property = mapClient[key]
    if (!property || !value || value === '0') return null

    const isPhone = this.keyPhone.includes(property)
    const label = isPhone ? I18n.t('PHONE_CALL') : I18n.t(mapClient[key])
    const isEmail = key === 'email'
    const isSupperUser = (UserMobx.currentUser.u_rang != 12)
    if (isPhone) {
      return (
        <View key={index} style={styles.row}>
          <Text style={this.withFontSize(styles.itemText)}>{label}:&nbsp;</Text>
          
          {isSupperUser && <TouchableOpacity onPress={() => (isEmail ? this._sendMailToClient(value) : phonecall(value, false))}>
            <Text style={this.withFontSize(styles.phone)}>{value}</Text>
          </TouchableOpacity>}
          {!isSupperUser && <Text style={this.withFontSize(styles.phone1)}>{value}</Text>}
        </View>
      )
    }

    return (
      <Text key={index} style={this.withFontSize(styles.itemText)}>
        {label}: {value}
      </Text>
    )
  }

  renderClient() {
    const client = { ...this.state.intervention.client }
    const { id, code, prenom, nom, title, email } = client
    const civilite = [I18n.t('MR'), I18n.t('MRS')]
    const fullname = prenom === '' ? nom : [prenom, nom].join(' ')
    const cloneClient = {
      ...client,
      nom: null,
      prenom: null,
      civilite: null,
      title: `${civilite[client.civilite - 1]} ${title}`,
    }
    const { isAllowSendEmail } = SettingMobx
    const isSupperUser = (UserMobx.currentUser.u_rang != 12)
    return (
      <View style={styles.section}>
        <Text style={this.withFontSize(styles.detailHeader)}>
          {I18n.t('CLIENT')}
          {!!code && ` #${code}`}
        </Text>
        {this.renderClientItem('fullname', fullname, 0)}
        {Object.keys(cloneClient).map((key, index) =>
          this.renderClientItem(key, cloneClient[key], index + 1)
        )}
        {!this.state.isNotAssign && !!isAllowSendEmail && 
          <Button
            style={{borderRadius:3,marginTop:5, paddingLeft: 5, backgroundColor: isSupperUser? '#5c9ded':'#cccccc' }}
            onPress={() =>{  if(isSupperUser){this._sendMailToClient(email)}}} >
            <Icon name='ios-mail' />
            <Text style={{ color: '#fff' }}>{I18n.t('LB_SEND_MAIL')}</Text>
          </Button>
        }
      </View>
    )
  }

  renderAddressItem(key, value, index) {
    const property = mapClient[key]
    if (!property || !value || value === '0') return null
    const label = I18n.t(mapAddress[key])

    return (
      <Text key={index} style={this.withFontSize(styles.itemText)}>
        {label}: {value}
      </Text>
    )
  }

  renderAddress() {
    const address = { ...this.state.intervention.address }
    const { id, code, prenom, nom } = address
    lat = 0; lng = 0;
    if (address && Object.keys(address).length > 0) {
      if (address.hasOwnProperty('latitude')) {
        lat = address['latitude']
      }
      if (address.hasOwnProperty('longitude')) {
        lng = address['longitude']
      }
    }
    const isHasGeo = !(lat === 0 || lng === 0 || lat === '' || lng === '')
    const fullname = prenom === '' ? nom : [prenom, nom].join(' ')
    const cloneAddress = { ...address, prenom: null, nom: null }
    const { isDisplayTimer, isDisplayMap, isAllowSendEmail } = SettingMobx
    return (
      <View style={styles.section}>
        <Text style={this.withFontSize(styles.detailHeader)}>
          {I18n.t('ADDRESS')}
          {code && ` #${code}`}
        </Text>
        {this.renderAddressItem('fullname', fullname, 0)}
        {Object.keys(cloneAddress).map((key, index) =>
          this.renderAddressItem(key, cloneAddress[key], index + 1)
        )}
        {!!(isDisplayMap && isHasGeo) && <Button style={{ backgroundColor: '#46CCBE' }} onPress={() => this._openExternalApp(lat, lng)}><Text style={{ color: '#fff' }}>{I18n.t('PREF_MAP')}</Text></Button>}
      </View>
    )
  }

  _renderLinkProduct = () => {
    const { intervention } = this.state
    const linkProducts = intervention && intervention.linkProducts
    console.log('ViewDetailIntervention : ' + JSON.stringify(intervention))
    console.log('LinkProductOfIntervention >>> ' + JSON.stringify(linkProducts))
    if (!linkProducts) return null
   
    return (
      <View style={styles.section}>
        <Text style={this.withFontSize(styles.detailHeader)}>{I18n.t('PRODUCTS')}</Text>

        {Object.keys(linkProducts).map((key, index) =>
          this.renderItemProduct(key, linkProducts[key], index + 1)
        )}
      </View>
    )
  }

  renderItemProduct(key, value, index) {
    return (
      <View key={index} style={{ flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'center' }}>
        <Text style={styles.labelUnite}>
          {`${value.quantity} `}
        </Text>
        <Text style={styles.valUnite}>
          {`${value.productName}`}
        </Text>
      </View>
    )
  }

  renderUniteItem(key, value, index) {
    return (
      <View key={index} style={{ flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'center' }}>
        <Text style={styles.labelUnite}>
          {`${value.UniteTitle}:`}
        </Text>
        <Text style={(value.UniteType == 6 || value.UniteType == 9) ? styles.valUniteSpecial : styles.valUnite}>
          {`${value.uniteValueUI}`}
        </Text>
      </View>
    )
  }

  renderUnite() {
    const { intervention } = this.state
    const uniteLinks = intervention && intervention.uniteLinks
    if (!uniteLinks) return null
   
    return (
      <View style={styles.section}>
        <Text style={this.withFontSize(styles.detailHeader)}>{I18n.t('FURTHER_INFO')}</Text>

        {Object.keys(uniteLinks).map((key, index) =>
          this.renderUniteItem(key, uniteLinks[key], index + 1)
        )}
      </View>
    )
  }

  renderMediaLinks() {
    const { dataSource } = this.state

    return (
      <View style={styles.section}>
        <Text style={this.withFontSize(styles.detailHeader)}>{I18n.t('MEDIA_ATTACHMENTS')}</Text>
        {Object.keys(dataSource)
          .reverse()
          .map((key, index) => {
            const item = dataSource[key]
            return (
              <TouchableOpacity
                key={index}
                style={{ marginTop: index > 0 ? 10 : 0 }}
                onPress={() => this._openMediaLink(item.filePath)}
              >
                <Text style={styles.valUniteSpecial}>
                  {`${item.fileName}`}
                </Text>
              </TouchableOpacity>
            )
          })}
      </View>
    )
  }

  renderHistory() {
    const { intervention } = this.state
    return (
      <View style={styles.section}>
        <Text style={this.withFontSize(styles.detailHeader)}>{I18n.t('LB_HISTORY')}</Text>
        <Button style={{ backgroundColor: '#5c9ded' }} onPress={() => {
          if (intervention && intervention.serverId && intervention.serverId != 0) {
            Actions.historyIntervention({ intervention })
          } else {
            Alert.alert(null, I18n.t('MSG_NEED_SYNC'), [
              {
                text: I18n.t('YES'), onPress: () => { },
              },
            ])
          }
        }}><Text style={{ color: '#fff' }}>{I18n.t('LB_HISTORY')}</Text></Button>
      </View>
    )
  }

  renderDetail() {
    return (
      <Tab style={styles.tabStyle} heading={I18n.t('DETAILS')}>
        <View style={styles.row}>
          {this.renderPlan('planning', 'PLANIFIE')}
          {this.renderPlan('done', 'EFFECTUE')}
        </View>
        {this.renderWorker()}
        {this.renderClient()}
        {this.renderAddress()}
        {this._renderLinkProduct()}
        {this.renderUnite()}
        {this.renderMediaLinks()}
        {this.renderHistory()}
      </Tab>
    )
  }

  renderSignature() {
    if (!SettingMobx.takeSignature) return null

    return (
      <Tab style={styles.tabStyle} heading={I18n.t('SIGNATURE')}>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <SignatureCapture
            style={styles.signature}
            ref={ref => (this.signature = ref)}
            onSaveEvent={this.onSaveSignature}
            onDragEvent={() => this.newSignature = true}
            /* saveImageFileInExtStorage={false} */
            saveImageFileInExtStorage
            showNativeButtons={false}
            showTitleLabel={false}
            // onDrawed={this.newSignature = true}
            square={true}
          />

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.buttonStyle} onPress={() => { this.currentTab = 1, this.newSignature = false, this.signature.saveImage() }}>
              <Text style={{ color: '#fff' }}>{I18n.t('SAVE')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonStyle, styles.cancel]}
              onPress={() => { this.signature.resetImage(), this.newSignature = false }}
            >
              <Text style={{ color: '#fff' }}>{I18n.t('RESET')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Tab>
    )
  }

  renderMedias() {
    const { dataSource } = this.state
    return (
      <Tab style={styles.tabStyle} heading={I18n.t('FILES')}>
        <View style={styles.btnGroup}>
          {SettingMobx.takePhoto && (
            <TouchableOpacity
              style={styles.btnPhoto}
              onPress={() => this.onPhotoFromCameraOrLibrary('launchCamera')}
            >
              <Icon name="md-camera" style={styles.fileIcon} />
              <Text style={styles.btnFileText}>{I18n.t('TAKE_PHOTO')}</Text>
            </TouchableOpacity>
          )}
          {SettingMobx.getPhoto && (
            <TouchableOpacity
              style={styles.btnPhoto}
              onPress={() => this.onPhotoFromCameraOrLibrary('launchImageLibrary')}
            >
              <Icon name="ios-folder-open" style={styles.fileIcon} />
              <Text style={styles.btnFileText}>{I18n.t('SEARCH_PHOTO')}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.medias}>
          {Object.keys(dataSource)
            .reverse()
            .map((key, index) => {
              const item = dataSource[key]
              // console.log('IsURL : ' + StringUtils.isUrl(item.filePath))
              // const createdAt = moment(item.addDate, 'x');
              // const isValid = createdAt.isValid();
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.mediaItem}
                  onPress={() => this.onMediaDetail(item)}
                >
                  <Image
                    source={{ uri: `data:image/png;base64,${item.fileData}` }}
                    style={styles.itemImage}
                  />
                </TouchableOpacity>
              )
            })}
        </View>
      </Tab>
    )
  }

  _openExternalApp = (lat, lng) => {
    // console.log('Geo : ' + lat + ", " + lng)
    AppLinking.openGoogleMap(lat, lng)
    // if (lat === 0 || lng === 0 || lat === '' || lng === '') {
    //   return
    // }
    // url = `http://maps.apple.com/?daddr=${lat},${lng}`
    // Linking.canOpenURL(url).then(supported => {
    //   if (supported) {
    //     Linking.openURL(url);
    //   } else {
    //     console.log('Don\'t know how to open URI: ' + url);
    //   }
    // });
  }

  _openMediaLink = (url) => {
    if (url === '' || !StringUtils.isUrl(url)) {
      return
    }
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // console.log('Don\'t know how to open URI: ' + url);
      }
    });
  }

  renderLoading() {
    // console.log('RenderLoading >>> Start')
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          color="#9f9f9f"
          size={Platform.OS === 'ios' ? 0 : 60}
        />
      </View>
    )
  }

  render() {
    if (!this.state.intervention || Object.keys(this.state.intervention).length == 0) return null
    const { id, nom, client, code, priority, isDone } = this.state.intervention
    const status = isDone === 1
    const statusText = status ? I18n.t('TERMINE') : I18n.t('INPROGRESS')
    const priorityText = utils.getPriorityText(this.state.intervention)
    const time = utils.getTime(this.state.intervention)
    const { isDisplayTimer, isDisplayMap, isAllowSendEmail } = SettingMobx
    const { isSyncData, isLoading } = this.state
    // console.log('intervention ID : ' + this.state.intervention.serverId)
    return (

      <Container style={styles.container}>
        <KeyboardAwareScrollView>
          <Header style={styles.header}>
            <Left style={componentStyles.headerLeft}>
              <Button transparent onPress={() => Actions.pop()} style={{height:40}}>
                <Icon name="ios-arrow-back" style={styles.leftIcon} size={18} />
                <Image source={organilogIcon} style={{width: 35, height:27}} />
              </Button>
              <Text style={styles.title}>
                {I18n.t('INTERVENTION_NO')} {code}
               </Text>
            </Left>
            {!this.state.isNotAssign && <Right style={styles.right}>
              <Button transparent style={styles.rightBtn} onPress={this.onDelete}>
                <Icon style={styles.rightIcon} name="md-trash" />
              </Button>
              <Button
                transparent
                style={styles.rightBtn}
                onPress={() => {
                  Actions.createIntervention({
                    intervention: { ...this.state.intervention },
                  })
                }}
              >
                <Icon style={styles.rightIcon} name="ios-create-outline" />
              </Button>
              <Button transparent style={styles.rightBtn} onPress={this.onSync}>
                {isSyncData && <ActivityIndicator color="#FFFFFF" style={styles.sync} />}
                {!isSyncData && <Icon style={styles.rightIcon} name="md-sync" />}
              </Button>
            </Right>}
          </Header>
          <View style={styles.barTop}>
            <Text style={this.withFontSize(styles.barTitle, 1.2)}>
              {(this.state.intervention.nom || '').toUpperCase()}
            </Text>
          </View>
          <Content style={styles.content}>
            {!!isLoading && this.renderLoading()}
            <View style={[styles.information, styles[`priority${priority}Left`]]}>
              <Left style={styles.informationLeft}>
                <Text style={this.withFontSize(styles.name, 1.2)}>{client && client.title}</Text>
                <Text style={this.withFontSize(styles.time)}>{time}</Text>
              </Left>
              <Right style={styles.informationRight}>
                <Text style={[this.withFontSize(styles.priority), styles[`priority${priority}`]]}>
                  {(priorityText || '').toUpperCase()}
                </Text>
                <Text style={[styles.date, this.withFontSize(styles.time)]}>{this.planDate}</Text>
              </Right>
            </View>
            {!this.state.isNotAssign && <View style={styles.caption}>
              <Left style={styles.captionLeft}>
                {!!isDisplayTimer && <Timer
                  status={status}
                  ref={ref => (this.timer = ref)}
                  intervention={this.state.intervention}
                  withFontSize={this.withFontSize}
                  onValueChange={this.onValueChange}
                />}
              </Left>
              <Right style={styles.captionRight}>
                <Text style={this.withFontSize(styles.captionLabel)}>{statusText}</Text>
                <Switch
                  active={status}
                  ref={ref => (this.switch = ref)}
                  onChangeState={this.onValueChange}
                />
              </Right>

            </View>
            }
            {this.state.isNotAssign && <View style={styles.nonAssignedSection}>
              <Button
                style={{ padding: 5, backgroundColor: '#5c9ded', margin: 8, alignSelf: 'center' }}
                onPress={() => this._assignToMe()}>
                <Text style={{ color: '#fff' }}>{I18n.t('LB_ASSIGN_TO_ME')}</Text>
              </Button>

            </View>
            }
            <Tabs
              style={styles.tabs}
              ref={ref => (this.tabs = ref)}
              renderTabBar={() => <TabHeader onChange={i => {
                console.log('Current, i, new? : ' + this.currentTab + ', ' + i + ', ' + this.newSignature)
                if (i != 2 && this.newSignature && this.currentTab == 2) {
                  this.confirmSaveSignature(i)
                } else {
                  this.tabs.goToPage(i)
                }
                this.currentTab = i;
              }} />}
            >
              {this.renderDetail()}
              {/* {this.renderMedias()} */}
              {!this.state.isNotAssign && this.renderMedias()}
              {!this.state.isNotAssign && this.renderSignature()}
            </Tabs>
          </Content>
          <MediaDetailModal
            onEdit={this.onEditMedia}
            onDelete={this.onDeleteMedia}
            fontSize={SettingMobx.fontSize}
            ref={ref => (this.mediaDetail = ref)}
          />
        </KeyboardAwareScrollView>
      </Container>

    )
  }

  confirmSaveSignature = (tabIndex) => {
    Alert.alert('', I18n.t('MESSAGE_SAVE_SIGNATURE'), [
      { text: I18n.t('CANCEL'), onPress: () => { this.newSignature = false, this.signature.resetImage(), this.tabs.goToPage(tabIndex) } },
      {
        text: I18n.t('YES'),
        onPress: () => {
          this.signature.saveImage()
          this.tabs.goToPage(tabIndex)
          //this.signature.resetImage()
          this.newSignature = false;
        },
      },
    ])
  }
}

Detail.propTypes = {
  intervention: PropTypes.object.isRequired,
}

Detail.defaultProps = {}

export default Detail
