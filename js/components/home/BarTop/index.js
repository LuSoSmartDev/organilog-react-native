import React, { Component, PropTypes } from 'react'
import { Image } from 'react-native'
import { Header, Text, Button } from 'native-base'
import DateTimePicker from 'react-native-modal-datetime-picker'
import moment from 'moment'
import I18n from 'react-native-i18n'
import styles from './styles'

class BarTop extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentDate: this.props.selectedDate,
      isDateTimePickerVisible: false,
    }
    this.onNext = this.onNext.bind(this)
    this.onPrevious = this.onPrevious.bind(this)
    this.onCalandar = this.onCalandar.bind(this)
    this.onDatePicked = this.onDatePicked.bind(this)
    this.onHideDateTimePicker = this.onHideDateTimePicker.bind(this)
  }

  onNext() {
    const currentDate = moment(this.state.currentDate).clone().add(1, 'days')
    this.setState({ currentDate })
    this.props.onChange(currentDate)
  }

  onPrevious() {
    const currentDate = moment(this.state.currentDate).clone().add(-1, 'days')
    this.setState({ currentDate })
    this.props.onChange(currentDate)
  }

  onCalandar() {
    this.setState({ isDateTimePickerVisible: true })
  }

  onDatePicked(date) {
    const currentDate = moment(date).clone()
    this.setState({ currentDate })
    this.props.onChange(currentDate)
    this.onHideDateTimePicker()
  }

  onHideDateTimePicker() {
    this.setState({ isDateTimePickerVisible: false })
  }

  render() {
    const dateTimePicker = {
      cancelTextIOS: I18n.t('DATETIMEPICKER_CANCEL'),
      confirmTextIOS: I18n.t('DATETIMEPICKER_CONFIRM'),
      titleIOS: I18n.t('DATETIMEPICKER_TITLE'),
    }

    const { currentDate } = this.state
    return (
      <Header style={styles.header}>
        <Button transparent style={styles.btn} onPress={this.onPrevious}>
          <Image
            source={require('../../../../images/caret-left.png')}
            style={styles.icon}
          />
        </Button>
        <Button transparent onPress={this.onCalandar}>
          <Text style={styles.title}>
            {moment(currentDate).format('DD MMMM YYYY')}
          </Text>
        </Button>
        <Button transparent style={styles.btn} onPress={this.onNext}>
          <Image
            source={require('../../../../images/caret-right.png')}
            style={styles.icon}
          />
        </Button>
        <DateTimePicker
          {...dateTimePicker}
          onConfirm={this.onDatePicked}
          onCancel={this.onHideDateTimePicker}
          isVisible={this.state.isDateTimePickerVisible}
        />
      </Header>
    )
  }
}

BarTop.propTypes = {
  onChange: PropTypes.func,
}

BarTop.defaultProps = {
  onChange: () => {},
  onCalandar: () => {},
}

export default BarTop
