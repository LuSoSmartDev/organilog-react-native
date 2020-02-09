import React, { Component, PropTypes } from 'react'
import { Text, View, Image, TouchableOpacity } from 'react-native'

import moment from 'moment'
import styles from './styles'
import SettingMobx from '../../../mobxs/setting'
import IconButtonPlay from '../../../../images/btn-arrow-play.png'
import IconButtonPause from '../../../../images/btn-arrow-pause.png'
import IconClock from '../../../../images/clock-icon.png'

class Timer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      time: 0,
      count: false,
      interVal: null,
    }

    this.onStop = this.onStop.bind(this)
    this.onPause = this.onPause.bind(this)
    this.onStart = this.onStart.bind(this)
  }

  componentWillMount() {
    const { status, intervention } = this.props
    if (!status) this.onStart()
    else this.onStop(intervention.doneHour)
  }

  componentWillReceiveProps(nextProps) {
    const { status, intervention } = nextProps
    if (!status) this.onStart(nextProps)
    else this.onStop(intervention.doneHour)
  }

  componentWillUnmount() {
    clearInterval(this.state.interVal)
  }

  onStart(nextProps) {
    clearInterval(this.state.interVal)
    const interVal = setInterval(() => {
      const { status, intervention } = nextProps || this.props
      const { doneHourStart } = intervention
      const doneStart = (doneHourStart || SettingMobx.hourStart || '09:00')
        .split(':')

      if (!status) {
        const hour = moment()
          .subtract({ hours: doneStart[0] || 0, minutes: doneStart[1] || 0 })
          .format('HH:mm:ss')
        this.setState({ hour })
      } else {
        clearInterval(interVal)
      }
    }, 1000)

    this.setState({ interVal })
  }

  onStop(hour) {
    const { interVal } = this.state
    clearInterval(interVal)
    this.setState({ hour })
  }

  onPause() {
    const { interVal } = this.state
    clearInterval(interVal)
  }

  render() {
    const { hour } = this.state
    const { status } = this.props
    const IconButton = status ? IconButtonPlay : IconButtonPause

    return (
      <View style={styles.countDown}>
        <Image source={IconClock} style={styles.btnIcon} />
        <TouchableOpacity
          style={styles.btn}
          onPress={() => this.props.onValueChange(!status)}
        >
          <Image source={IconButton} style={styles.btnIcon} />
        </TouchableOpacity>
        <Text style={this.props.withFontSize(styles.countDownText)}>
          {hour}
        </Text>
      </View>
    )
  }
}

Timer.propTypes = {
  status: PropTypes.bool,
  withFontSize: PropTypes.func,
  onValueChange: PropTypes.func,
  intervention: PropTypes.object,
}

export default Timer
