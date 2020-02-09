import React, { Component } from 'react'
import { DeviceEventEmitter, Image, KeyboardAvoidingView } from 'react-native'
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
  Label,
  Picker,
} from 'native-base'
import moment from 'moment'
import I18n from 'react-native-i18n'
import { observer } from 'mobx-react'
import { Actions } from 'react-native-router-flux'
import IconBack from '../../../themes/IconBack'

import { componentStyles } from '../../../styles'
import styles from './styles'
import UserMobx from '../../../mobxs/user'
import MessageMobx from '../../../mobxs/message'
import MessageService from '../../../services/message'

const organilogIcon = require('../../../../images/organilog-logo-color.png')

observer
class NewMessage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      recipientId: null,
      title: '',
      content: '',
      errors: {},
    }

    this.onSend = this.onSend.bind(this)
    this.onShowError = this.onShowError.bind(this)
    this.onValueChange = this.onValueChange.bind(this)
  }

  onValueChange(recipientId: string) {
    if (!recipientId) return
    this.setState({ recipientId })
  }

  onSend() {
    const { content, title, recipientId } = this.state
    const { currentUser: user, dataArray: users } = UserMobx
    const recipient = users.filter(current => current.id === recipientId)[0] || {}
    const errors = {}
    this.setState({ errors })
    if (title === '') errors.title = "Title can't be blank"
    if (content === '') errors.content = "Content can't be blank"

    if (Object.keys(errors).length > 0) {
      this.setState({ errors })
      return
    }

    const data = {
      title,
      content,
      isToSync: 1,
      accountId: user.serverId,
      fkUserAppliIdFrom: user.id,
      fkUserServerIdFrom: user.serverId,
      // fkUserAppliIdTo: recipient.id || 0,
      fkUserAppliIdTo: recipient.id || '',
      fkUserServerIdTo: recipient.serverId || 0,
      fkMessagerieAppliId: '',
      addDate: new Date(),
    }

    MessageService.insert(data)
      .then(res => {
        MessageMobx.onAddNew(res)
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
    const users = UserMobx.dataArray
    const { recipientId, title, content, errors } = this.state
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => Actions.pop()}>
              <IconBack />
              <Image source={organilogIcon} style={styles.organilogIcon} />
            </Button>
            <Text style={styles.title}>
              {I18n.t('NEW_MESSAGE')}
            </Text>
          </Left>
        </Header>
        <Content>
          <KeyboardAvoidingView style={{ flexGrow: 1 }}>
            <Form style={styles.form}>
              <Label style={styles.label}>
                {I18n.t('RECIPIENT')}
              </Label>
              <Picker
                mode="dropdown"
                style={styles.picker}
                textStyle={styles.pickerText}
                itemStyle={styles.pickerItem}
                placeholder={I18n.t('RECIPIENT')}
                iosHeader={I18n.t('RECIPIENT')}
                onValueChange={this.onValueChange}
                supportedOrientations={['portrait', 'landscape']}
                selectedValue={recipientId || (users.length === 0 ? 'empty' : null)}
              >
                {users.length === 0 ?
                  [
                    <Item
                      key="empty"
                      value="empty"
                      label={I18n.t('EMPTY_MESSAGE_RECIPIENT_TEXT')}
                    />,
                  ] :
                  users.map((user, key) =>
                    <Item
                      key={key}
                      value={user.id}
                      label={`${user.prenom} ${user.nom}`.trim()}
                    />
                  )
                }
              </Picker>
              <Item stackedLabel style={styles.group}>
                <Label style={styles.label}>
                  {I18n.t('TITLE')}
                </Label>
                <Input
                  value={title}
                  style={styles.input}
                  placeholder={errors.title || I18n.t('TITLE')}
                  ref={ref => (this.title = ref)}
                  onSubmitEditing={() => {
                    this.content._root.focus()
                  }}
                  onChange={e => this.setState({ title: e.nativeEvent.text })}
                />
              </Item>
              <Item stackedLabel style={styles.groupContent}>
                <Label style={styles.label}>
                  {I18n.t('CONTENT')}
                </Label>
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
                  {I18n.t('SEND')}
                </Text>
              </Button>
            </Form>
          </KeyboardAvoidingView>
        </Content>
      </Container>
    )
  }
}

NewMessage.propTypes = {}

NewMessage.defaultProps = {}

export default NewMessage
