import React, { Component, PropTypes } from 'react'
import { Text, Image, TouchableOpacity } from 'react-native'
import {
  Container,
  Header,
  Left,
  Content,
  ListItem,
  Button,
  List,
  View,
} from 'native-base'
import I18n from 'react-native-i18n'
import { Actions } from 'react-native-router-flux'
import { phonecall } from 'react-native-communications'
import IconBack from '../../../themes/IconBack'

import { componentStyles } from '../../../styles'
import styles from './styles'
import { mapFieldDetail as mapField } from '../../../services/table/client'
import AddressService from '../../../services/address'
import SettingMobx from '../../../mobxs/setting'
import AppLinking from '../../../utils/AppLinking'


const organilogIcon = require('../../../../images/organilog-logo-color.png')

class ClientDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      address: []
    }
    this.renderItem = this.renderItem.bind(this)
    this.keyPhone = ['PHONE_FIXE', 'PHONE_MOBILE', 'PHONE_PRO']
  }

  componentWillMount() {
    const { client } = this.props
    AddressService.fetchByClient(client.accountId, client).then(listAddress => {
      this.setState({
        address: listAddress
      })
    })
  }

  withFontSize(style, percent = 1) {
    const fontSize = this.props.fontSize * percent
    return { ...style, fontSize }
  }

  _sendMailToClient = (clientEmail) => {
    // console.log('EmailTo : ' + JSON.stringify(clientEmail))
    AppLinking.sendMail(clientEmail)
  }

  renderItem(key, value, index) {
    const property = mapField[key]
    if (!property || !!!value || value === '0') return null
    const isPhone = this.keyPhone.includes(property)
    const isEmail = key === 'email'
    const label = isPhone ? I18n.t('PHONE_CALL') : I18n.t(mapField[key])
    return (
      <ListItem key={index} style={styles.item}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'center' }}>
          <Text style={styles.label}>
            {`${label}:`}
          </Text>
          {(isPhone || isEmail) &&
            <TouchableOpacity onPress={() => (isEmail ? this._sendMailToClient(value) : phonecall(value, false))}>
              <Text style={styles.valSpecial}>
                {value}
              </Text>
            </TouchableOpacity>
          }
          {!(isPhone || isEmail) &&
            <Text>
              {value}
            </Text>
          }
        </View>
      </ListItem>
    )
  }

  renderAddress() {
    const { address } = this.state
    // const cloneAddress = { ...addressData }
    return (
      <List style={{ ...styles.list, ...styles.last }}>
        <ListItem key={-2} style={styles.itemHeader}>
          <Text style={styles.itemHeaderText}>
            {I18n.t('ADDRESSES')}
          </Text>
        </ListItem>
        <ListItem key={-1} style={styles.listItemHeader}>
          <View style={[styles.headerBarTable, { flex: 1, flexDirection: 'row' }]}>
            <Text style={[this.withFontSize(styles.headerLabelTable, 1), { flex: 4 }]}>
              {I18n.t('LB_STREET')}
            </Text>
            <View style={styles.separateVerticalRow}/>
            <Text style={[this.withFontSize(styles.headerLabelTable, 1), { flex: 3 }]}>
              {`${I18n.t('CODEPOSTAL')}`}
            </Text>
            <View style={styles.separateVerticalRow}/>
            <Text style={[this.withFontSize(styles.headerLabelTable, 1), { flex: 3 }]}>
              {`${I18n.t('VILLE')}`}
            </Text>
          </View>
        </ListItem>
        {Object.keys(address).map((key, index) =>
          this.renderItemAddress(address[key], index + 1)
        )}
      </List>
    )
  }

  renderItemAddress(addressData, index) {
    if (!addressData) return null
    // const { isDone, planningDateStart, doneDateStart, planningComment, doneComment } = address;
    // const statusUI = isDone == 1 ? I18n.t('YES') : I18n.t('NO')
    // const dateUI = isDone == 1 ? (doneDateStart ? doneDateStart : '') : (planningDateStart ? planningDateStart : '')
    // const commentUI = isDone == 1 ? doneComment : planningComment
    // const cloneAddress = { ...addressData }
    const { adresse, codePostal, ville } = addressData
    return (
      <ListItem key={index} style={styles.listItem} onPress={() => Actions.addressDetail({ address: addressData, fontSize: SettingMobx.fontSize })}>
        <View style={[styles.rowTable, { flex: 1, flexDirection: 'row' }]}>
          <Text style={[this.withFontSize(styles.tableValLength, 1), { flex: 4 }]}>
            {adresse}
          </Text>
          <View style={styles.separateVerticalRow}/>
          <Text style={[this.withFontSize(styles.tableValShort, 1), { flex: 3 }]}>
            {`${codePostal}`}
          </Text>
          <View style={styles.separateVerticalRow}/>
          <Text style={[this.withFontSize(styles.tableValLength, 1), { flex: 3 }]}>
            {`${ville}`}
          </Text>
        </View>
      </ListItem>
    )
  }

  render() {
    const value = I18n.t('ADD_AN_INTERVENTION')
    const { client } = this.props
    const { id, code, prenom, nom, title } = client
    const civilite = [I18n.t('MR'), I18n.t('MRS')]
    const fullname = prenom === '' ? nom : [prenom, nom].join(' ')
    const cloneAddress = {
      ...client,
      nom: null,
      prenom: null,
      civilite: null,
      title: `${civilite[client.civilite - 1]} ${title}`,
    }
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => Actions.pop()}>
              <IconBack />
              <Image source={organilogIcon} style={styles.organilogIcon} />
            </Button>
            <Text style={styles.title}>
              {I18n.t('CUSTOMERS')} #{code}
            </Text>
          </Left>
        </Header>
        
        <Content>
          <List style={styles.list}>
            {this.renderItem('fullname', fullname, 0)}
            {Object.keys(cloneAddress).map((key, index) =>
              this.renderItem(key, cloneAddress[key], index + 1)
            )}
          </List>
          <TouchableOpacity onPress={() => Actions.createIntervention({clientup:client})} style={{marginLeft:40,marginRight:40,marginTop:20}}>
              <Text style={{backgroundColor: '#46CCBE', textAlign:'center',padding:6,color:'white'}}>
                {value}
              </Text>
          </TouchableOpacity>
          {this.renderAddress()}
        </Content>
      </Container>
    )
  }
}

ClientDetail.propTypes = {
  client: PropTypes.object.isRequired,
  fontSize: PropTypes.number.isRequired,
}

ClientDetail.defaultProps = {
  fontSize: 12,
}

export default ClientDetail
