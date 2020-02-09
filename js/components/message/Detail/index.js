import React, { PropTypes, Component } from 'react'
import { Image } from 'react-native'
import {
  Container,
  Header,
  Left,
  Content,
  Button,
  Text,
  View,
  Icon,
} from 'native-base'
import { Actions } from 'react-native-router-flux'
import HTMLView from 'react-native-htmlview'
import { observer } from 'mobx-react'
import IconBack from '../../../themes/IconBack'

import UserMobx from '../../../mobxs/user'
import MessageMobx from '../../../mobxs/message'
import SettingMobx from '../../../mobxs/setting'
import MessageService from '../../../services/message'
import moment from 'moment'

import { componentStyles } from '../../../styles'
import styles from './styles'

const organilogIcon = require('../../../../images/organilog-logo-color.png')

observer
class DetailMessage extends Component {
  constructor(props) {
    super(props)
    this.renderItem = this.renderItem.bind(this)
    this.renderNode = this.renderNode.bind(this)
  }

  componentWillMount() {
    const { message } = this.props
    MessageService.isRead(message, UserMobx.currentUser.u_id)
  }

  withFontSize(style, percent = 1) {
    const fontSize = SettingMobx.fontSize * percent
    return { ...style, fontSize }
  }

  renderItem(message, index) {
    const { content, addDate } = message
    const fromNom = `${(message.from || {}).prenom || ''} ${(message.from || {})
      .nom || ''}`

    return (
      <View key={index} style={styles.item}>
        <HTMLView
          style={styles.conent}
          renderNode={this.renderNode}
          value={content.replace(/<br \/>/g, '')}
          stylesheet={{
            a: {
              color: 'blue',
            },
          }}
        />
        <View style={styles.footer}>
          <Text style={this.withFontSize(styles.sender)}>
            {fromNom}
          </Text>
          <Text style={this.withFontSize(styles.time)}>
            {moment(addDate).format('YYYY-MM-DD HH:mm')}
          </Text>
        </View>
      </View>
    )
  }

  renderNode(node, index) {
    const parent = node.parent
    if (node.type === 'text') {
      const style = parent ? styles[parent.name] : {}
      return (
        <Text key={index} style={this.withFontSize(style)}>
          {node.data}
        </Text>
      )
    }
    return undefined
  }

  render() {
    const { message: oldMessage } = this.props
    const message = MessageMobx.getMessage(oldMessage.id)
    const { title, histories } = message

    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => Actions.pop()}>
              <IconBack />
              <Image source={organilogIcon} style={styles.organilogIcon} />
            </Button>
            <Text style={styles.title}>
              {title && title.limit(27)}
            </Text>
          </Left>
          <Button transparent onPress={() => Actions.replyMessage({ message })}>
            <Icon name="ios-redo" style={styles.iconReply} />
          </Button>
        </Header>
        <Content>
          {!!message.content && this.renderItem(message, -1)}
          {!!histories && histories.map(this.renderItem)}
        </Content>
      </Container>
    )
  }
}

DetailMessage.propTypes = {
  message: PropTypes.object.isRequired,
}

DetailMessage.defaultProps = {}

export default DetailMessage
