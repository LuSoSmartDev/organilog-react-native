import React, { Component, PropTypes } from 'react'
import { View, Dimensions, TextInput } from 'react-native'
import CheckBox from 'react-native-check-box'
import { Text, Label, Icon } from 'native-base'
import I18n from 'react-native-i18n'
import styles from './styles'

const w = Dimensions.get('window').width
const h = Dimensions.get('window').height

class TitleSection extends Component {
  constructor(props) {
    super(props)
    this.state = {
      title: props.title,
    }
  }

  renderHeader() {
    return (
      <View style={styles.view_title}>
        <View style={styles.view_title_1}>
          <Label style={styles.text_title}>Titre</Label>
        </View>
      </View>
    )
  }

  render() {
    const { title } = this.props
    return (
      <View>
        {this.renderHeader()}
        <TextInput
          ref="titre"
          style={[styles.intervenatTab_input, { marginTop: 10 }]}
          placeholder="Titre"
          value={title}
          autoCorrect
          placeholderTextColor="black"
          onChangeText={text => this.props.onChangeTitle(text)}
        />
      </View>
    )
  }
}

export default TitleSection
