import React, { Component } from 'react'
import {
  DeviceEventEmitter,
  Image,
  FlatList,
} from 'react-native'
import {
  Container,
  View,
  Header,
  Left,
  Content,
  Button,
  Text,
  Right,
  Spinner,
} from 'native-base'
import I18n from 'react-native-i18n'
import { Actions } from 'react-native-router-flux'
import { observer } from 'mobx-react'
import IconBack from '../../themes/IconBack'
import moment from 'moment'
import { componentStyles, textStyles } from '../../styles'
import styles from './styles'
import { RippleView as ListItem } from '../../themes/RippleView'
import MessageMobx from '../../mobxs/message'
import SettingMobx from '../../mobxs/setting'

const plusIcon = require('../../../images/plus-icon.png')
const organilogIcon = require('../../../images/organilog-logo-color.png')

observer
class Message extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isReload: false, // trick to reload data
    }
    this.renderItem = this.renderItem.bind(this)
    this.onLoadMore = this.onLoadMore.bind(this)
  }

  componentDidMount() {
    DeviceEventEmitter.addListener('refreshMessage', this._refreshData)
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('refreshMessage', this._refreshData);
  }

  _refreshData = () => {
    if (!this) {
      return
    }
    this.setState({
      isReload: true
    })
  }

  _keyExtractor = (item, index) => index

  onLoadMore() {
    MessageMobx.waiting = true
    const page = MessageMobx.page + 1
    MessageMobx.setPage(page)
  }

  withFontSize(style, percent = 1) {
    const fontSize = SettingMobx.fontSize * percent
    return { ...style, fontSize }
  }

  renderEmpty() {
    return (<View style={[{ padding: 12 }]}>
      <Text style={[textStyles.center]}>
        {I18n.t('EMPTY_MESSAGE_TEXT')}
      </Text>
    </View>)
  }

  renderItem({ item: message, index }) {
    // console.log('ItemMessage : ' + JSON.stringify(message))
    const { title, addDate } = message
    if (!title) return null
    const fromNom = `${(message.from || {}).prenom || ''} ${(message.from || {})
      .nom || ''}`
      addDateDisplay = ''
    if (addDate) {
      addDateDisplay = moment(addDate).format('YYYY-MM-DD')
    }
    return (
      <ListItem
        key={index}
        style={styles.item}
        onPress={() =>
          Actions.messageDetail({ message: { ...message, fromNom } })}
      >
        <View style={styles.itemLeft}>
          <Text style={this.withFontSize(styles.itemText)}>
            {title.limit(30)}
          </Text>
          <Text style={this.withFontSize(styles.itemCaption)}>
            {fromNom}
          </Text>
        </View>
        <Right style={styles.itemRight}>
          <Text style={this.withFontSize(styles.time)}>
            {addDateDisplay}
          </Text>
        </Right>
      </ListItem>
    )
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => Actions.pop()}>
              <IconBack />
              <Image source={organilogIcon} style={styles.organilogIcon} />
            </Button>
            <Text style={styles.title}>
              {I18n.t('MESSAGES')}
            </Text>
          </Left>
          <Right>
            <Button transparent onPress={() => Actions.newMessage()}>
              <Image source={plusIcon} style={styles.organilogIcon} />
            </Button>
          </Right>
        </Header>
        <Content>
          <FlatList
            data={MessageMobx.dataArray}
            keyExtractor={this._keyExtractor}
            renderItem={this.renderItem}
            ListEmptyComponent={this.renderEmpty}
          />
          {MessageMobx.loadMore &&
            <Button full transparent onPress={this.onLoadMore}>
              {MessageMobx.waiting && <Spinner />}
              <Text>
                {I18n.t('LOAD_MORE')}
              </Text>
            </Button>}
        </Content>
      </Container>
    )
  }
}

Message.propTypes = {}

Message.defaultProps = {}

export default Message
