import React, { Component } from 'react'
import {
  DeviceEventEmitter,
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
import moment from 'moment'
import { Actions, ActionConst } from 'react-native-router-flux'
import { Container, Header, Left, Button, Text, Label, Right, Toast } from 'native-base'
import ImagePicker from 'react-native-image-picker'
import I18n from 'react-native-i18n'
import DateTimePicker from 'react-native-modal-datetime-picker'
import { observer } from 'mobx-react/native'
import ModalCustom from 'react-native-modalbox'

import SigntureView from '../../signature'

import { componentStyles, textStyles } from '../../../styles'
import styles from './styles'
import InforSub from './inforSection'
import IntervantSection from './intervantSection'
import DateSection from './dateSection'
import HoursSection from './hoursSection'
import MediaSection from './mediaSection'
import TaskSection from './taskSection'
import UniteSection from './customfield'
import Filiale from './filialeSection'
import TitleSection from './titleSection'
import SectionProduct from './sectionProduct'
import ServiceSync from '../../../services/sync'
import SeFiliale from '../../../services/filiale'
import SeIntervention from '../../../services/intervention'
import SeClient from '../../../services/client'
import SeAddress from '../../../services/address'
import SeMedia from '../../../services/media'
import SeUser from '../../../services/user'
import SeMediaLink from '../../../services/mediaLink'
import SeTask from '../../../services/task'
import SeUnite from '../../../services/unite'
import SeUniteItem from '../../../services/uniteItem'
import SeUniteLink from '../../../services/uniteLink'
import InterventionMobx from '../../../mobxs/intervention'
import UserMobx from '../../../mobxs/user'
import SettingMobx from '../../../mobxs/setting'
import TimeUtills from '../../../utils/TimeUtils'
import IconBack from '../../../themes/IconBack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import DialogManager, { ScaleAnimation, DialogContent } from 'react-native-dialog-component'
import geolib from 'geolib'
import setting from '../../../mobxs/setting';
// import { start } from 'repl';
// import { KeyboardAwareView } from 'react-native-keyboard-aware-view'
const organilogIcon = require('../../../../images/organilog-logo-color.png')
const locationIcon = require('../../../../images/location_icon.png')

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })

observer
class CreateIntervention extends Component {
  constructor(props) {
    super(props)
    //console.log('CreateOrEditIntervention : '+ JSON.stringify(props.intervention));
    this.state = {
      itemIntervention: props.intervention,
      userId: 0,
      isEditClient: true,
      dataSearchSource: ds.cloneWithRows([]),
      listDataClient: [],
      listDataAddress: [],
      dataSource: [],
      dataSpeaker: [],
      dataProducts: [],
      client: '',
      address: '',
      modalVisible: false,
      currentDate: new Date(),
      isDateTimePickerVisible: false,
      isDatePickerVisible: false,
      typeDataPicker: null,
      beginTime: props.intervention ? (props.intervention.doneHourStart ? props.intervention.doneHourStart : I18n.t('BEGIN')) : `${I18n.t('BEGIN')} `,
      beginTimeCalc: `00:00`,
      endTime: `${I18n.t('END')} `,
      endTimeCalc: `00:00`,
      beginDate: props.intervention ? this._convertDate(props.intervention.planningDateStart, props.intervention.doneDateStart, `${I18n.t('BEGIN')}`) : `${I18n.t('BEGIN')} `,
      endDate: props.intervention ? this._convertDate(props.intervention.planningDateEnd, props.intervention.doneDateEnd, `${I18n.t('END')}`) : `${I18n.t('END')} `,
      workTime: `${I18n.t('WORK_TIME')} ${I18n.t('EMPTY')}`,
      isCompleted: props.intervention ? props.intervention.isDone == 1 : false,
      topOfViewAuto: 0,
      isShowAutoComplete: false,
      heightDynamic: 0,
      yOfClient: 0,
      yOfAddress: 0,
      yOfUser: 0,
      planningDateStart: '', // props.intervention? this._convertDate(props.intervention.planningDateStart, props.intervention.doneDateStart) : '' ,
      planningDateEnd: '', // props.intervention? this._convertDate(props.intervention.planningDateEnd, props.intervention.doneDateEnd) : '',
      planningHourStart: '',
      planningHourEnd: '',
      planningHour: '',
      planningComment: '',
      //
      doneDateStart: '',
      doneDateEnd: '',
      doneHourStart: '',
      doneHourEnd: '',
      doneHour: '',
      doneComment: '',
      doneLongitude: '',
      doneLatittude: '',
      //
      currentComment: '',

      //
      fkClientAppliId: null,
      fkAdresseAppliId: null,
      fkFilialeAppliId: null,
      fkFilialeServerId: null,
      latitude: 0,
      longitude: 0,
      error: null,
      isEdit: false,
      listTasks: [],
      listRootTasks: [], // for filter
      timeTask: '',
      isShowOfAction: false,
      isShowFilialeModal: false,
      listFiliale: [],
      dataSourceFiliale: ds.cloneWithRows([]),
      nameFiliale: I18n.t('EMPTY2'),
      subDomain: I18n.t('EMPTY2'),
      listUsers: [],
      typeOfAutoFill: '',
      intUserName: '',
      intUserId: null,
      title: '',
      currentTaskId: 0,
      linkInterventionTasks: [],
      listUnites: [],
      listRootUnites: [], // for filter
      linkUnites: [],
      currentTime: '00:00',
      isAllowClientAddress: SettingMobx.isAllowModifyClientAddress,
      isAddSpeeker: SettingMobx.isAllowModifySpeeker,
      isShowTitle: SettingMobx.isAllowModifyTitle,
      isEditDate: SettingMobx.isAllowModifyDate,
      isEditTime: SettingMobx.isAllowModifyTime,
      isEnableGPS: false,
      listProducts: [],
      prevNomToSearchProduct: '',
      quantityProductSelected: '',
      productSelected: null,
      listCurrentProduct: []
    }
    console.log('isAllowClientAddress : ' + this.state.isAllowClientAddress)
    console.log('isAddSpeeker : ' + this.state.isAddSpeeker)
    console.log('isShowTitle : ' + this.state.isShowTitle)
    console.log('isEditDate : ' + this.state.isEditDate)
    console.log('isEditTime : ' + this.state.isEditTime)
    this.onDatePicked = this.onDatePicked.bind(this)
    this.onDateTimePicked = this.onDateTimePicked.bind(this)
    this.onHideDatePicker = this.onHideDatePicker.bind(this)
    this.onHideDateTimePicker = this.onHideDateTimePicker.bind(this)
    this._keyboardDidHide = this._keyboardDidHide.bind(this)
    this.onSaveNewOnSignature = this.onSaveNewOnSignature.bind(this)

    this.onChangeClientEvent = this.onChangeClientEvent.bind(this)
    this.onChangeAddressEvent = this.onChangeAddressEvent.bind(this)
    this.getPositionOfInput = this.getPositionOfInput.bind(this)
    this.countLog = 0
    this.isChangeDate = false
    this.isChangeWorkingHour = false
    this.currentDate = new Date();
    this.currentTime = moment().format('hh:mm')
    this.dataAddress = ds
    //console.log(this.currentTime);
  }

