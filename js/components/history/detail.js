import React, { Component, PropTypes } from 'react'
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  NetInfo,
  Image
} from 'react-native'
import {
  Container,
  Header,
  Left,
  List,
  ListItem,
  Icon,
  Right,
  Content,
  Button,
} from 'native-base'
import I18n from 'react-native-i18n'
import { observer } from 'mobx-react/native'
import { observable } from 'mobx'
import moment from 'moment'
import { Actions } from 'react-native-router-flux'
import SettingMobx from '../../mobxs/setting'
import Sync from '../../services/sync'
import { componentStyles } from '../../styles'
import styles from './styles'
const organilogIcon = require('../../../images/organilog-logo-color.png')
observer
class HistoryIntervention extends Component {
  intervention = observable({})

  constructor(props) {
    super(props)
    this.state = {
      isConnected: true,
      isLoading: false,
      intervention: this.props.intervention,
      listHistoryInterventions: [],
    }

    NetInfo.isConnected.fetch().then(isConnected => this.setState({ isConnected }))
    NetInfo.isConnected.addEventListener('change', this.onConnectivityChange)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ intervention: nextProps.intervention })
  }

  componentDidMount() {
    this._fetchHistory()
  }

  _fetchHistory = () => {
    const { isLoading, isConnected } = this.state
    // console.log('_fetchHistory : ' + isLoading +' --- '+ isConnected)
    if (isLoading || !isConnected) {
      return
    }
    this.setState({
      isLoading: true,
    })
    const { intervention } = this.state
    Sync.getHistoryIntervention(intervention.accountId, intervention.serverId).then(list => {
      // console.log('FetchedHistory : ' + JSON.stringify(list))
      this.setState({
        isLoading: false,
        listHistoryInterventions: list,
      })
    })
  }

  withFontSize(style, percent = 1) {
    const fontSize = SettingMobx.fontSize * percent
    return { ...style, fontSize }
  }

  renderItemIntervention(intervention, index) {
    if (!intervention) return null
    const { isDone, planningDateStart, doneDateStart, planningComment, doneComment } = intervention;
    const statusUI = isDone == 1 ? I18n.t('YES') : I18n.t('NO')
    const dateUI = isDone == 1 ? (doneDateStart ? doneDateStart : '') : (planningDateStart ? planningDateStart : '')
    // const dateUI = moment(dateVal).format('YYYY-MM-DD')
    const commentVal = isDone == 1 ? doneComment : planningComment
    const commentUI = commentVal ? commentVal : ''

    return (
      <View key={index} style={[styles.rowTable, { flex: 1, flexDirection: 'row' }]}>
        <Text style={[this.withFontSize(styles.tableValShort, 1), { flex: 2 }]}>
          {statusUI}
        </Text>
        <View style={styles.separateVerticalRow} />
        <Text style={[this.withFontSize(styles.tableValShort, 1), { flex: 3 }]}>
          {`${dateUI}`}
        </Text>
        <View style={styles.separateVerticalRow} />
        <Text style={[this.withFontSize(styles.tableValLength, 1), { flex: 5 }]}>
          {`${commentUI}`}
        </Text>
      </View>
    )
  }

  render() {
    const { isLoading, listHistoryInterventions } = this.state
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => Actions.pop()}>
              <Icon name="ios-arrow-back" style={styles.leftIcon} />
              <Image source={organilogIcon} style={{width: 35,height: 27,marginRight: 3}} />
            </Button>
            <Text style={this.withFontSize(styles.title, 1.2)}>
              {I18n.t('LB_HISTORY')}
            </Text>
          </Left>
          <Right style={styles.right}>
            <Button transparent style={styles.rightBtn} onPress={this._fetchHistory.bind(this)}>
              {isLoading && <ActivityIndicator color="#FFFFFF" style={styles.sync} />}
              {!isLoading && <Icon style={styles.rightIcon} name="md-refresh" />}
            </Button>
          </Right>
        </Header>
        <View style={styles.barTop}>
          <Text style={this.withFontSize(styles.barTitle, 1.2)}>
            {I18n.t('INTERVENTIONS')}
          </Text>
        </View>
        <View style={[styles.headerBarTable, { flexDirection: 'row', margin: 10, marginBottom: 0 }]}>
          <Text style={[this.withFontSize(styles.headerLabelTable, 1), { flex: 2 }]}>
            {I18n.t('LB_IS_DONE')}
          </Text>
          <View style={styles.separateVerticalRow} />
          <Text style={[this.withFontSize(styles.headerLabelTable, 1), { flex: 3 }]}>
            {`${I18n.t('LB_DATE')}`}
          </Text>
          <View style={styles.separateVerticalRow} />
          <Text style={[this.withFontSize(styles.headerLabelTable, 1), { flex: 5 }]}>
            {`${I18n.t('LB_COMMENT')}`}
          </Text>
        </View>
        <Content style={styles.content}>
          <FlatList
            style={{ marginBottom: 20 }}
            data={listHistoryInterventions}
            keyExtractor={(item, index) => index}
            renderItem={({ item }) =>
              <TouchableOpacity key={index} style={styles.listItemHeader} onPress={() => { }}>
                {this.renderItemIntervention(item, index)}
              </TouchableOpacity>
            }
          />
        </Content>
      </Container>
    )
  }
}

HistoryIntervention.propTypes = {
  intervention: PropTypes.object.isRequired,
}

HistoryIntervention.defaultProps = {}

export default HistoryIntervention
