import React, { Component, PropTypes } from 'react'
import { View, TouchableOpacity } from 'react-native'
import CheckBox from 'react-native-check-box'
import { Text, Label, Icon } from 'native-base'
import I18n from 'react-native-i18n'
import styles from './styles'

class DateSection extends Component {
  static propTypes = {
    onShowDatePicker: PropTypes.func,
    onToggleCheckbox: PropTypes.func,
    beginTime: PropTypes.string,
    endTime: PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      avatarSource: null,
      videoSource: null,
      currentDate: new Date(),
      isDateTimePickerVisible: false,
      typeDataPicker: null,
      beginTime: props.beginTime,
      endTime: props.endTime,
      workTime: props.workTime,
      isCompleted: props.isDone,
      films: [],
      query: '',
      topOfViewAuto: 0,
      isHideAutoComplete: false,
      heightDynamic: 0,
    }
  }

  componentWillReceiveProps(nextProps) {
    const { beginTime, endTime } = this.state
    if (nextProps.beginTime !== beginTime) {
      this.setState({
        beginTime: nextProps.beginTime,
      })
    }
    if (nextProps.endTime !== endTime) {
      this.setState({
        endTime: nextProps.endTime,
      })
    }
  }

  renderHeader(name) {
    return (
      <View style={styles.view_title}>
        <View style={styles.view_title_1}>
          <Label style={styles.text_title}>
            {I18n.t(name)}
          </Label>
        </View>
      </View>
    )
  }

  render() {
    const { beginTime, endTime, workTime, isCompleted } = this.state
    return (
      <View>
        {this.renderHeader('DATE')}
        <TouchableOpacity onPress={() => this.props.onShowDatePicker('begin')}>
          <View style={styles.btn_view}>
            <Text style={styles.btn_text}>
              {beginTime}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.onShowDatePicker('end')}>
          <View style={styles.btn_view}>
            <Text style={styles.btn_text}>
              {endTime}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

export default DateSection