  componentWillMount() {
    const { itemIntervention } = this.state
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide)
    const accountId = parseInt(UserMobx.currentUser.u_id, 10)
    const user = UserMobx.currentUser
    const subDomain = user.subDomain
    const name = [user.u_prenom, user.u_nom].join(' ')
    const arr = this.state.dataSpeaker
    const arrProduct = this.state.dataProducts
    arr.push({ id: user.u_uuid, name, serverId: accountId })
    if (itemIntervention) {
      if (itemIntervention.hasOwnProperty('listUserAdded')) {
        itemIntervention.listUserAdded.map(item => {
          arr.push({ id: item.id, name: [item.prenom, item.nom].join(' '), serverId: item.serverId })
        })
      }
      if (itemIntervention.hasOwnProperty('linkProducts')) {
        let keyProducts = Object.keys(itemIntervention.linkProducts)
        keyProducts.map(key => {
          arrProduct.push(itemIntervention.linkProducts[key])
        })
        // console.log('ListLinkProduct : ' + JSON.stringify(itemIntervention.linkProducts))
        // itemIntervention.linkProducts.map(item => {
        //   arrProduct.push(item)
        // })
      }
    }
    this.setState(
      {
        userId: accountId,
        dataSpeaker: arr,
        dataProducts: arrProduct,
        nameFiliale: subDomain,
        subDomain: subDomain,
      },
      () => {
        if (itemIntervention) {
          // this.fetchImagesEdit(this.state.userId)
          console.log('EditIntervention : ' + JSON.stringify(itemIntervention))
          this.fetchImagesEdit(this.state.userId, itemIntervention.id)
          const clientData = itemIntervention.client
          const addressData = itemIntervention.address

          this.setState({
            isEdit: true,
            planningHourStart: itemIntervention.planningHourStart,
            planningHourEnd: itemIntervention.planningHourEnd,
            planningHour: itemIntervention.planningHour,
            planningComment: itemIntervention.planningComment,
            //
            doneDateStart: itemIntervention.doneDateStart,
            doneDateEnd: itemIntervention.doneDateEnd,
            doneHourStart: itemIntervention.doneHourStart,
            doneHourEnd: itemIntervention.doneHourEnd,
            doneHour: itemIntervention.doneHour,
            doneComment: itemIntervention.doneComment,
            //
            currentComment: itemIntervention.doneComment,
            //
            beginTime: itemIntervention.doneHourStart ? `${I18n.t('BEGIN')} ${itemIntervention.doneHourStart}` : `${I18n.t('BEGIN')} ${itemIntervention.planningHourStart ? itemIntervention.planningHourStart : ''}`,
            beginTimeCalc: itemIntervention.doneHourStart ? itemIntervention.doneHourStart : itemIntervention.planningHourStart,
            endTime: itemIntervention.doneHourEnd ? `${I18n.t('END')} ${itemIntervention.doneHourEnd}` : `${I18n.t('END')} ${itemIntervention.planningHourEnd ? itemIntervention.planningHourEnd : ''}`,
            endTimeCalc: itemIntervention.doneHourEnd ? itemIntervention.doneHourEnd : itemIntervention.planningHourEnd,
            workTime: itemIntervention.doneHour ? `${I18n.t('WORK_TIME')} ${itemIntervention.doneHour}` : `${I18n.t('WORK_TIME')} ${itemIntervention.planningHour ? itemIntervention.planningHour : ''}`,
            title: itemIntervention.nom,
            // isCompleted: itemIntervention.isDone === 1,
            fkFilialeAppliId: itemIntervention.fkFilialeAppliId,
            //fkFilialeAppliId: this.state.userId,
            linkInterventionTasks: SeIntervention.linkInterventionTasks(itemIntervention),
            linkUnites: SeIntervention.linkUnites(itemIntervention, this.state.userId),
            client: clientData.title,
            address: addressData ? (addressData.adresse ? addressData.adresse : addressData.societe) : '',
            isCompleted: itemIntervention.isDone == 1 ? true : false,
          })
        }
      }
    )

