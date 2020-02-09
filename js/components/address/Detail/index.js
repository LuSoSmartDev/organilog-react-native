import React, { Component, PropTypes } from 'react'
import { Linking, Text, Image, View, TouchableOpacity } from 'react-native'
import {
  Container,
  Header,
  Left,
  Content,
  ListItem,
  Button,
  List,
} from 'native-base'
import I18n from 'react-native-i18n'
import moment from 'moment'
import { Actions } from 'react-native-router-flux'
import { phonecall, email as emailCall } from 'react-native-communications'
import IconBack from '../../../themes/IconBack'

import { componentStyles } from '../../../styles'
import styles from './styles'
import { mapFieldDetail as mapField } from '../../../services/table/address'
import { mapFieldDetail as mapClient } from '../../../services/table/client'
import InterventionService from '../../../services/intervention'
const organilogIcon = require('../../../../images/organilog-logo-color.png')

class AddressDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      interventions: []
    }
    this.renderItem = this.renderItem.bind(this)
    this.keyPhone = ['PHONE_FIXE', 'PHONE_MOBILE', 'PHONE_PRO']
  }

  componentWillMount() {
    const { address } = this.props
    InterventionService.fetchByClientAndAddress(address.accountId, address.client, address).then(list => {
      this.setState({
        interventions: list,
      })
    })
  }

  withFontSize(style, percent = 1) {
    const fontSize = this.props.fontSize * percent
    return { ...style, fontSize }
  }

  _openExternalApp = (lat, lng) => {
    if (lat === 0 || lng === 0 || lat === '' || lng === '') {
      return
    }
    url = `http://maps.apple.com/?daddr=${lat},${lng}`
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log('Don\'t know how to open URI: ' + url);
      }
    });
  }

  renderItem(key, value, index) {
    const property = mapField[key]
    if (!property || !!!value || value === '0') return null

    const label = I18n.t(mapField[key])

    return (
      <ListItem key={index} style={styles.item}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'center' }}>
          <Text style={styles.label}>
            {`${label}:`}
          </Text>
          <Text>
            {value}
          </Text>
        </View>
      </ListItem>
    )
  }

  renderClientItem(key, value, index,item = null) {
    let isGoDetail = false;
    const property = mapClient[key]
    if (!property || !!!value || value === '0') return null

    const isPhone = this.keyPhone.includes(property)
    const isEmail = key === 'email'
    const label = isPhone ? I18n.t('PHONE_CALL') : I18n.t(mapClient[key])
    if(key=='title'){
        isGoDetail = true;
    }
    return (
      <ListItem key={index} style={styles.item}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'center' }}>
          <Text style={styles.label}>
            {label}:{' '}
          </Text>
          <TouchableOpacity
            onPress={() =>
              isPhone ? phonecall(value, false) : emailCall(value)}
          >
            <Text style={this.withFontSize((isEmail || isPhone) ? styles.phone : styles.normalField)}>
              {value}
            </Text>
          </TouchableOpacity> 
          {/* { client: value } */}
          {!!isGoDetail && <TouchableOpacity
                  style={{padding:8, marginLeft: 6, backgroundColor: '#46CCBE', height:35}}
                  onPress={() => Actions.clientDetail({ client: item })}>
                  <Text style={{ color: '#fff', textAlign:'center',alignContent:"center" }}> >> </Text>
                </TouchableOpacity>}
        </View>
      </ListItem>
    )
  }

  renderClient(client) {
    if (!client) return null
    const cloneClient = { ...client }
    return (
      <List style={{ ...styles.list, ...styles.last }}>
        <ListItem key={-1} style={styles.itemHeader}>
          <Text style={styles.itemHeaderText}>
            {I18n.t('CUSTOMERS')}
          </Text>
        </ListItem>
        {Object.keys(cloneClient).map((key, index) =>
          this.renderClientItem(key, cloneClient[key], index + 1,client)
        )}
      </List>
    )
  }

  renderInterventions() {
    const { interventions } = this.state
    return (
      <List style={{ ...styles.list, ...styles.last }}>
        <ListItem key={-2} style={styles.itemHeader}>
          <Text style={styles.itemHeaderText}>
            {I18n.t('INTERVENTIONS')}
          </Text>
        </ListItem>
        <ListItem key={-1} style={styles.listItemHeader}>
          <View style={[styles.headerBarTable, { flex: 1, flexDirection: 'row' }]}>
            <Text style={[this.withFontSize(styles.headerLabelTable, 1), { flex: 2 }]}>
              {I18n.t('LB_IS_DONE')}
            </Text>
            <View style={styles.separateVerticalRow}/>
            <Text style={[this.withFontSize(styles.headerLabelTable, 1), { flex: 3 }]}>
              {`${I18n.t('LB_DATE')}`}
            </Text>
            <View style={styles.separateVerticalRow}/>
            <Text style={[this.withFontSize(styles.headerLabelTable, 1), { flex: 5 }]}>
              {`${I18n.t('LB_COMMENT')}`}
            </Text>
          </View>
        </ListItem>
        {Object.keys(interventions).map((key, index) =>
          this.renderItemIntervention(interventions[key], index + 1)
        )}
      </List>
    )
  }

  renderItemIntervention(intervention, index) {
    if (!intervention) return null
    const { isDone, planningDateStart, doneDateStart, planningComment, doneComment } = intervention;
    const statusUI = isDone == 1 ? I18n.t('YES') : I18n.t('NO')
    const dateVal = isDone == 1 ? (doneDateStart ? doneDateStart : '') : (planningDateStart ? planningDateStart : '')
    const dateUI = moment(dateVal).format('YYYY-MM-DD')
    const commentVal = isDone == 1 ? doneComment : planningComment
    const commentUI = commentVal ? commentVal : ''

    return (
      <ListItem key={index} style={styles.listItem} onPress={() => Actions.interventionDetail({ intervention })}>
        <View style={[styles.rowTable, { flex: 1, flexDirection: 'row' }]}>
          <Text style={[this.withFontSize(styles.tableValShort, 1), { flex: 2 }]}>
            {statusUI}
          </Text>
          <View style={styles.separateVerticalRow}/>
          <Text style={[this.withFontSize(styles.tableValShort, 1), { flex: 3 }]}>
            {`${dateUI}`}
          </Text>
          <View style={styles.separateVerticalRow}/>
          <Text style={[this.withFontSize(styles.tableValLength, 1), { flex: 5 }]}>
            {`${commentUI}`}
          </Text>
        </View>
      </ListItem>
    )
  }

  render() {
    const value = I18n.t('ADD_AN_INTERVENTION')
    const { address } = this.props
    const { id, code, prenom, nom, latitude, longitude } = address
    const fullname = prenom === '' ? nom : [prenom, nom].join(' ')
    const cloneAddress = { ...address, prenom: null, nom: null }
    const isHasGeo = !(latitude === 0 || longitude === 0 || latitude === '' || longitude === '')
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => Actions.pop()}>
              <IconBack />
              <Image source={organilogIcon} style={styles.organilogIcon} />
            </Button>
            <Text style={styles.title}>
              {I18n.t('ADDRESSE')} #{code}
            </Text>
          </Left>
        </Header>
        <Content>
          <List style={styles.list}>
            <ListItem key={-1} style={styles.itemHeader}>
              <Text style={styles.itemHeaderText}>
                {I18n.t('ADDRESSE')}
              </Text>
            </ListItem>
            {this.renderItem('fullname', fullname, 0)}
            {Object.keys(cloneAddress).map((key, index) =>
              this.renderItem(key, cloneAddress[key], index + 1)
            )}
            {
              !!isHasGeo &&
              <ListItem key={Object.keys(cloneAddress).length + 1} style={styles.itemHeader}>
                <Button
                  style={{ padding: 10, marginLeft: 0, paddingTop: 5, paddingBottom: 5, backgroundColor: '#46CCBE' }}
                  onPress={() => this._openExternalApp(latitude, longitude)}>
                  <Text style={{ color: '#fff' }}>{I18n.t('PREF_MAP')}</Text>
                </Button>
              </ListItem>
            }
          </List>
          <TouchableOpacity onPress={() => Actions.createIntervention({addressup:address})} style={{marginLeft:40,marginRight:40,marginTop:20}}>
              <Text style={{backgroundColor: '#46CCBE', textAlign:'center',padding:6,color:'white'}}>
                {value}
              </Text>
          </TouchableOpacity>
          
          {this.renderClient(cloneAddress.client)}
          {this.renderInterventions()}
        </Content>
      </Container>
    )
  }
}

AddressDetail.propTypes = {
  address: PropTypes.object.isRequired,
  fontSize: PropTypes.number.isRequired,
}

AddressDetail.defaultProps = {
  fontSize: 12,
}

export default AddressDetail
