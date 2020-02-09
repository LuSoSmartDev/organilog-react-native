import React, { Component } from 'react'
import I18n from 'react-native-i18n'
import { Actions, ActionConst } from 'react-native-router-flux'
import {
  Container,
  Header,
  Left,
  Item,
  Input,
  Button,
  Text,
  Form,
  Toast,
} from 'native-base'
import {
  Image,
  View,
  Linking,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { observable } from 'mobx'
import { observer } from 'mobx-react/native'

import { componentStyles } from '../../styles'
import styles from './styles'
import Auth from '../../services/auth'
import UserMobx from '../../mobxs/user'
import { onLogin } from '../../services/login'
import { SERVER_REGISTER_URL } from '../../services/api'

const organilogLogo = require('../../../images/organilog-logo.png')
const organilogIcon = require('../../../images/organilog-logo-color.png')

const minCharacters = 2
const maxCharacters = 50

observer
class Login extends Component {
  isLoaded = observable(false)

  static propTypes = {
    setUser: React.PropTypes.func,
    dispatch: React.PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      username: '',
      password: '',
      isSubmitting: false,
    }
   
    this.isLoaded = false;
    Auth.check()
      .then(user => {
        if (!!user && !!user.u_id) {
          this.setState({isSubmitting:true})
          UserMobx.setUser(user)
          Actions.main({ type: ActionConst.RESET })
        }
        this.isLoaded = true
      })
      .catch(() => {
        this.isLoaded = true
        this.setState({isSubmitting:false})
      })

    this.onLogin = this.onLogin.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }

  onLogin() {
    const { username, password, account } = this.state
    this.setState({ isSubmitting: true })

    if (!username || !password || !account) {
      this.setState({ isSubmitting: false })
      return this.onShowError(I18n.t('ERROR_FULL_FILL_LOGIN'))
    }

    const errorStr = this.checkLimitCharacter()
    if (errorStr) {
      this.setState({ isSubmitting: false })
      return this.onShowError(errorStr)
    }

    return onLogin({ account, user_name: username, password })
      .then(res => {
        this.setUser({ ...res, password, subDomain: account })
        this.setState({ isSubmitting: false })
      })
      .catch(() => {
        const { isSubmitting } = this.state
        if (!isSubmitting) {
          return
        }

        this.setState({ password: '', isSubmitting: false })
        this.onShowError(I18n.t('ERROR_AUTHENTICATE_LOGIN'))
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

  onCancel() {
    this.setState({ isSubmitting: false })
  }

  onChangeTextCheckRegex(text) {
    const regex = /([ .,;'*+?^=!:$(){}|[\]\/\\])/g
    if (!regex.test(text)) {
      this.setState({ account: text })
    }
  }

  setUser(user) {
    //console.log("user:"+ JSON.stringify(user))
    UserMobx.setUser(user)
    Actions.main({ type: ActionConst.RESET })
  }

  checkLimitCharacter() {
    const { account, username, password } = this.state
    let error = null
    if (minCharacters > account.length || account.length > maxCharacters) {
      error = `- ${I18n.t('ACCOUNT')}${I18n.t('ERROR_LENGTH')}\n`
    }
    if (minCharacters > username.length || username.length > maxCharacters) {
      error += `- ${I18n.t('USERNAME')}${I18n.t('ERROR_LENGTH')}\n`
    }
    if (minCharacters > password.length || password.length > maxCharacters) {
      error += `- ${I18n.t('PASSWORD')}${I18n.t('ERROR_LENGTH')}\n`
    }
    return error
  }

  focusNextField(nextField) {
    this.refs[nextField].focus()
  }

  renderWaiting() {
    return (
      <View style={styles.wait}>
        <ActivityIndicator
          color="#9f9f9f"
          size={Platform.OS === 'ios' ? 0 : 60}
          style={styles.activity}
        />
        <Text style={styles.waiting}>
          {I18n.t('PLEASE_WAIT_WHITE_WE_VERIFY_YOU_LOGIN')}
        </Text>
        <View>
          <Button onPress={this.onCancel} style={{ backgroundColor: '#FFF' }}>
            <Text style={{ color: '#303030' }}>
              {I18n.t('CANCEL')}
            </Text>
          </Button>
        </View>
      </View>
    )
  }

  get renderLoading() {
    return (
      <View style={styles.loading}>
        <Image source={organilogLogo} style={styles.organilogLogo} />
      </View>
    )
  }

  renderLogin() {
    const { password, account, username, isSubmitting } = this.state

    return (
      <Form style={styles.form}>
        <Item style={styles.input} disabled={isSubmitting}>
          <Input
            autoFocus
            name="account"
            value={account}
            ref="accountInput"
            returnKeyType="next"
            autoCorrect={false}
            style={styles.itemInput}
            placeholderTextColor="#808080"
            placeholder={I18n.t('ACCOUNT')}
            onSubmitEditing={() => {
              this.refs.usernameInput._root.focus()
            }}
            onChangeText={text => this.onChangeTextCheckRegex(text)}
            autoCapitalize="none"
          />
        </Item>
        <Item style={styles.input} disabled={isSubmitting}>
          <Input
            name="username"
            value={username}
            returnKeyType="next"
            ref="usernameInput"
            autoCorrect={false}
            style={styles.itemInput}
            placeholderTextColor="#808080"
            placeholder={I18n.t('USERNAME')}
            onSubmitEditing={() => {
              this.refs.passwordInput._root.focus()
            }}
            onChangeText={text => this.setState({ username: text })}
            autoCapitalize="none"
          />
        </Item>
        <Item style={styles.input} disabled={isSubmitting}>
          <Input
            secureTextEntry
            name="password"
            value={password}
            returnKeyType="done"
            ref="passwordInput"
            autoCorrect={false}
            style={styles.itemInput}
            onSubmitEditing={this.onLogin}
            placeholderTextColor="#808080"
            placeholder={I18n.t('PASSWORD')}
            onChangeText={text => this.setState({ password: text })}
          />
        </Item>
        <Item style={styles.itemBtn}>
          <Button
            block
            style={styles.btn}
            onPress={this.onLogin}
            disabled={isSubmitting}
          >
            <Text>
              {I18n.t('SIGN_IN')}
            </Text>
          </Button>
        </Item>
      </Form>
    )
  }

  render() {
  
    if (!this.isLoaded) return this.renderLoading
    const isiOS = Platform.OS === 'ios';
    const { isSubmitting } = this.state
    const scrollView = {
      style: { flex: 1 },
      contentContainerStyle: {
        flexGrow: 1,
      },
    }
    
    return (
      <Container style={styles.container}>
        <KeyboardAvoidingView
          style={{ flexGrow: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Header style={styles.header}>
            <Left style={componentStyles.headerLeft}>
              <Image source={organilogIcon} style={styles.organilogIcon} />
              <Text style={styles.title}>
                {I18n.t('ORGANILOG')}
              </Text>
            </Left>
          </Header>
          <ScrollView {...scrollView}>
            <View style={{ flex: 1 }}>
              <Image source={organilogLogo} style={styles.organilogLogo} />
              {isSubmitting && this.renderWaiting()}
              {!isSubmitting && this.renderLogin()}
            </View>
            {!isiOS && <Button
              transparent
              style={styles.btnFooter}
              onPress={() => Linking.openURL(SERVER_REGISTER_URL)}
            >
              <Text style={styles.bottom}>
                {I18n.t('SIGN_UP')}
              </Text>
            </Button>}
          </ScrollView>
        </KeyboardAvoidingView>
      </Container>
    )
  }
}

export default Login