    const { clientup, addressup } = this.props
    if (clientup) {
      console.log('client up : ' + JSON.stringify(clientup))
      const arr = this.parseListAddress(SeAddress.fetchItemWithFKClientId(accountId, clientup.id, ''))
      if (arr.length > 0) {
        this.setState({
          address: [arr[0].adresse, arr[0].codePostal, arr[0].ville].join(' '),
          fkAdresseAppliId: arr[0].id,
        })
      }
      this.setState({
        client: `${clientup.title} (${arr.length} adresses)`,
        fkClientAppliId: clientup.id,
      })
    }
    if (addressup) {
      console.log('client up : ' + JSON.stringify(addressup))
      if (addressup.client) {
        const client = addressup.client;
        const arr = this.parseListAddress(SeAddress.fetchItemWithFKClientId(accountId, client.id, ''))
        if (arr.length > 0) {
          this.setState({
            address: [arr[0].adresse, arr[0].codePostal, arr[0].ville].join(' '),
            fkAdresseAppliId: arr[0].id,
          })
        }
        this.setState({
          client: `${client.title} (${arr.length} adresses)`,
          fkClientAppliId: client.id,
        })
      } else {
        this.setState({
          address: [addressup.adresse, addressup.codePostal, addressup.ville].join(' '),
          fkAdresseAppliId: addressup.id,
        })
      }
    }

  }

  componentDidMount() {
    DeviceEventEmitter.addListener('reloadListProduct', this._refresh)
    // navigator.geolocation.getCurrentPosition(
    //   position => {
    //     this.setState({
    //       latitude: position.coords.latitude,
    //       longitude: position.coords.longitude,
    //       error: null,
    //     })
    //   },
    //   error => this.setState({ error: error.message }),
    //   { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    // )

    //get data from 
    // this._fetchSetting()
    this.fetchListFiliale()
    this.fetchListUser()
    this.fetchListTasks()
    this.fetchListUnites()
    //todo setting is allow location 
    this.getLocation();
  }

  _convertDate = (planDate, endDate, prefix = '') => {
    if (endDate) {
      const currentTime = moment(endDate)
      return `${prefix} ${currentTime.format('YYYY-MM-DD')}`
    } else if (planDate) {
      const currentTime = moment(planDate)
      return `${prefix} ${currentTime.format('YYYY-MM-DD')}`
    } else {
      return `${prefix}`
    }
  }

  _fetchSetting = () => {
    isAllowClientAddress = true
    isAddSpeeker = true
    isShowTitle = true
    isEditDate = true
    isEditTime = true
    const settingIntervention = SettingMobx.dataArray['4']
    if (settingIntervention && Object.keys(settingIntervention).length > 0 && settingIntervention.hasOwnProperty('items')) {
      items = settingIntervention['items'];
      if (items && Object.keys(items).length > 0) {
        if (items.hasOwnProperty('PREF_CAN_EDIT_CLIENT_ADRESSE')) {
          isAllowClientAddress = items['PREF_CAN_EDIT_CLIENT_ADRESSE']['value'] !== '0';
        }
        if (items.hasOwnProperty('PREF_CAN_EDIT_USERS')) {
          isAddSpeeker = items['PREF_CAN_EDIT_USERS']['value'] !== '0';
        }
        if (items.hasOwnProperty('PREF_DISPLAY_FIELD_TITLE')) {
          isShowTitle = items['PREF_DISPLAY_FIELD_TITLE']['value'] !== '0';
        }
        if (items.hasOwnProperty('PREF_CAN_EDIT_HOURS')) {
          isEditTime = items['PREF_CAN_EDIT_HOURS']['value'] !== '0';
        }
        if (items.hasOwnProperty('PREF_CAN_EDIT_DATES')) {
          isEditDate = items['PREF_CAN_EDIT_DATES']['value'] !== '0';
        }
        this.setState({
          isAllowClientAddress: isAllowClientAddress,
          isAddSpeeker: isAddSpeeker,
          isShowTitle: isShowTitle,
          isEditDate: isEditDate,
          isEditTime: isEditTime
        })
      }
    }
  }

  fetchListUnites() {
    console.log('FetchListUnites >>> Start')
    // console.log('LinkUnite : ' + JSON.stringify(this.state.linkUnites))    
    SeUniteItem.fetchAllUniteItemByAccountIdGroupForServerId(this.state.userId).then(listUniteItem => {
      // console.log('ListUniteItem : ' + JSON.stringify(listUniteItem))
      SeUnite.fetch(this.state.userId)
        .then(list => {
          // console.log('ListUnites : ' + JSON.stringify(list))
          const listKey = list.sortKey()
          const listUnites = listKey.map(key => {
            const temp = { ...list[key] }
            // console.log('TmpUnite : ' + JSON.stringify(temp))
            // console.log('TmpUnite : ' + temp.serverId)
            temp.value = '';
            Object.keys(this.state.linkUnites).forEach(key => {
              item = this.state.linkUnites[key]
              if (temp.id == item.fkUniteAppliId || temp.serverId == item.fkUniteServerId) {
                temp.value = item.uniteValue
                temp.valueUI = item.uniteValueUI
                return;
              }
            })
            //
            if (temp.fieldType == 4) {
              temp.typeStr = [{ label: I18n.t('CHOICE'), value: '' }]
            }
            if (temp.fieldType == 10) {
              temp.typeStr = []
            }
            if (Object.keys(listUniteItem).length > 0) {
              const listKeyUniteItem = Object.keys(listUniteItem)
              for (var index = 0; index < listKeyUniteItem.length; index++) {
                let uniteItem = listUniteItem[listKeyUniteItem[index]]
                if (uniteItem.uniteServerId == temp.serverId) {
                  // console.log('UniteItemMatched : ' + JSON.stringify(uniteItem))
                  if (uniteItem) {
                    if (temp.fieldType == 4 || temp.fieldType == 10) {
                      temp.typeStr.push({ label: uniteItem.value, value: `${uniteItem.serverId}` })
                    } else {
                      temp.typeStr += uniteItem.value + ', '
                    }
                  }
                }
              }
            }
            return temp
          })
          this.setState({
            listUnites: listUnites,
            listRootUnites: listUnites,
          })
        })
        .catch(console.log)
    })
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('reloadListProduct', this._refresh)
    this.keyboardDidHideListener.remove()
  }

  _refresh = () => {
    const { dataProducts } = this.state
    console.log('DataProduct : ' + JSON.stringify(dataProducts))
    selectedProduct = InterventionMobx.selectedProduct
    console.log('selectedProduct : ' + JSON.stringify(selectedProduct))
    dataProducts.push(selectedProduct)
    console.log('DataProductChanged : ' + JSON.stringify(dataProducts))
    InterventionMobx.clearSelectedProduct()
    this.setState({
      dataProducts
    })
  }

  filterIntervant(str) {
    const { yOfUser } = this.state
    this.setState({
      typeOfAutoFill: 'user',
      intUserName: str,
    })
    const h = Platform.OS === 'ios' ? 68 : 48
    this.setState({
      topOfViewAuto: yOfUser + h + 5,
    })
    let isShow = true
    if (str === '') {
      isShow = false
    } else {
      const arr = this.parseListAddress(SeUser.filterUser(str.toLowerCase(), this.state.userId))
      this.setState({
        dataSearchSource: ds.cloneWithRows(arr),
      })
    }
    this.setState({
      isShowAutoComplete: isShow,
    })
  }

  fetchListUser() {
    SeUser.fetch(this.state.userId).then(list => {
      const listKey = list.sortKey()
      const arr = listKey.map(key => list[key])
      this.setState({
        listUsers: arr,
      })
    })
  }

  /* Handle InfoSection */
  parseListAddress(list) {
    const listKey = list.sortKey()
    return listKey.map(key => list[key])
  }
  onChangeAddressEvent(text) {
    const { yOfAddress, fkClientAppliId } = this.state
    this.setState({
      address: text,
      typeOfAutoFill: 'address',
    })
    const h = Platform.OS === 'ios' ? 68 : 48
    this.setState({
      topOfViewAuto: yOfAddress + h + 5,
    })
    let isShow = true
    if (text === '' || !fkClientAppliId) {
      isShow = false
    } else {
      const arr = this.parseListAddress(
        SeAddress.fetchItemWithFKClientId(this.state.userId, fkClientAppliId, text.toLowerCase())
      )
      this.setState({
        dataSearchSource: ds.cloneWithRows(arr),
      })
      isShow = arr && arr.length > 0
    }
    this.setState({
      isShowAutoComplete: isShow,
    })
  }

  onChangeClientEvent(text) {
    const { yOfClient } = this.state
    this.setState({
      client: text,
      typeOfAutoFill: 'client',
    })
    const h = Platform.OS === 'ios' ? 68 : 48
    this.setState({
      topOfViewAuto: yOfClient + h + 5,
    })
    let isShow = true
    if (text === '') {
      this.setState({
        client: text,
        fkClientAppliId: null,
      })
      isShow = false
    } else {
      text = text.toLowerCase().replace(/\r?\n|\r/g, '');
      const list = SeClient.filterClient(text, this.state.userId)
      const listKey = list.sortKey()
      const arr = listKey.map(key => {
        const item = { ...list[key] }
        item.countAddress = SeAddress.fetchItemWithFKClientId(this.state.userId, item.id, '').length
        return item
      })
      this.setState({
        dataSearchSource: ds.cloneWithRows(arr),
      })

      isShow = arr && arr.length > 0
    }
    this.setState({
      isShowAutoComplete: isShow,
    })
  }

  getPositionOfInput(type, y) {
    if (type === 'client') {
      this.setState({
        yOfClient: y + 40,
      })
    }
    if (type === 'address') {
      this.setState({
        yOfAddress: y + 40,
      })
    }
    if (type === 'user') {
      this.setState({
        yOfUser: y + 120,
      })
    }
  }
  onChooseRow(data) {
    const { isEditClient, typeOfAutoFill } = this.state
    console.log('typeOfAutoFill :' + typeOfAutoFill)
    if (typeOfAutoFill === 'client') {
      if (data.countAddress === 1) {
        const arr = this.parseListAddress(SeAddress.fetchItemWithFKClientId(this.state.userId, data.id, ''))
        console.log('arr[0].id', arr[0].id)
        if (arr.length > 0) {
          this.setState({
            address: [arr[0].adresse, arr[0].codePostal, arr[0].ville].join(' '),
            fkAdresseAppliId: arr[0].id,
          })
        }
      }
      this.setState({
        client: `${data.title} (${data.countAddress} adresses)`,
        fkClientAppliId: data.id,
      })
    }
    if (typeOfAutoFill === 'address') {
      this.setState({
        address: [data.adresse, data.codePostal, data.ville].join(' '),
        fkAdresseAppliId: data.id,
      })
    }
    if (typeOfAutoFill === 'user') {
      this.setState({
        intUserName: data.nom,
        intUserId: data.id,
      })
    }
    this.setState({
      isShowAutoComplete: false,
    })
  }
  renderRowAutoFill(data) {
    const { typeOfAutoFill } = this.state
    let content = ''
    switch (typeOfAutoFill) {
      case 'client':
        content = `${data.title} (${data.countAddress} adresses)`
        break
      case 'address':
        content = [data.adresse, data.codePostal, data.ville].join(' ')
        break
      case 'user':
        content = data.nom
        break
      default:
        content = ''
    }
    return (
      <TouchableOpacity onPress={() => this.onChooseRow(data)}>
        <View>
          <Text
            style={{
              fontSize: 14,
              color: 'black',
              marginLeft: 10,
              marginTop: 10,
            }}
          >
            {content}
          </Text>
          <View style={styles.row_line} />
        </View>
      </TouchableOpacity>
    )
  }
  /* Handle ActionSection */
  /* Handle HoursSection */
  onToggleCheckbox() {
    const { isCompleted, doneHourStart, doneHourEnd } = this.state
    // this.setState({
    //   isCompleted: !isCompleted,
    // })
    // if (this.props.intervention) {
    //   return;
    // }
    const currentTime = moment()
    const currentDate = new Date()
    const currentWorkTime = (currentDate.getHours() > 9 ? currentDate.getHours() : ('0' + currentDate.getHours())) + ':' + (currentDate.getMinutes() > 9 ? currentDate.getMinutes() : ('0' + currentDate.getMinutes()))
    //
    startwork = (!!doneHourStart && doneHourStart !== '') ? doneHourStart : TimeUtills.getTimeJob(InterventionMobx.lastTimeFinishJob) != null ? TimeUtills.getTimeJob(InterventionMobx.lastTimeFinishJob) : '00:00'
    endwork = (!!doneHourEnd && doneHourEnd !== '') ? doneHourEnd : currentWorkTime

    const workTime = (TimeUtills.getTimestamp(endwork) - TimeUtills.getTimestamp(startwork)).toString()
    //console.log("isCompleted:"+this.state.isCompleted);
    if (!isCompleted) {
      this.isChangeWorkingHour = true;
      this.setState({
        isCompleted: !isCompleted,
        planningDateStart: currentTime.format('YYYY-MM-DD'),
        planningDateEnd: currentTime.format('YYYY-MM-DD'),
        planningHourStart: TimeUtills.getTimeJob(InterventionMobx.lastTimeFinishJob),
        planningHourEnd: currentTime.format('HH:mm'),
        planningHour: workTime > 0 ? TimeUtills.getTimeJob(workTime) : '00:00',
        doneHourStart: (!!doneHourStart && doneHourStart !== '') ? doneHourStart : TimeUtills.getTimeJob(InterventionMobx.lastTimeFinishJob) != null ? TimeUtills.getTimeJob(InterventionMobx.lastTimeFinishJob) : '',
        doneHourEnd: (!!doneHourEnd && doneHourEnd !== '') ? doneHourEnd : currentWorkTime,
        doneHour: workTime > 0 ? TimeUtills.getTimeJob(workTime) : '00:00',
        beginTime: `${I18n.t('BEGIN')} ${(!!doneHourStart && doneHourStart !== '') ? doneHourStart : TimeUtills.getTimeJob(InterventionMobx.lastTimeFinishJob) != null ? TimeUtills.getTimeJob(InterventionMobx.lastTimeFinishJob) : ''}`,
        endTime: `${I18n.t('END')} ${(!!doneHourEnd && doneHourEnd !== '') ? doneHourEnd : currentWorkTime}`,

        workTime: `${I18n.t('WORK_TIME')} ${workTime > 0
          ? TimeUtills.getTimeJob(workTime)
          : '00:00'}`,
      })


    } else {
      if (!this.state.isEdit) {
        //console.log("Completed_2")
        // console.log('Completed_2')
        //fix bug not reset data when unchecked

        this.setState({
          isCompleted: !isCompleted,
          doneDateStart: currentTime.format('YYYY-MM-DD'),
          doneDateEnd: currentTime.format('YYYY-MM-DD'),
          doneHourStart: currentTime.format('HH:mm'),
          doneHourEnd: currentTime.format('HH:mm'),
          doneHour: workTime > 0 ? workTime.toDateDurationWithoutSecond() : '00:00',
          doneComment: this.state.planningComment,
          beginTime: `${I18n.t('BEGIN')} ${I18n.t('EMPTY')}`,
          endTime: `${I18n.t('END')} ${I18n.t('EMPTY')}`,
          workTime: `${I18n.t('WORK_TIME')} ${I18n.t('EMPTY')}`

        });
      } else {
        this.setState({
          isCompleted: !isCompleted,

        });
      }
    }
  }

  onShowDatePicker(type, isAction, rowId) {
    const { typeDataPicker, isDatePickerVisible } = this.state
    switch (typeDataPicker) {
      case 'begin':
        if (this.state.doneDateStart) {
          this.currentDate = moment(this.state.doneDateStart)
        }
        break;
      case 'end':
        if (this.state.doneDateEnd) {
          this.currentDate = moment(this.state.doneDateStart)
        }
        break;

    }
    this.setState({
      typeDataPicker: type,
      isDatePickerVisible: !isDatePickerVisible,
    })
  }
  onShowCalendar(type, isAction, rowId) {
    const { typeDataPicker, isDateTimePickerVisible } = this.state
    if (isAction) {
      this.setState({
        isShowOfAction: isAction,
        currentTaskId: rowId,
        isDateTimePickerVisible: !isDateTimePickerVisible,
      })
    } else {
      this.setState({
        typeDataPicker: type,
        isDateTimePickerVisible: !isDateTimePickerVisible,
      })
    }
  }
  onResetWorkTime = () => {
    const { doneHourStart, doneHourEnd } = this.state
    const workTimeStamp = (TimeUtills.getTimestamp(doneHourEnd) - TimeUtills.getTimestamp(doneHourStart)).toString()
    workTime = '00:00'
    if (workTimeStamp && !isNaN(workTimeStamp)) {
      workTime = TimeUtills.getTimeJob(workTimeStamp);
    }
    // console.log('doneHour => '+workTime)
    this.isChangeWorkingHour = true
    this.setState({
      workTime: `${I18n.t('WORK_TIME')}: ${workTime}`,
      doneHour: workTime,
    })

  }
  /* Handle MediaSection */
  fetchImagesEdit(accountId, interventionId) {
    SeMediaLink.fetchByAccountAndIntervention(accountId, interventionId).then(list => {
      // console.log('ListMediaLink : ' + JSON.stringify(list))
      const listKey = list.sortKey()
      const listMediaLink = listKey.map(key => list[key])
      if (listMediaLink.length > 0) {
        arr = []
        listMediaLink.forEach(mediaLink => {
          SeMedia.fetchByAccountAndId(accountId, mediaLink['fkMediaAppliId']).then(listMedia => {
            const listKeyMedia = listMedia.sortKey()
            const arrMedia = listKeyMedia.map(key => listMedia[key])
            arrMedia.forEach(media => arr.push(media))
            return;
          }).then(() => {
            if (arr.length > 0) {
              this.setState({
                dataSource: arr,
              })
            }
          });
        })
      }
    })
  }
  onSelectAddress(data) {
    //if (typeOfAutoFill === 'client') {
    //if (data.countAddress === 1) {

    this.setState({
      address: [data.adresse, data.codePostal, data.ville].join(' '),
      fkAdresseAppliId: data.id,
      client: data.client.title,
      fkClientAppliId: data.client.id,
    })


    //}
    DialogManager.dismiss();
  }
  renderItemAddress(data) {
    const { client } = data;
    clientname = [client.title, client.nom].join(' ')

    const content = [data.adresse, '#' + data.codePostal + '\n', data.distance + 'Km'].join(' ');
    return (
      <TouchableOpacity onPress={() => this.onSelectAddress(data)}>
        <View>
          <Text
            style={{
              fontSize: 18,
              color: 'black',
              marginLeft: 5,
              marginTop: 5,
            }}
          >
            {clientname}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: 'black',
              marginLeft: 5,
              marginTop: 5,
            }}
          >
            {content}
          </Text>
          <View style={styles.row_line} />
        </View>
      </TouchableOpacity>
    )
  }

  showDialogAddressSuggestion() {
    const show = (this.dataAddress.getRowCount() !== 0);

    DialogManager.show({
      // title: I18n.t('NEAR_BY_ADDRESS'),
      // titleAlign: 'center',
      animationDuration: 200,
      width: 0.8,
      ScaleAnimation: new ScaleAnimation(),
      children: (
        <DialogContent >
          <Text
            style={{
              fontSize: 18,
              color: 'blue',
              marginBottom: 8
            }}> {I18n.t('NEAR_BY_ADDRESS')}</Text>
          <View style={{
            height: 1,
            backgroundColor: 'green',
          }} />

          {show && <ListView
            enableEmptySections
            dataSource={this.dataAddress}
            renderRow={rowData => this.renderItemAddress(rowData)}
          />}
          {
            !show && <Text style={{
              fontSize: 16,
              color: 'black',
              marginTop: 10,
              marginBottom: 8
            }} >{I18n.t('NO_ADDRESS_FOUND')}</Text>
          }
        </DialogContent>
      ),
    }, () => {
      console.log('callback - show');
    });
  }
  deleteMedia(id) {
    SeMedia.insert(id, 1)
  }

  onSaveNewOnSignature(rs, path) {
    const { userId } = this.state
    const data = {
      accountId: userId,
      fileData: rs,
      filePath: path,
    }
    SeMedia.insert(data).then(item => {
      const { dataSource, modalVisible } = this.state
      const arr = dataSource.slice()
      arr.push(item)
      this.setState({
        dataSource: arr,
        modalVisible: !modalVisible,
      })
    })
  }

  saveNewItemToGrid(rs, path) {
    const { dataSource, userId } = this.state
    const data = {
      accountId: userId,
      filePath: path,
      fileData: rs,
    }
    SeMedia.insert(data).then(item => {
      const arr = dataSource.slice()
      arr.push(item)
      this.setState({
        dataSource: arr,
      })
    })
  }

  removeItemMedia(index, item) {
    const { dataSource } = this.state
    SeMedia.insert(item.id, 1)
    const arr = dataSource.slice()
    arr.splice(index, 1)
    this.setState({
      dataSource: arr,
    })
  }

  selectPhotoFromLibrary() {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true,
        waitUntilSaved: true,
      },
    }
    ImagePicker.launchImageLibrary(options, response => {
      // console.log('Response = ', response)

      if (response.didCancel) {
        // console.log('User cancelled photo picker')
      } else if (response.error) {
        // console.log('ImagePickerưError: ', response.error)
      } else if (response.customButton) {
        // console.log('User tapped custom button: ', response.customButton)
      } else {
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        this.saveNewItemToGrid(response.data, response.uri)
      }
    })
  }

  selectPhotoFromCamera() {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true,
        waitUntilSaved: true,
      },
    }

    ImagePicker.launchCamera(options, response => {
      // console.log('Response = ', response)

      if (response.didCancel) {
        // console.log('User cancelled photo picker')
      } else if (response.error) {
        // console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        // console.log('User tapped custom button: ', response.customButton)
      } else {
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        this.saveNewItemToGrid(response.data, response.uri)
      }
    })
  }

  onShowError(textError) {
    return Toast.show({
      duration: 3000,
      text: textError,
      position: 'bottom',
      supportedOrientations: ['Potrait', 'Landscape'],
    })
  }
  valid() {
    const {
      client,
      address,
      planningHourStart,
      planningHourEnd,
      planningHour,
      dataSource,
      isEdit,
      title,
    } = this.state

    const strError = []
    !client && !isEdit && strError.push(`- ${I18n.t('ERROR_CLIENT_EMPTY')}`)
    !address && !isEdit && strError.push(`- ${I18n.t('ERROR_ADDRESS_EMPTY')}`)
    return strError.join('\n')
  }

  onUpdateIntervention() {
    const {
      latitude,
      longitude,
      planningDateStart,
      planningDateEnd,
      planningHourStart,
      planningHourEnd,
      planningHour,
      planningComment,
      doneDateStart,
      doneDateEnd,
      doneHourStart,
      doneHourEnd,
      doneHour,
      doneComment,
      dataSource,
      userId,
      fkFilialeAppliId,
      isCompleted,
      currentComment,
      dataProducts
    } = this.state
    const msgError = this.valid()
    if (msgError !== '') {
      this.onShowError(msgError)
      return
    }
    const isDone = isCompleted ? 1 : 0;
    const data = { ...this.state.itemIntervention }
    data.accountId = userId
    // data.planningDateStart = planningDateStart
    // data.planningDateEnd = planningDateEnd
    // data.planningHourStart = planningHourStart
    // data.planningHourEnd = planningHourEnd
    // data.planningHour = planningHour
    // data.planningComment = planningComment
    // data.doneDateStart = isDone ? planningDateStart : doneDateStart
    // data.doneDateEnd = isDone ? planningDateEnd : doneDateEnd
    // data.doneHourStart = isDone ? planningHourStart : doneHourStart
    // data.doneHourEnd = isDone ? planningHourEnd : doneHourEnd
    // data.doneHour = isDone ? planningHour : doneHour
    // data.doneComment = isDone ? planningComment : doneComment
    if (this.isChangeDate) {
      if (doneDateStart) {
        data.doneDateStart = doneDateStart
      }
      if (doneDateEnd) {
        data.doneDateEnd = doneDateEnd
      }
    }
    //data.doneDateStart = planningDateStart ? 
    //data.doneDateEnd = planningDateEnd
    if (this.isChangeWorkingHour) {
      if (doneHourStart) {
        data.doneHourStart = doneHourStart
      }
      if (doneHourEnd) {
        data.doneHourEnd = doneHourEnd
      }
      if (doneHour) {
        data.doneHour = doneHour
      }
    }

    data.doneComment = currentComment
    data.nom = this.state.title
    data.isDone = 0
    data.fkFilialeAppliId = fkFilialeAppliId
    data.listCurrentProduct = dataProducts

    SeIntervention.toggleDone(data, data.isDone).then(res => {
      //console.log('ToggledIntervention : ' + JSON.stringify(this.state.intervention))
      this.state.intervention = { ...this.state.intervention, ...res }
      //console.log('ToggledIntervention : ' + JSON.stringify(this.state.intervention))

      const newIntervention = { ...res }
      newIntervention.isDone = this.state.isCompleted ? 1 : 0
      newIntervention.doneDateStart = data.doneDateStart
      newIntervention.doneDateEnd = data.doneDateEnd
      if (SettingMobx.isEnableGPS && newIntervention.isDone == 1 && newIntervention.isDone != this.props.intervention.isDone) {
        newIntervention.doneLongitude = String(this.state.longitude)
        newIntervention.doneLatittude = String(this.state.latitude)
      }
      newIntervention.listCurrentProduct = dataProducts
      //console.log('newIntervention'+JSON.stringify(newIntervention))
      SeIntervention.update(
        newIntervention,
        dataSource,
        this.state.dataSpeaker,
        // this.state.listUsers,
        this.state.listTasks,
        this.state.listUnites
      )
        .then(item => {
          InterventionMobx.onUpdate(item)
          DeviceEventEmitter.emit('refresh')
          Actions.pop()
          // Actions.pop({ refresh: { intervention: item } })
        })
        .catch(err => {


        })
      // InterventionMobx.onUpdate(res)
      // DeviceEventEmitter.emit('refresh')
    })
  }

  onAddNewIntervention() {
    const {
      latitude,
      longitude,
      planningHourStart,
      planningHourEnd,
      planningHour,
      planningDateStart,
      planningDateEnd,
      fkClientAppliId,
      planningComment,
      fkAdresseAppliId,
      client,
      address,
      dataSource,
      userId,
      isCompleted,
      fkFilialeAppliId,
      //
      doneDateStart,
      doneDateEnd,
      doneHourStart,
      doneHourEnd,
      doneHour,
      doneComment,
      //
      currentComment,
      // 
      dataProducts
    } = this.state
    const { currentUser } = UserMobx
    const msgError = this.valid()
    if (msgError !== '') {
      this.onShowError(msgError)
      return
    }
    // alert(JSON.stringify(this.state.listTasks))
    // alert(JSON.stringify(this.state.listUnites))

    const name = this.state.title || '' // || [currentUser.u_prenom, currentUser.u_nom].join(' ')
    const isDone = isCompleted ? 1 : 0;
    data = {};
    if (isDone === 1) {

      data = {
        accountId: userId,
        fkUserAppliId: '',
        fkParentApplId: '',
        fkClientAppliId,
        fkAdresseAppliId,
        nom: name,
        priority: 2,
        // planningDateStart: moment().format('YYYY-MM-DD, h:mm:ss a'),
        // planningDateEnd: moment().format('YYYY-MM-DD, h:mm:ss a'),
        isDone: isCompleted ? 1 : 0,
        // planningHourStart,
        // planningHourEnd,
        // planningHour,
        // planningComment,
        // doneDateStart,
        // doneDateEnd,
        doneDateStart,
        doneDateEnd,
        doneHourStart,
        doneHourEnd,
        doneHour,
        doneLongitude: SettingMobx.isEnableGPS ? String(this.state.longitude) : '',
        doneLatittude: SettingMobx.isEnableGPS ? String(this.state.latitude) : '',
        doneComment: currentComment,
        fkFilialeAppliId,
        parentId: currentUser.u_uuid,
        //fkUserServerlId:parseInt(currentUser.u_id,10)
      }
    } else {
      data = {
        accountId: userId,
        fkUserAppliId: '',
        fkParentApplId: '',
        fkClientAppliId,
        fkAdresseAppliId,
        nom: name,
        priority: 2,
        // planningDateStart: moment().format('YYYY-MM-DD, h:mm:ss a'),
        // planningDateEnd: moment().format('YYYY-MM-DD, h:mm:ss a'),
        isDone: isCompleted ? 1 : 0,
        planningDateStart,
        planningDateEnd,
        planningHourStart,
        planningHourEnd,
        planningHour,
        planningComment: currentComment,

        doneDateStart,
        doneDateEnd,
        doneHourStart,
        doneHourEnd,
        doneHour,
        fkFilialeAppliId,
        parentId: currentUser.u_uuid,
        //fkUserServerlId: parseInt(currentUser.u_id,10)
      }
    }
    data.listCurrentProduct = dataProducts
    SeIntervention.insert(
      data,
      client,
      {
        accountId: userId,
        adresse: address,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      },
      dataSource,
      this.state.dataSpeaker,
      // this.state.listUsers,
      this.state.listTasks,
      this.state.listUnites
    )
      .then(items => {
        // console.log('AddedIntervention : ' + JSON.stringify(items))
        InterventionMobx.onAddNew(items)
        DeviceEventEmitter.emit('refresh')
        Actions.pop()
      })
      .catch(err => {
        console.log('errrorrr' + err)
      })
  }

  _keyboardDidHide() {
    // this.setState({
    //   isShowAutoComplete: false,
    // });
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition(
      position => {
        const accountId = parseInt(UserMobx.currentUser.u_id, 10);
        const startPoint = { latitude: position.coords.latitude, longitude: position.coords.longitude }

        const dataAdress1 = SeAddress.fetchItemWithLongLat(accountId, startPoint, 1000.0);
        console.log('validAddress.length' + dataAdress1.length)
        if (dataAdress1) {
          this.dataAddress = ds.cloneWithRows(dataAdress1);
        }
        this.setState({
          isEnableGPS: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })

      },
      error => this.setState({ error: error.message, isEnableGPS: false }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    )
  }
  /* Main View */
  addSpeaker() {
    const { intUserName, intUserId } = this.state
    if (intUserName === '') {
      this.onShowError(I18n.t('ERROR_EMPTY_TEXT'))
    } else {
      const { dataSpeaker } = this.state
      if (dataSpeaker.length >= 4) {
        this.onShowError('Maximum 4 personne')
      } else {
        const arr = dataSpeaker.slice()
        arr.push({ name: intUserName, id: intUserId })
        this.setState({
          dataSpeaker: arr,
          intUserName: '',
        })
      }
    }
  }
  removeSpeaker(id) {
    const { dataSpeaker } = this.state
    const arr = dataSpeaker.slice()
    arr.forEach((item, index) => {
      if (item.id === id) {
        arr.splice(index, 1)
      }
    })
    this.setState({
      dataSpeaker: arr,
    })
  }
  onToggleModal() {
    const { modalVisible } = this.state
    this.setState({
      modalVisible: !modalVisible,
    })
  }
  renderItemIntervant(rowData) {
    return (
      <View>
        <Text>{rowData}</Text>
        <View style={styles.intervenatTab_line} />
      </View>
    )
  }
  renderOverlay() {
    const { topOfViewAuto, isShowAutoComplete } = this.state
    const shouldShowOverlay = isShowAutoComplete && this.state.dataSearchSource && this.state.dataSearchSource.getRowCount() > 0
    return (
      <View
        style={
          shouldShowOverlay ? [styles.overlay, { top: topOfViewAuto }] : styles.hidden_overlay
        }
      >
        <ListView
          enableEmptySections
          dataSource={this.state.dataSearchSource}
          renderRow={rowData => this.renderRowAutoFill(rowData)}
        />
      </View>
    )
  }

  setTimeTask(timeTask) {
    const { listTasks } = this.state
    listTasks.forEach(item => {
      if (item.id === this.state.currentTaskId) {
        item.time = timeTask
      }
    })
    this.setState({
      listTasks,
    })
  }

  toggleTaskCheckbox(taskId) {
    const { listTasks, planningHour } = this.state
    let index = listTasks.filter(item => item.isSelect).length
    listTasks.forEach(item => {
      if (item.id === taskId) {
        item.isSelect = !item.isSelect
        if (index == 0 && item.time == '00:00') {
          item.time = planningHour
          index += 1
        }
      }
    })
    this.setState({
      listTasks,
    })
  }

  _onUniteTextChange(data) {
    const { listUnites } = this.state
    listUnites.forEach(item => {
      if (item.id === data.id) {
        item.value = data.value
      }
    })
    this.setState({
      listUnites,
    })
  }

  onDateTimePicked(date) {
    const { typeDataPicker } = this.state
    const y = moment(date).format('YYYY')
    const m = moment(date).format('MM')
    const d = moment(date).format('DD')
    switch (typeDataPicker) {
      case 'begin':
        this.setState({
          beginDate: `${I18n.t('BEGIN')}: ${y}-${m}-${d}`,
          doneDateStart: `${y}-${m}-${d}`,
        })
        this.isChangeDate = true
        break
      case 'end':
        this.setState({
          endDate: `${I18n.t('END')}: ${y}-${m}-${d}`,
          doneDateEnd: `${y}-${m}-${d}`,
        })
        this.isChangeDate = true
        break
    }

    this.onHideDatePicker()
  }

  onDatePicked(date) {
    const { typeDataPicker, isShowOfAction } = this.state
    let h = moment(date).format('kk')
    const m = moment(date).format('mm')
    if (h == 24) {
      h = 0;
    }
    if (isShowOfAction) {
      this.setTimeTask(`${h}:${m}`)
      this.setState({ isShowOfAction: false })
    } else {
      switch (typeDataPicker) {
        case 'begin':
          this.isChangeWorkingHour = true
          this.setState({
            beginTime: `${I18n.t('BEGIN')}: ${h}:${m}`,
            beginTimeCalc: `${h}:${m}`,
            doneHourStart: `${h}:${m}`,
          })
          break
        case 'end':
          this.isChangeWorkingHour = true
          this.setState({
            endTime: `${I18n.t('END')}: ${h}:${m}`,
            endTimeCalc: `${h}:${m}`,
            doneHourEnd: `${h}:${m}`,
          })
          break
        case 'work':
          this.isChangeWorkingHour = true
          this.setState({
            workTime: `${I18n.t('WORK_TIME')}: ${h}:${m}`,
            doneHour: `${h}:${m}`,
          })
          break
        default:
          break
      }
    }

    this.onHideDateTimePicker()
  }
  onHideDatePicker() {
    this.setState({ isDatePickerVisible: false })
  }
  onHideDateTimePicker() {
    this.setState({ isDateTimePickerVisible: false })
  }
  renderHeader(name) {
    return (
      <View style={styles.view_title}>
        <View style={styles.view_title_1}>
          <Label style={styles.text_title}>{I18n.t(name)}</Label>
        </View>
      </View>
    )
  }
  renderModal() {
    return (
      <View>
        <Modal
          animationType={'none'}
          visible={this.state.modalVisible}
          onRequestClose={() => console.log('modal close')}
        >
          <SigntureView
            saveSignature={this.onSaveNewOnSignature}
            dismissModal={this.onToggleModal.bind(this)}
          />
        </Modal>
      </View>
    )
  }
  toggleFiliale() {
    this.setState({
      isShowFilialeModal: !this.state.isShowFilialeModal,
    })
  }

  _onChangeTitle(title) {
    this.setState({
      title,
    })
  }

  _onChangeFaliale(data) {
    // console.log('KeyFil : ' + data.serverId + " ~~~> " + (this.fkFilialeServerId != data.serverId))
    if (this.fkFilialeServerId != data.serverId) {
      this.setState({
        isShowFilialeModal: !this.state.isShowFilialeModal,
        nameFiliale: data.nom,
        fkFilialeAppliId: data.id,
        fkFilialeServerId: data.serverId,
        listTasks: data.serverId != -1 ? this.state.listRootTasks.filter((item) => item.filialeServerKey == data.serverId) : this.state.listRootTasks,
        listUnites: data.serverId != -1 ? this.state.listRootUnites.filter((item) => item.filialeServerKey == data.serverId) : this.state.listRootUnites
      })
    } else {
      this.setState({
        isShowFilialeModal: !this.state.isShowFilialeModal,
        nameFiliale: data.nom,
        fkFilialeAppliId: data.id,
        fkFilialeServerId: data.serverId,
      })
    }
  }

  renderItemFiliale(data) {
    return (
      <TouchableOpacity onPress={this._onChangeFaliale.bind(this, data)}>
        <View style={styles.btn_view}>
          <Text style={styles.btn_text}>{data.nom}</Text>
        </View>
      </TouchableOpacity>
    )
  }
  fetchListFiliale() {
    SeFiliale.fetch(this.state.userId)
      .then(list => {
        // console.log('ListFiliale : ' + JSON.stringify(list))
        list.splice(0, 0, { nom: this.state.subDomain, id: null, serverId: -1 })
        if (this.state.fkFilialeAppliId) {
          this.setNameFiliale(list)
        }
        this.setState({
          listFiliale: list,
          dataSourceFiliale: ds.cloneWithRows(list),
        })
      })
      .catch(console.log)
  }

  setNameFiliale(filialeList) {
    let nameFiliale = filialeList[0].nom
    filialeList.forEach(filiale => {
      if (filiale.id == this.state.fkFilialeAppliId) {
        nameFiliale = filiale.nom
      }
    })
    this.setState({
      nameFiliale,
    })
  }

  fetchListTasks() {
    SeTask.fetch(this.state.userId)
      .then(list => {
        // console.log('ListTask : ' + JSON.stringify(list))
        const listKey = list.sortKey().sort()
        const listTasks = listKey.map(key => {
          const temp = { ...list[key] }
          temp.isSelect = false
          temp.time = '00:00'
          this.state.linkInterventionTasks.forEach(item => {
            console.log('TaskItem : ' + JSON.stringify(item))
            if (temp.id === item.fkTaskAppliId) {
              //todo check it 
              console.log('TaskItemMatched : ' + JSON.stringify(item))
              temp.isSelect = true
              if (item.doneMinute != -1 && item.doneMinute != -10)
                temp.time = moment.utc(item.doneMinute * 1000).format('mm:ss')
              if (item.doneMinute == 0 || item.doneMinute == -10)
                temp.isSelect = false
              temp.planningMinute = item.planningMinute
            }
          })
          return temp
        })
        this.setState({
          listTasks: listTasks,
          listRootTasks: listTasks,
        })
      })
      .catch(console.log)
  }

  renderModalFiliale() {
    return (
      <ModalCustom
        style={styles.modalFilliale}
        position={'absolute'}
        isOpen={this.state.isShowFilialeModal}
        swipeToClose={false}
        onRequestClose={() => console.log('modal close')}
      >
        <ListView
            enableEmptySections
            style={{ marginTop: 10 }}
            dataSource={this.state.dataSourceFiliale}
            renderRow={filiale => this.renderItemFiliale(filiale)}
          />
      </ModalCustom>
    )
  }
  _searchProducts = () => {
    Actions.fetchProducts()
  }

  renderItemProduct(product) {
    return (
      <TouchableOpacity onPress={() => this.selectedProduct(product)}>
        <View>
          <Text
            style={{
              fontSize: 18,
              color: 'black',
              marginLeft: 5,
              marginTop: 5,
            }}
          >
            {product.nom}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  _fetchProduct = (nom) => {
    // from network
    ServiceSync.findProductWithNom(nom).then(results => {
      this.setState({
        listProducts: results
      })
    })
  }

  selectedProduct(product) {
    this.setState({
      productSelected: product
    })
  }

  _addProduct = (quantity) => {
    const { productSelected, listCurrentProduct } = this.state
    productSelected.quantitySelected = quantity
    listCurrentProduct.push({ productSelected })
    this.setState({
      listCurrentProduct: listCurrentProduct,
      productSelected: null
    })
  }

  _removeProduct = (proId) => {
    const { dataProducts } = this.state
    const arr = dataProducts.slice()
    arr.forEach((item, index) => {
      if (item.id == proId) {
        arr.splice(index, 1)
      }
    })
    this.setState({
      dataProducts: arr,
    })
  }

  renderBody() {
    const scrollView = {
      style: styles.scrollview,
      contentContainerStyle: styles.scrollview,
    }
    const {
      dataSource,
      dataSpeaker,
      dataProducts,
      beginTime,
      endTime,
      beginDate,
      endDate,
      workTime,
      client,
      address,
      planningComment,
      isEdit,
      isCompleted,
      dataSourceFiliale,
      isAllowClientAddress,
      isAddSpeeker,
      isShowTitle,
      isEditDate,
      isEditTime,
      listUnites,
      doneComment,
      currentComment,
      itemIntervention,
    } = this.state
    const disabledFiliale = !dataSourceFiliale || dataSourceFiliale.getRowCount() === 0
    // console.log(
    //   'Client : ' + client +'\nAddress : ' + address
    // )
    // const comment = itemIntervention ? doneComment : planningComment;
    return (

      <ScrollView {...scrollView} onLayout={this.onLayoutScroll}>
        <View style={{ flex: 1 }} onLayout={this.onLayoutView}>
          {(!!isAllowClientAddress || !isEdit) && <InforSub
            client={client}
            address={address}
            isEnableGPS={this.state.isEnableGPS}
            onChangeClientEvent={this.onChangeClientEvent}
            onChangeAddressEvent={this.onChangeAddressEvent}
            getPositionOfInput={this.getPositionOfInput}
            showDialogAddressSuggestion={this.showDialogAddressSuggestion.bind(this)}
          />}
          {!!isAddSpeeker && <IntervantSection
            userId={this.state.userId}
            intUserName={this.state.intUserName}
            dataSpeaker={dataSpeaker}
            addSpeaker={this.addSpeaker.bind(this)}
            removeSpeaker={this.removeSpeaker.bind(this)}
            filterIntervant={this.filterIntervant.bind(this)}
            getPositionOfInput={this.getPositionOfInput}
          />}

          {!!isEditDate && <DateSection
            onShowDatePicker={this.onShowDatePicker.bind(this)}
            beginTime={beginDate}
            endTime={endDate}
          />}
          {!!isEditTime && <HoursSection
            onShowCalendar={this.onShowCalendar.bind(this)}
            onToggleCheckbox={this.onToggleCheckbox.bind(this)}
            onResetWorkTime={this.onResetWorkTime}
            beginTime={beginTime}
            endTime={endTime}
            workTime={workTime}
            isDone={isCompleted}
          />}
          <Filiale
            userId={this.state.userId}
            toggleFiliale={this.toggleFiliale.bind(this)}
            disabled={disabledFiliale}
            nameFiliale={this.state.nameFiliale}
            fkFilialeAppliId={this.state.fkFilialeAppliId}
          />
          {!!isShowTitle && <TitleSection title={this.state.title} onChangeTitle={this._onChangeTitle.bind(this)} />}
          {!!(listUnites && Object.keys(listUnites).length > 0) && <UniteSection
            userId={this.state.userId}
            listUnites={listUnites}
            onChangeText={this._onUniteTextChange.bind(this)}
          />}
          <TaskSection
            listTasks={this.state.listTasks}
            onShowCalendar={this.onShowCalendar.bind(this)}
            onToggleCheckbox={this.toggleTaskCheckbox.bind(this)}
          />
          <SectionProduct
            // userId={this.state.userId}
            // intUserName={this.state.intUserName}
            dataProducts={dataProducts}
            searchProducts={this._searchProducts.bind(this)}
            removeProduct={this._removeProduct.bind(this)}
          // filterIntervant={this.filterIntervant.bind(this)}
          // getPositionOfInput={this.getPositionOfInput}
          />
          <MediaSection
            onToggleModal={this.onToggleModal.bind(this)}
            selectPhotoFromCamera={this.selectPhotoFromCamera.bind(this)}
            selectPhotoFromLibrary={this.selectPhotoFromLibrary.bind(this)}
            dataSource={dataSource}
            removeItemMedia={this.removeItemMedia.bind(this)}
          />
          <View>
            {this.renderHeader('COMMENT')}

            <View style={styles.comment_input_view}>
              <TextInput
                multiline
                numberOfLines={4}
                style={styles.comment_input}
                value={currentComment}
                returnKeyLabel='Done'
                returnKeyType='done'
                onSubmitEditing={Keyboard.dismiss}
                onChangeText={text =>
                  this.setState({
                    currentComment: text,
                  })}
                underlineColorAndroid="transparent"
              />
            </View>

          </View>
          <Button
            onPress={() => {
              if (this.state.isEdit) {
                this.onUpdateIntervention()
              } else {
                this.onAddNewIntervention()
              }
            }}
            style={styles.btn_Add}
            block
          >
            <Text>{I18n.t('ADD')}</Text>
          </Button>
        </View>
      </ScrollView>

    )
  }
  renderCalendarDate() {
    const dateTimePicker = {
      cancelTextIOS: I18n.t('DATETIMEPICKER_CANCEL'),
      confirmTextIOS: I18n.t('DATETIMEPICKER_CONFIRM'),
      titleIOS: I18n.t('DATETIMEPICKER_TITLE'),
    }
    let doneDateStart = this.state.doneDateStart
    let doneDateEnd = this.state.doneDateEnd

    if (this.state.typeDataPicker == 'begin') {
      if (!doneDateStart || doneDateStart == '') {
        doneDateStart = new Date()
      } else {
        doneDateStart = new Date(doneDateStart)
      }
      return (
        <DateTimePicker
          {...dateTimePicker}
          onConfirm={this.onDateTimePicked}
          onCancel={this.onHideDatePicker}
          isVisible={this.state.isDatePickerVisible}
          date={doneDateStart}
          mode="date"
        />
      )
    } else {
      if (!doneDateEnd || doneDateEnd == '') {
        doneDateEnd = new Date()
      } else {
        doneDateEnd = new Date(doneDateEnd)
      }
      return (
        <DateTimePicker
          {...dateTimePicker}
          onConfirm={this.onDateTimePicked}
          onCancel={this.onHideDatePicker}
          isVisible={this.state.isDatePickerVisible}
          date={doneDateEnd}
          mode="date"
        />
      )
    }
  }
  renderCalendar() {
    const dateTimePicker = {
      cancelTextIOS: I18n.t('DATETIMEPICKER_CANCEL'),
      confirmTextIOS: I18n.t('DATETIMEPICKER_CONFIRM'),
      titleIOS: I18n.t('DATETIMEPICKER_TITLE'),
    }
    //render datepicker 
    const {
      typeDataPicker,
      doneHourStart,
      doneHourEnd,
      doneHour,
    } = this.state

    let datetime = new Date();
    const y = moment(datetime).format('YYYY')
    const m = moment(datetime).format('MM')
    const d = moment(datetime).format('DD')
    //console.log('worktime'+typeDataPicker)
    switch (typeDataPicker) {
      case 'begin':
        if (!!doneHourStart && doneHourStart != '') {
          //TODO 
          arrTime = doneHourStart.split(':');
          if (arrTime.length == 2) {
            datetime = new Date(y, m, d, arrTime[0], arrTime[1])
          }
        }
        break;
      case 'end':
        if (!!doneHourEnd && doneHourEnd != '') {
          arrTime = doneHourEnd.split(':');
          if (arrTime.length == 2) {
            datetime = new Date(y, m, d, arrTime[0], arrTime[1])
          }
        }
        //TODO 
        break;
      case 'work':
        console.log('workTime' + doneHour)
        if (!!doneHour && doneHour != '') {
          arrTime = doneHour.split(':');
          if (arrTime.length == 2) {
            datetime = new Date(y, m, d, arrTime[0], arrTime[1])
          }
        }
        //TODO 
        break;
    }
    return (
      <DateTimePicker
        {...dateTimePicker}
        onConfirm={this.onDatePicked}
        onCancel={this.onHideDateTimePicker}
        isVisible={this.state.isDateTimePickerVisible}
        date={datetime}
        mode="time"
        is24Hour={true}
      />
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
        {/* {this.state.isEnableGPS && <Right>
          <Button transparent onPress={() => this.getLocation()}>
            <Image
              source={locationIcon}
              style={[styles.organilogIcon, { width: 25, height: 25 }]}
            />
          </Button>
       </Right> } */}
      </Header>
    )
  }
  render() {
    return (
      // <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">

      <Container style={styles.container} collapsable={false}>
        <KeyboardAwareScrollView >
          {this.renderHeaderMain()}
          {this.renderBody()}
          {this.renderModal()}
          {this.renderCalendar()}
          {this.renderCalendarDate()}
          {this.renderOverlay()}
          {this.renderModalFiliale()}
        </KeyboardAwareScrollView>

      </Container>

    )
  }
}

export default CreateIntervention
