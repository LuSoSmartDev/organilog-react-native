import React, { Component, PropTypes } from 'react'
import { View, TouchableOpacity } from 'react-native'
import CheckBox from 'react-native-check-box'
import { Text, Label, Icon } from 'native-base'
import I18n from 'react-native-i18n'
import styles from './styles'
import moment from 'moment'

class HoursSection extends Component {
  static propTypes = {
    onShowCalendar: PropTypes.func,
    onResetWorkTime: PropTypes.func,
    onToggleCheckbox: PropTypes.func,
    beginTime: PropTypes.string,
    endTime: PropTypes.string,
    workTime: PropTypes.string,
    isDone: PropTypes.bool,
  }

  constructor(props) {
    super(props)
    //console.log('IsDone : ' + props.isDone)
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
    const { beginTime, endTime, workTime, isCompleted } = this.state
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
    if (nextProps.workTime !== workTime) {
      this.setState({
        workTime: nextProps.workTime,
      })
    }

    if (nextProps.isDone != isCompleted) {
      this.setState({
        isCompleted: nextProps.isDone,
      })
    }
  }

  // onResetWorkTime() {
  //   const { beginTime, endTime } = this.state
  //   const workTimeStamp = (parseInt(moment(beginTime).format('X'), 10) -
  //     parseInt(moment(endTime).format('X'), 10)
  //   ).toString()
  //   workTime = '00:00'
  //   if (workTimeStamp) {
  //     workTime = moment(workTime).format('HH:mm');
  //   }
  //   console.log('ResetWorkingTime : ' + workTimeStamp +" --- "+ workTime)

  //   this.setState({
  //     workTime: `${I18n.t('WORK_TIME')}: ${workTime}`,
  //   })
  // }

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
    // console.log('isCompleted ' + isCompleted)
    return (
      <View>
        {this.renderHeader('HOURS')}
        <CheckBox
          style={{ paddingLeft:15,paddingTop:10,paddingBottom: 5 }}
          isChecked={isCompleted}
          rightText={I18n.t('COMPLETED')}
          onClick={() => this.props.onToggleCheckbox()}
        />
        <TouchableOpacity onPress={() => this.props.onShowCalendar('begin')}>
          <View style={styles.btn_view}>
            <Text style={styles.btn_text}>
              {beginTime}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.onShowCalendar('end')}>
          <View style={styles.btn_view}>
            <Text style={styles.btn_text}>
              {endTime}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => this.props.onShowCalendar('work')}>
            <View style={[styles.btn_view, styles.multiButton]}>
              <Text style={styles.btn_text}>
                {workTime}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button_2}
            onPress={() => this.props.onResetWorkTime()}
          >
            <Icon
              name="md-sync"
              style={{ alignSelf: 'center', marginTop: 5, fontSize: 25 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

export default HoursSection
