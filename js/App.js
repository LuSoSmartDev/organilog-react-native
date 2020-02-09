import React, { Component, PropTypes } from 'react'
import { AppState, DeviceEventEmitter, Platform, StyleSheet } from 'react-native'
// import CodePush from 'react-native-code-push'
import { Container, Content, Text, View, Root } from 'native-base'
import { NotificationsAndroid, NotificationsIOS } from 'react-native-notifications'
import Modal from 'react-native-modalbox'
import AppNavigator from './AppNavigator'
import ProgressBar from './components/loaders/ProgressBar'
import I18n from 'react-native-i18n'
import './translations'
import theme from './themes/base-theme'
import InterventionMobx from './mobxs/intervention'
// import BackgroundGeolocation from 'react-native-background-geolocation'
import seLocation from './services/location'
import userMox from './mobxs/user'
import SyncMobx from './mobxs/sync'
import { addNavigationHelpers } from 'react-navigation';
import {
  createReduxBoundAddListener,
  createReactNavigationReduxMiddleware,
} from 'react-navigation-redux-helpers';


const middleware = createReactNavigationReduxMiddleware(
  "root",
  state => state.nav,
);
const addListener = createReduxBoundAddListener("root");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 0,
    height: 0,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal1: {
    height: 300,
  },
})

class App extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      showDownloadingModal: false,
      showInstalling: false,
      downloadProgress: 0,
      appState: AppState.currentState
    }
    // this._addListener = createReduxBoundAddListener("root");
    // console.log('AppVersion : ' + DeviceInfo)
  }

  componentWillMount(){

    // This handler fires whenever bgGeo receives a location update.
    //  BackgroundGeolocation.on('location', this.onLocation, this.onError);

    //  // This handler fires when movement states changes (stationary->moving; moving->stationary)
    //  BackgroundGeolocation.on('motionchange', this.onMotionChange);
 
    //  // This event fires when a change in motion activity is detected
    // // BackgroundGeolocation.on('activitychange', this.onActivityChange);
 
    //  // This event fires when the user toggles location-services authorization
    //  BackgroundGeolocation.on('providerchange', this.onProviderChange);
 
     
    //  // 2.  Execute #ready method (required)
     
    //  BackgroundGeolocation.ready({
    //    // Geolocation Config
    //    desiredAccuracy: 0,
    //    distanceFilter: 100,//100 meters 
    //    stopTimeout: 1,

    //  }, (state) => {
    //    if (!state.enabled) {
    //      BackgroundGeolocation.start(function() {
    //        console.log("- Start success");
    //      });
    //    }
    //  });
  }
  onLocation(location) {
    console.log('- [event] location: ', JSON.stringify(location));
    location.accountId = Number.parseInt(userMox.currentUser.u_id);
    location.lLong = String(location.coords.longitude)
    location.lLat = String(location.coords.latitude)
    location.lAlt = String(location.coords.altitude)
    seLocation.insert(location).then(
      newLocation => console.log('new Location: '+ JSON.stringify(newLocation))
    );
  }
  onError(error) {
    console.warn('- [event] location error ', error);
  }
  
  onProviderChange(provider) {
    console.log('- [event] providerchange: ', provider);    
  }
  onMotionChange(location) {
    console.log('- [event] motionchange: ', location.isMoving, JSON.stringify(location));
  }

  componentDidMount() {
    DeviceEventEmitter.addListener('notification', this._showNotification)
    //
    // CodePush.sync(
    //   { updateDialog: true, installMode: CodePush.InstallMode.IMMEDIATE },
    //   status => {
    //     switch (status) {
    //       case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
    //         this.setState({ showDownloadingModal: true })
    //         this._modal.open()
    //         break
    //       case CodePush.SyncStatus.INSTALLING_UPDATE:
    //         this.setState({ showInstalling: true })
    //         break
    //       case CodePush.SyncStatus.UPDATE_INSTALLED:
    //         this._modal.close()
    //         this.setState({ showDownloadingModal: false })
    //         break
    //       default:
    //         break
    //     }
    //   },
    //   ({ receivedBytes, totalBytes }) => {
    //     this.setState({ downloadProgress: receivedBytes / totalBytes * 100 })
    //   }
    // )
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('notification', this._showNotification);
    // BackgroundGeolocation.removeListeners();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }
  _handleAppStateChange = (nextAppState) => {
    console.log('CurrentState : ' + this.state.appState)
    console.log('NextState : ' + nextAppState)
    // if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      if (nextAppState === 'active') {
      console.log('App has come to the foreground!')
      SyncMobx.isOnBackground = false
    } else if(nextAppState === 'background') {
      SyncMobx.isOnBackground = true
    }
    // this.setState({appState: nextAppState});
  }

  _showNotification = () => {
    const title = I18n.t('NOTIFCATION_TITLE');
    body = '';
    if (InterventionMobx.totalDataNew > 1) {
      body = `${InterventionMobx.totalDataNew}${I18n.t('NOTIFCATIONS_BODY')}`;
    } else {
      body = `${InterventionMobx.totalDataNew}${I18n.t('NOTIFCATION_BODY')}`;
    }
    InterventionMobx.setCountDataNew(0);
    if (Platform.OS === 'ios' && NotificationsIOS) {
      NotificationsIOS.localNotification({
        alertTitle: title,
        alertBody: body,
        vibration: true
      });
    } else if(NotificationsAndroid) {
      NotificationsAndroid.localNotification({
        title: title,
        body: body,
        vibration: true
      });
    }
   
  }

  render() {
    const { nav, dispatch } = this.props;
    if (this.state.showDownloadingModal) {
      return (
        <Container
          theme={theme}
          style={{ backgroundColor: theme.defaultBackgroundColor }}
        >
          <Content style={styles.container}>
            <Modal
              style={[styles.modal, styles.modal1]}
              backdrop={false}
              ref={c => {
                this._modal = c
              }}
              swipeToClose={false}
            >
              <View
                style={{
                  flex: 1,
                  alignSelf: 'stretch',
                  justifyContent: 'center',
                  padding: 20,
                }}
              >
                {this.state.showInstalling
                  ? <Text
                    style={{
                      color: theme.brandPrimary,
                      textAlign: 'center',
                      marginBottom: 15,
                      fontSize: 15,
                    }}
                  >
                    Installing update...
                      </Text>
                  : <View
                    style={{
                      flex: 1,
                      alignSelf: 'stretch',
                      justifyContent: 'center',
                      padding: 20,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.brandPrimary,
                        textAlign: 'center',
                        marginBottom: 15,
                        fontSize: 15,
                      }}
                    >
                      Downloading update...{' '}
                      {`${parseInt(this.state.downloadProgress, 10)} %`}
                    </Text>
                    <ProgressBar
                      color="theme.brandPrimary"
                      progress={parseInt(this.state.downloadProgress, 10)}
                    />
                  </View>}
              </View>
            </Modal>
          </Content>
        </Container>
      )
    }
    return (<Root>
      <AppNavigator 
        navigation={addNavigationHelpers({
        dispatch,
        state: nav,
        addListener:addListener})}
      />
    </Root>)
  }
}

export default App
