import React, { Component, PropTypes } from 'react'
import {
  View,
  TouchableOpacity,
  ListView,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native'
import CheckBox from 'react-native-check-box'
import { Text, Label, Icon, Picker, Item } from 'native-base'
import I18n from 'react-native-i18n'
import _ from 'lodash'
import styles from './styles'
import SeUnite from '../../../services/unite'
import SeFiliale from '../../../services/filiale'
import { CheckboxGroup } from 'react-native-material-design';
const w = Dimensions.get('window').width
const h = Dimensions.get('window').height

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })

class CustomFieldSection extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: ds.cloneWithRows(this.props.listUnites),
      userId: props.userId,
    }
    this.renderItem = this.renderItem.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ dataSource: ds.cloneWithRows(nextProps.listUnites) })
  }

  renderHeader() {
    return (
      <View style={styles.view_title}>
        <View style={styles.view_title_1}>
          <Label style={styles.text_title}>Informations complémentaires</Label>
        </View>
      </View>
    )
  }

  updateValue(text, id) {
    // console.log('ValueChanging : ' + text +' --- '+ id)
    this.props.onChangeText({ value: text, id: id })
  }
  // {data.nom}
  renderLabel(data) {
    return (
      <View style={{ width: w - 30, marginLeft: 15, marginTop: 5 }}>
        <Text style={{ fontSize: 14, marginTop: 5, fontWeight: 'bold', }}>
          {data.nom}
        </Text>
        <View
          style={{ backgroundColor: '#c5c5c5', width: w - 30, height: 1 }}
        />
      </View>
    )
  }

  renderInputText(data) {
    return (
      <View style={{ width: w - 30, marginLeft: 15, marginTop: 5 }}>
        <Text style={{ fontSize: 14, marginTop: 5 }}>
          {data.nom}
        </Text>
        <TextInput
          style={{ fontSize: 14, width: w - 30, height: 30 }}
          value={data.value}
          placeholder=""
          keyboardType={this.keyboardType(data)}
          onChangeText={text => this.updateValue(text, data.id)}
          underlineColorAndroid='transparent'
        />
        <View
          style={{ backgroundColor: '#c5c5c5', width: w - 30, height: 1 }}
        />
      </View>
    )
  }
  renderMultiChoice(data) {
    checked = data.value.split(',')
    return (
      <View style={{ width: w - 30, marginLeft: 15, marginTop: 5 }}>
        <Text style={{ fontSize: 14, marginTop: 5 }}>
          {data.nom}
        </Text>
        <CheckboxGroup
          onSelect={(values) => { this.updateValue(String(values), data.id) }} //console.log(`${values} are currently selected`)
          checked={checked}
          items={data.typeStr}
        />
        <View
          style={{ backgroundColor: '#c5c5c5', width: w - 30, height: 1 }}
        />
      </View>
    )
  }
  renderItem(data) {
    let view = this.renderInputText(data)
    // console.log('RenderItem >>> Type : ' +data.fieldType + ", Data : " + JSON.stringify(data))
    switch (data.fieldType) {
      case 1:
        view = this.renderTextarea(data)
        break
      case 3:
        view = this.renderYesNo(data)
        break
      case 4:
        view = this.renderList(data)
        break;
      case 10:
        view = this.renderMultiChoice(data)
        break;
      case 12:
        view = this.renderLabel(data)
        break;
    }

    return view
  }

  keyboardType(data) {
    let keyboard = 'default'
    switch (data.fieldType) {
      case 2:
        keyboard = 'numeric'
        break
      case 5:
        keyboard = 'decimal-pad'
        break
      case 6:
        keyboard = 'email-address'
        break
      case 7:
        keyboard = 'default'
        break
      case 9:
        keyboard = 'phone-pad'
        break
      case 10:

        break;
    }

    return keyboard
  }

  renderTextarea(data) {
    return (
      <View style={{ width: w - 30, marginLeft: 15, marginTop: 5 }}>
        <Text style={{ fontSize: 14, marginTop: 5 }}>
          {data.nom}
        </Text>
        <TextInput
          multiline
          numberOfLines={4}
          style={{ fontSize: 14, width: w - 30, height: 60 }}
          value={data.value}
          placeholder=""
          onChangeText={text => this.updateValue(text, data.id)}
        />
        <View
          style={{ backgroundColor: '#c5c5c5', width: w - 30, height: 1 }}
        />
      </View>
    )
  }

  renderYesNo(data) {
    return (
      <View
        style={{
          flexDirection: 'row',
          width: w - 30,
          marginLeft: 15,
          marginTop: 5,
        }}
      >
        <Text style={{ fontSize: 14, marginTop: 5, marginRight: 15 }}>
          {data.nom}
        </Text>
        <CheckBox
          style={{ width: 20, height: 20 }}
          isChecked={data.value == '1' ? true : false}
          onClick={() =>
            this.updateValue(data.value == '1' ? '0' : '1', data.id)}
        />
      </View>
    )
  }

  renderList(data) {
    // console.log('DataSelection : ' + JSON.stringify(data))
    // let options = _.uniq(data.typeStr.split(','))
    let options = data.typeStr
    // console.log('options : ' + JSON.stringify(options))
    if (options.length > 0) {
      // placeholder="Select One"
      let selectedValue = data.value ? data.value : options[0].value
      // let selectedValue = data.valueKey ? data.valueKey : options[0].value
      // console.log('selectedValue : ' + selectedValue)
      return (
        <View style={{ width: w - 30, marginLeft: 15, marginTop: 5 }}>
          <Text style={{ fontSize: 14, marginTop: 5 }}>
            {data.nom}
          </Text>
          <Picker
            mode="dropdown"
            iosHeader={data.nom}
            style={{ width: Platform.OS === 'ios' ? undefined : 120 }}
            selectedValue={selectedValue}
            onValueChange={itemValue => this.updateValue(itemValue, data.id)}
          >
            {this.renderPickerItem(options)}
          </Picker>
        </View>
      )
    } else {
      return this.renderInputText(data)
    }
  }

  renderPickerItem(options) {
    return options.map((item, key) => {
      return <Item key={key} label={item.label} value={item.value} />
    })
  }

  render() {
    return (
      <View>
        {this.renderHeader()}
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

export default CustomFieldSection
