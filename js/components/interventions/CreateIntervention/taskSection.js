import React, { Component, PropTypes } from 'react'
import { View, TouchableOpacity, ListView, Dimensions } from 'react-native'
import CheckBox from 'react-native-check-box'
import { Text, Label, Icon } from 'native-base'
import I18n from 'react-native-i18n'
import styles from './styles'

const w = Dimensions.get('window').width
const h = Dimensions.get('window').height

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })

class TasksSection extends Component {
  static propTypes = {
    onShowCalendar: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      listTasks: this.props.listTasks,
      dataSource: ds.cloneWithRows(this.props.listTasks),
    }
    this.renderItem = this.renderItem.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ dataSource: ds.cloneWithRows(nextProps.listTasks) })
  }

  renderHeader(name) {
    return (
      <View style={styles.view_title}>
        <View style={styles.view_title_1}>
          <Label style={styles.text_title}>Action</Label>
        </View>
      </View>
    )
  }

  renderItem(data) {
    return (
      <View
        style={{ flexDirection: 'row', height: 40, width: w, marginLeft: 5 }}
      >
        <CheckBox
          style={{paddingLeft:10, width: 45, height: 30 }}
          isChecked={data.isSelect}
          onClick={() => this.props.onToggleCheckbox(data.id)}
        />
        <Text style={{ fontSize: 14, marginTop: 5, marginLeft: 10 }}>
          {data.nom}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#ededed',
            borderRadius: 5,
            borderWidth: 1,
            borderColor: '#c5c5c5',
            width: 60,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            left: w - 90,
            top: 0,
          }}
          onPress={() => {
            this.props.onShowCalendar('', true, data.id)
          }}
        >
          <Text style={{ fontSize: 14 }}>
            {data.time}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <View>
        {this.renderHeader('HOURS')}
        <ListView
          enableEmptySections
          style={{ marginTop: 10 }}
          dataSource={this.state.dataSource}
          renderRow={this.renderItem}
        />
      </View>
    )
  }
}

export default TasksSection
