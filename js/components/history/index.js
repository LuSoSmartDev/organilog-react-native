import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux'
import InterventionMobx from '../../mobxs/intervention'
import { ListItem, List, Left } from 'native-base'
import SettingMbox from '../../mobxs/setting'
import styles from './styles'
import utils from '../interventions/utils'
import { DeviceEventEmitter, Text, Image, TouchableOpacity, Alert } from 'react-native'
import { componentStyles } from '../../styles'
import I18n from 'react-native-i18n'
import IconBack from '../../themes/IconBack'
import BarTop from '../home/BarTop'
const organilogIcon = require('../../../images/organilog-logo-color.png')
import {
    Container,
    Header,
    Button,
    Icon,
    Right,
    Content,
    Footer,
    // Text,
  } from 'native-base'

export default class HisIntervention extends Component {
    constructor(props) {
        super(props)
        this.state = {
          currentDate: new Date()
        }
        this.onChange = this.onChange.bind(this)
    }
    onChange(currentDate) {
      InterventionMobx.currentDate = currentDate.format('YYYY-MM-DD')
      this.setState({
        selectedDate: new Date()
      });
    }
    renderItem(intervention, index) {
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
       
        const fullAddress = utils.getFullAddress(intervention)
        const time = utils.getTime(intervention)
        
        return (
          <ListItem
            key={index}
            style={styles.item}
            onPress={() => {
                Actions.historyIntervention({ intervention })
            }
            }
          >
            <Left style={styles.left}>
                <Text style={styles.title}>
                  {nom}
                </Text>
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
           
          </ListItem>
        )
      }

    render() {
        const { isShowOldIntervention } = SettingMbox
        
        // console.log('count of unfinish data array ' + InterventionMobx.dataArrayUnFinish.length);
        // console.log('count of data array ' + InterventionMobx.dataArray.length);
        return (
            <Container style={styles.container}>
                <Header style={styles.header}>
                <Left style={componentStyles.headerLeft}>
                    <Button transparent onPress={() => Actions.pop()}>
                    <IconBack />
                    <Image source={organilogIcon} style={styles.organilogIcon} />
                    </Button>
                    <Text style={styles.titleHeader}>
                    {I18n.t('HISTORY')}
                    </Text>
                </Left>
                <Right>
                    
                </Right>
                </Header>
                <BarTop selectedDate={this.state.selectedDate} onChange={this.onChange} />
                <Content>
                    <List style={styles.list}>
                        {isShowOldIntervention && InterventionMobx.dataArrayUnFinish.map(this.renderItem)}
                        {InterventionMobx.dataArray.map(this.renderItem)}
                    </List>
                </Content>
            </Container>
          
        )
    }

} 
