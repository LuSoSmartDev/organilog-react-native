import React, { Component } from 'react'
import { View, TextInput, ListView,TouchableOpacity } from 'react-native'
import moment from 'moment'
import { Text } from 'native-base'
import I18n from 'react-native-i18n'
import styles from './styles'


class InforSection extends Component {
  static propTypes = {
    onChangeClientEvent: React.PropTypes.func,
    onChangeAddressEvent: React.PropTypes.func,
    getPositionOfInput: React.PropTypes.func,
    showDialogAddressSuggestion:React.PropTypes.func,
    client: React.PropTypes.string,
    address: React.PropTypes.string,
    isEnableGPS: React.PropTypes.bool
  }

  constructor(props) {
    super(props)
    this.state = {
      client: props.client,
      address: props.address,
      isEnableGPS: props.isEnableGPS,
    }
  }

  componentWillReceiveProps(nextProps) {
    const { client, address } = this.state
    if (nextProps.client !== client) {
      this.setState({
        client: nextProps.client,
      })
    }
    if (nextProps.address !== address) {
      this.setState({
        address: nextProps.address,
      })
    }
  }

  _keyboardDidHide() {}

  renderRowAutoFill(data) {
    return (
      <View>
        <Text
          style={{
            fontSize: 14,
            color: 'black',
            marginLeft: 10,
            marginTop: 10,
          }}
        >
          {data}
        </Text>
        <View style={styles.row_line} />
      </View>
    )
  }

  renderOverlay() {
    const { topOfViewAuto, isHideAutoComplete } = this.state
    return (
      <View
        style={
          isHideAutoComplete
            ? [styles.overlay, { top: topOfViewAuto }]
            : styles.hidden_overlay
        }
      >
        <ListView
          dataSource={this.state.dataSearchSource}
          renderRow={rowData => this.renderRowAutoFill(rowData)}
        />
      </View>
    )
  }

  render() {
    const { client, address } = this.state
    // console.log('InfoSection >>> isEnableGPS : '+this.props.isEnableGPS);
    return (
      <View ref="main">
        <TextInput
          ref="client"
          style={[styles.intervenatTab_input, { marginTop: 10 }]}
          placeholder="Client"
          value={client}
          autoCorrect
          placeholderTextColor="black"
          onChangeText={text => this.props.onChangeClientEvent(text)}
          onLayout={event => {
            var { x, y, width, height } = event.nativeEvent.layout
            this.props.getPositionOfInput('client', y)
          }}
        />
        <TextInput
          ref="address"
          style={[styles.intervenatTab_input, { marginTop: 10 }]}
          placeholder="Adresse"
          value={address}
          autoCorrect
          placeholderTextColor="black"
          onChangeText={text => this.props.onChangeAddressEvent(text)}
          onLayout={event => {
            var { x, y, width, height } = event.nativeEvent.layout
            this.props.getPositionOfInput('address', y)
          }}
        />
        {/* onPress={() => this.onClickAddSpeaker()} */}
        {this.props.isEnableGPS && <TouchableOpacity  onPress={() => this.props.showDialogAddressSuggestion()}>
          <View style={styles.btn_view}>
            <Text style={styles.btn_text}>{I18n.t('NEAR_BY_ADDRESS')}</Text>
          </View>
        </TouchableOpacity> }
        
      </View>
    )
  }
}

export default InforSection
