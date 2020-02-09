import React, { Component } from 'react'
import { View, TouchableOpacity, Platform, ListView, TextInput } from 'react-native'
import { Text, Label, Icon } from 'native-base'
import I18n from 'react-native-i18n'
import styles from './styles'

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })
const ds1 = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })

const listData = ['row 1', 'row 2', 'row 4', 'row 4']

class IntervantSection extends Component {
  static propTypes = {
    dataSpeaker: React.PropTypes.array,
    addSpeaker: React.PropTypes.func,
    removeSpeaker: React.PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      dataSpeaker: props.dataSpeaker,
      speakerName: '',
      userId: props.userId,
      intUserName: props.intUserName,
    }
    this.renderItemIntervant = this.renderItemIntervant.bind(this)
  }

  componentWillMount() {
    const { dataSpeaker } = this.state
    this.setState({
      ds: ds1.cloneWithRows(dataSpeaker),
    })
  }

  componentWillReceiveProps(nextProps) {
    const { dataSpeaker, intUserName } = this.state
    if (nextProps.dataSpeaker !== dataSpeaker) {
      this.setState({
        dataSource: nextProps.dataSpeaker,
        ds: ds1.cloneWithRows(nextProps.dataSpeaker),
      })
    }
    if (nextProps.intUserName !== intUserName) {
      this.setState({
        intUserName: nextProps.intUserName,
      })
    }
  }

  onClickAddSpeaker() {
    this.props.addSpeaker()
  }

  onClickRemoveSpeaker(index) {
    this.props.removeSpeaker(index)
  }

  componentWillUnmount() {}

  renderHeader(name) {
    return (
      <View style={styles.view_title}>
        <View style={styles.view_title_1}>
          <Label style={styles.text_title}>{I18n.t(name)}</Label>
        </View>
      </View>
    )
  }

  renderItemIntervant(rowData, index) {
    return (
      <View style={styles.intervenatTab_view}>
        <Text style={styles.intervenatTab_text}>{rowData.name}</Text>
        {this.state.userId === rowData.id ? null : (
          <TouchableOpacity
            onPress={() => this.onClickRemoveSpeaker(rowData.id)}
            style={styles.speaker_btn}
          >
            <Icon name="md-close-circle" style={styles.speaker_icon} />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  render() {
    const { intUserName } = this.state
    return (
      <View>
        {this.renderHeader('ADDITIONAL_SPEAKERS')}
        <TextInput
          style={styles.intervenatTab_input}
          placeholder="ajouter"
          value={intUserName}
          onLayout={event => {
            const { x, y, width, height } = event.nativeEvent.layout
            this.props.getPositionOfInput('user', y)
          }}
          onChangeText={text => {
            this.props.filterIntervant(text)
          }}
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => this.onClickAddSpeaker()}>
          <View style={styles.btn_view}>
            <Text style={styles.btn_text}>{I18n.t('ADD_SPEAKER')}</Text>
            <Icon name="md-person-add" style={styles.btn_icon} />
          </View>
        </TouchableOpacity>
        <ListView
          enableEmptySections
          style={styles.listSpeaker}
          dataSource={this.state.ds}
          renderRow={this.renderItemIntervant}
        />
      </View>
    )
  }
}

export default IntervantSection
