import React, {
    Component,
} from 'react'
import {
    View,
    StyleSheet,
    Alert,
    DeviceEventEmitter,
    TouchableOpacity
} from 'react-native'
import { Actions } from 'react-native-router-flux'
import Barcode from 'react-native-smart-barcode'
import trackingService from '../../../services/tracking'
import userMox from '../../../mobxs/user'
import I18n from 'react-native-i18n'
import Icon from 'react-native-vector-icons/Entypo'

var urlUtil = require('url');
class BarcodeScaner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            viewAppear: false,
            lon: '',
            lat: '',
        };
        this.testBarcode = this.testBarcode.bind(this)
        this.count = 0;
    }
    render() {

        return (

            <View style={{flex: 1, backgroundColor: 'black',}}>
                <View>
                    <TouchableOpacity onPress={()=>Actions.pop()} style={{paddingTop:40,paddingLeft:8,paddingBottom:8}}>
                        <Icon name='circle-with-cross' size={30} color='red' />
                    </TouchableOpacity>
                </View>
                {this.state.viewAppear ? <Barcode style={{flex: 1, }}
                                                  ref={ component => this._barCode = component }
                                                  onBarCodeRead={this._onBarCodeRead}/> : null}
                
            </View>
        )
    }
   
    componentDidMount() {
        setTimeout(() => {
            this.setState({
                viewAppear: true,
            })
        }, 250)

        navigator.geolocation.getCurrentPosition(
            position => {
              this.setState({
                isEnableGPS:true,
                lat: position.coords.latitude, 
                lon: position.coords.longitude
              })
            },
            error => this.setState({ error: error.message ,isEnableGPS:false}),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          )

        // setTimeout(this.testBarcode,500)
       
    }
    testBarcode(){
        let data = {}
        let object = {}
        let urltest = 'https://test.organilog.com/script/tracking/qrcode.php?type=client&id=267210&user=0&nonce='
        let url1 = urlUtil.parse(urltest);
        let subdomain = url1.hostname.split('.')[0]
        // userMox.currentUser
        // alert(url1.hostname)
        data.isValid = 0
        if(subdomain !== userMox.currentUser.subDomain){
            data.isValid = 1
        }

        let query = url1.query
        let querypart = query.split('&')
        for(let i=0;i<querypart.length;i++){
            let pair = querypart[i].split('=');
            object[pair[0]] = pair[1]
        }
        data.tr_nonce = object.nonce;
        data.tr_item_id = object.id
        data.tr_type = object.type
        data.tr_lon = this.state.lon.toString()
        data.tr_lat = this.state.lat.toString()
        
        trackingService.insert(data).then((ret)=>{
            Actions.pop();
            setTimeout(()=>DeviceEventEmitter.emit('reloadbarcodelist'),50)
        }).catch(e=>alert(e))
    }
    componentWillUnmount () {
        //this._listeners && this._listeners.forEach(listener => listener.remove());
        //this._stopScan()
    }
    
    _onBarCodeRead = (e) => {
        // alert(`e.nativeEvent.data.type = ${e.nativeEvent.data.type}, e.nativeEvent.data.code = ${e.nativeEvent.data.code}`);
        // console.log(`e.nativeEvent.data.type = ${e.nativeEvent.data.type}, e.nativeEvent.data.code = ${e.nativeEvent.data.code}`)
        this._stopScan()
        this.count++;

        let data = {}
        let url =e.nativeEvent.data.code;

        data.isValid = 1
        if(url.length<20 || url.toLowerCase().indexOf("organilog.com") < 0){
            data.isValid = 0
        }
        if( data.isValid != 0){
            let url1 = urlUtil.parse(e.nativeEvent.data.code);
            
            let subdomain = url1.hostname.split('.')[0]

            if(subdomain !== userMox.currentUser.subDomain){
                data.isValid = 0
            }
            let object = {}
            let query = url1.query
            let querypart = query.split('&')
            for(let i=0;i<querypart.length;i++){
                let pair = querypart[i].split('=');
                object[pair[0]] = pair[1]
            }
            data.tr_nonce = object.nonce;
            data.tr_item_id = object.id
            data.tr_type = object.type
            data.tr_lon = this.state.lon.toString()
            data.tr_lat = this.state.lat.toString()
         }
        if(data.isValid == 0){
            Alert.alert(I18n.t('ERROR'), I18n.t('BARCODE_INVALID'), [
                {text: 'OK', onPress: () => this._startScan()},
            ])
        }else{
            if(this.count>1)
                return
            trackingService.insert(data).then((ret)=>{
                    Actions.pop();
                    setTimeout(()=>DeviceEventEmitter.emit('reloadbarcodelist'),50)
            }).catch((e)=> {this.count--,this.startScan()})
        }
    }
    _startScan = (e) => {
        this._barCode.startScan()
    }

    _stopScan = (e) => {
        this._barCode.stopScan()
    }

}

export default BarcodeScaner