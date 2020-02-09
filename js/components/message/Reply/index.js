import React, { Component, PropTypes } from 'react'
import { DeviceEventEmitter, Image, KeyboardAvoidingView, Platform } from 'react-native'
import {
  Container,
  Header,
  Left,
  Content,
  Toast,
  Button,
  Text,
  Form,
  Item,
  Input,
} from 'native-base'
import I18n from 'react-native-i18n'
import { Actions } from 'react-native-router-flux'
import moment from 'moment'
import { observer } from 'mobx-react'
import IconBack from '../../../themes/IconBack'

import { componentStyles } from '../../../styles'
import styles from './styles'
import UserMobx from '../../../mobxs/user'
import MessageMobx from '../../../mobxs/message'
import MessageService from '../../../services/message'

const organilogIcon = require('../../../../images/organilog-logo-color.png')

observer
class ReplyMessage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      content: '',
      errors: {},
    }

    this.onSend = this.onSend.bind(this)
    this.onShowError = this.onShowError.bind(this)
  }

  onSend() {
    const { content } = this.state
    const { message } = this.props
    const user = UserMobx.currentUser
    const errors = {}
    this.setState({ errors })
    if (content === '') errors.content = "Content can't be blank"
    if (Object.keys(errors).length > 0) {
      this.setState({ errors })
      return
    }

    const {
      title,
      // id: fkMessagerieAppliId,
      id,
      serverId, 
      // serverId: fkMessagerieServerId,
      // fkUserAppliIdFrom: fkUserAppliIdTo,
      fkUserAppliIdFrom,
      // fkUserServerIdFrom: fkUserServerIdTo,
      fkUserServerIdFrom,
    } = message

    const accountId = parseInt(user.u_id, 10)

    const data = {
      title,
      content,
      accountId,
      isToSync: 1,
      fkUserAppliIdTo: fkUserAppliIdFrom,
      fkUserServerIdTo: fkUserServerIdFrom,
      fkUserAppliIdFrom: user.id,
      fkUserServerIdFrom: user.serverId,
      fkMessagerieAppliId: id,
      fkMessagerieServerId: serverId,
      addDate: moment(),
    }

    MessageService.insert(data)
      .then(res => {
        MessageMobx.onReply(res)
        DeviceEventEmitter.emit('refreshMessage')
        Actions.pop()
      })
      .catch(e => this.onShowError(e.toString()))
  }

  onShowError(textError) {
    return Toast.show({
      duration: 3000,
      text: textError,
      position: 'bottom',
      supportedOrientations: ['Potrait', 'Landscape'],
    })
  }

  focusNextField(nextField) {
    this.refs[nextField].focus()
  }

  render() {
    const { content, errors } = this.state
    const { message } = this.props
    // console.log('ReplyToMessage : ' + JSON.stringify(message))
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => Actions.pop()}>
              <IconBack />
              <Image source={organilogIcon} style={styles.organilogIcon} />
            </Button>
            <Text style={styles.title}>
              {I18n.t('REPLY_TO_THE_MESSAGE')}
            </Text>
          </Left>
        </Header>
        <Content>
          <KeyboardAvoidingView
            style={{ flexGrow: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Form style={styles.form}>
              <Item style={styles.group}>
                <Input
                  multiline
                  value={content}
                  style={styles.content}
                  textAlignVertical="top"
                  placeholder={errors.content || I18n.t('CONTENT')}
                  ref={ref => (this.content = ref)}
                  onSubmitEditing={this.onSend}
                  onChange={e => this.setState({ content: e.nativeEvent.text })}
                />
              </Item>
              <Button full onPress={this.onSend} style={styles.btnSend}>
                <Text style={styles.btnSendText}>
                  {I18n.t('REPLY')}
                </Text>
              </Button>
            </Form>
          </KeyboardAvoidingView>
        </Content>
      </Container>
    )
  }
}

ReplyMessage.propTypes = {
  message: PropTypes.object.isRequired,
}

export default ReplyMessage
