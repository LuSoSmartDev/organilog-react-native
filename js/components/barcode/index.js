import React, { Component } from 'react'
import { FlatList,StyleSheet,Platform,Image,DeviceEventEmitter } from 'react-native'
import {
    Container,
    View,
    Header,
    Left,
    Content,
    Footer,
    Button,
    Text,
    Right,
    Spinner,
  } from 'native-base'
import I18n from 'react-native-i18n'
import style from '../sideBar/style';
import IconBack from '../../themes/IconBack'
const plusIcon = require('../../../images/plus-icon.png')
const organilogIcon = require('../../../images/organilog-logo-color.png')
import { Actions } from 'react-native-router-flux'
import Barcode from 'react-native-smart-barcode'
import trackingService from '../../services/tracking'
import userMox from '../../mobxs/user'
import moment from 'moment'
import { RippleView as ListItem } from '../../themes/RippleView'
import SettingMobx from '../../mobxs/setting'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Icon1 from 'react-native-vector-icons/Entypo'
import { componentStyles, textStyles } from '../../styles'


// list of barcode 
class Tracking extends Component {
    constructor(props){
        super(props)
        this.state ={
          isReload:false
        }
        this.renderItem = this.renderItem.bind(this)
        this._refresh = this._refresh.bind(this)
    }
    componentDidMount(){
      DeviceEventEmitter.addListener("reloadbarcodelist",this._refresh)
    }
    _refresh(){
      this.setState({isReload:true})

    }
    withFontSize(style, percent = 1) {
      const fontSize = SettingMobx.fontSize * percent
      return { ...style, fontSize }
    }
    renderItem({ item: traccking, index }) {
        const {  tr_date ,isToSync} = traccking
        if (!tr_date) return null
        addDateDisplay = moment(tr_date).format('HH:mm DD/MM/YYYY')
        return (
          <ListItem
            key={index}
            style={styles.item}
            onPress={() => null}
            >
            <View style={styles.itemLeft}>
              {isToSync==1 && <View  style={{width:20,height:20,marginTop:5}}  />}
              {isToSync==0 && <Icon name='check' style={{width:20,height:20, marginTop:5}} />}
              <Text style={styles.itemCaption}>
                {addDateDisplay}
              </Text>
            </View>
          </ListItem>
        )
      }
    render(){
       let data = trackingService.getHistory({accountId:userMox.currentUser.u_id})
      // alert(JSON.stringify(data))
        return (
        <Container>
              <Header style={styles.header}>
                <Left style={componentStyles.headerLeft}>
                  <Button transparent onPress={() =>  Actions.pop()}>
                    <IconBack />
                    <Image source={organilogIcon} style={styles.organilogIcon} />
                  </Button>
                  <Text style={styles.title}>
                    {I18n.t('TRACKING')}
                  </Text>
                </Left>
                <Right>
                  
                </Right>
              </Header>
             {/* <Header style={styles.header}>
              <Left style={styles.headerLeft}>
                <Button transparent onPress={() => Actions.home()}>
                <IconBack />
                <Image source={organilogIcon} style={styles.organilogIcon} />
                </Button>
                <Text style={styles.title}>
                {I18n.t('TRACKING')}
                </Text>
            </Left>
            <Right>
               
            </Right>
            </Header> */}
            <Content>
                <FlatList
                    data={data}
                    keyExtractor={this._keyExtractor}
                    renderItem={this.renderItem}
                    ListEmptyComponent={this.renderEmpty}
                />
            </Content>
            <Footer style={styles.footer}>
                <Button
                    full
                    style={styles.btnAdd}
                    onPress={() => Actions.scan()}
                    >
                    <Text style={styles.btnAddText}>
                    {I18n.t('ADD_BARCODE')}
                    </Text>
                </Button>
            </Footer>
        </Container>)
    }
}
export default Tracking;

const styles = StyleSheet.create(
    {
        container: {
            backgroundColor: '#ededed',
          },
          header: {
            height: Platform.OS === 'ios' ? 68 : 48,
            backgroundColor: '#4a8bdb',
          },
          title: {
            fontSize: 18,
            color: '#FFFFFF',
          },
          organilogIcon: {
            width: 35,
            height: 27,
            // resizeMode: 'center',
          },
          left: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
          },
          itemLeft: {
            flex: 1,
            paddingLeft: 10,
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          },
          itemRight: {
            flex: 0,
            maxWidth: 120,
            marginLeft: 10,
          },
          list: {
            marginLeft: 0,
            marginRight: 0,
          },
          item: {
            padding: 2,
            marginLeft: 0,
            paddingTop: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            flexDirection: 'row',
            borderBottomColor: '#d9d9d9',
          },
          itemText: {
            fontSize: 14,
            color: '#323232',
            fontWeight: 'bold',
            textAlign: 'left',
          },
          itemCaption: {
            fontSize: 14,
            color: '#323232',
            textAlign: 'left',
          },
          time: {
            fontSize: 12,
            color: '#777777',
            fontWeight: 'bold',
            textAlign: 'right',
          },
          
            headerLeft: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            },
            backbutton: {
            width:60,
            height:40,
            },
            footer: {
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: 15,
                borderTopWidth: 0,
                backgroundColor: 'transparent',
              },
              btnAdd: {
                flex: 1,
                borderRadius: 3,
                backgroundColor: '#47cec0',
              },
              btnAddText: {
                fontSize: 14,
              },
    }
)