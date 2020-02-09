import React, { Component } from 'react';
import { StatusBar, Dimensions } from 'react-native';
// import { Drawer } from 'native-base'
import { Scene, Router, Drawer, Stack } from 'react-native-router-flux';
// import { closeDrawer } from './actions/drawer';
//import { observer } from 'mobx-react/native';
import { observer } from 'mobx';
//import {observer} from 'mobx-react';
import Login from './components/login/';
import Home from './components/home/';
import HomeNonAssign from './components/home/HomeNonAssign';
import SideBar from './components/sideBar';
import About from './components/about';
import Client from './components/client';
import Setting from './components/setting';
import Address from './components/address';
import Message from './components/message';
import ClientDetail from './components/client/Detail';
import AddressDetail from './components/address/Detail';
import NewMessage from './components/message/New';
import ReplyMessage from './components/message/Reply';
import MessageDetail from './components/message/Detail';
import SettingDetail from './components/setting/Detail';
import InterventionDetail from './components/interventions/Detail';
import HistoryIntervention from './components/interventions/History';
import CreateIntervention from './components/interventions/CreateIntervention';
import FetchProducts from './components/interventions/FetchProducts';
import Tracking from './components/tracking'
import categoryTracking from './components/tracking/categoryTracking'
import BarcodeScaner from './components/tracking/barcode/scanner'
import { statusBarColor } from './themes/base-theme';
import DrawerMobx from './mobxs/drawer';

import ListIntervention from './components/history'

const { width: screenWidth } = Dimensions.get('window');

observer
class AppNavigator extends Component {
  constructor(props) {
    super(props)
    this.closeDrawer = this.closeDrawer.bind(this)
  }

  closeDrawer() {
    DrawerMobx.onClose()
  }

  // _renderScene(props) {
  //   // eslint-disable-line class-methods-use-this
  //   switch (props.scene.route.key) {
  //     case 'login':
  //       return <Login />
  //     case 'home':
  //       return <Home />
  //     case 'setting':
  //       return <Setting />
  //     case 'client':
  //       return <Client />
  //     case 'address':
  //       return <Address />
  //     case 'message':
  //       return <Message />
  //     case 'new-message':
  //       return <NewMessage />
  //     case 'reply-message':
  //       return <ReplyMessage />
  //     case 'createIntervention':
  //       return <CreateIntervention />
  //     case 'clientDetail':
  //       return <ClientDetail />
  //     case 'addressDetail':
  //       return <AddressDetail />
  //     case 'message-detail':
  //       return <MessageDetail />
  //     case 'intervestion-detail':
  //       return <InterventionDetail />
  //     default:
  //       return <Login />
  //   }
  // }

  render() {
    const refreshOnBack = () => { Actions.pop({ refresh: {} }); }
    return (
      <Router>
        <Scene>
          {/* <StatusBar backgroundColor={statusBarColor} barStyle="default" /> */}
          <Scene key="login" component={Login} hideNavBar />
          <Drawer
            drawerWidth={screenWidth * 0.8}
            drawer={DrawerMobx.opened}
            ref={ref => {
              this._drawer = ref
            }}
            type="overlay"
            tweenDuration={150}
            // contentComponent={<SideBar />}
            tapToClose
            acceptPan={false}
            onClose={() => this.closeDrawer()}
            openDrawerOffset={0.2}
            panCloseMask={0.2}
            styles={{
              drawer: {
                shadowColor: 'black',
                shadowOpacity: 0.8,
                shadowRadius: 3,
              },
              main: {
                backgroundColor: '#000',
              },
              mainOverlay: {
                backgroundColor: '#000',
                opacity: 0,
              },
            }}
            tweenHandler={ratio => {
              //eslint-disable-line
              return {
                drawer: { shadowRadius: ratio < 0.2 ? ratio * 5 * 5 : 5 * 5 },
                mainOverlay: { opacity: ratio / 2 },
              }
            }}
            negotiatePan
            contentComponent={SideBar}
            key="main"
            hideNavBar
          // headerMode="none"
          >
            <Stack initial key="stack">
              <Scene key="nonAssignIntervention" component={HomeNonAssign} hideNavBar initial /> 
              <Scene key="home" component={Home} hideNavBar initial />
              <Scene key="client" component={Client} hideNavBar />
              <Scene
                key="clientDetail"
                component={ClientDetail}
                direction="vertical"
                hideNavBar
              />
              <Scene key="address" component={Address} hideNavBar />
              <Scene
                key="addressDetail"
                component={AddressDetail}
                direction="vertical"
                hideNavBar
              />
              <Scene key="message" component={Message} hideNavBar />
              <Scene
                key="messageDetail"
                component={MessageDetail}
                direction="vertical"
                hideNavBar
              />
              <Scene
                key="replyMessage"
                component={ReplyMessage}
                direction="vertical"
                hideNavBar
              />
              <Scene
                key="newMessage"
                component={NewMessage}
                direction="vertical"
                hideNavBar
              />
              <Scene
                key="listCategoryTracking"
                component={categoryTracking}
                hideNavBar
              />
              <Scene key="tracking" component={Tracking} hideNavBar/>
              <Scene key='scan' component = {BarcodeScaner} hideNavBar onback={refreshOnBack}/>
              <Scene key="setting" component={Setting} hideNavBar />
              <Scene key="settingDetail" component={SettingDetail} hideNavBar />
              <Scene key="about" component={About} hideNavBar />
              <Scene
                key="createIntervention"
                component={CreateIntervention}
                direction="vertical"
                panHandlers={null}
                hideNavBar
              />
              <Scene
                key="fetchProducts"
                component={FetchProducts}
                hideNavBar
              />
              <Scene
                key="interventionDetail"
                component={InterventionDetail}
                hideNavBar
              />
              <Scene
                key="historyIntervention"
                component={HistoryIntervention}
                hideNavBar
              />
              <Scene 
                key="listHist"
                component ={ListIntervention}
                hideNavBar/>
            </Stack>
          </Drawer>
        </Scene>
      </Router>
    )
  }
}

export default AppNavigator
