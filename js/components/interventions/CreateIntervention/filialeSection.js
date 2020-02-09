import React, { Component, PropTypes } from 'react'
import {
  View,
  TouchableOpacity,
  ListView,
  Dimensions,
  TextInput,
} from 'react-native'
import CheckBox from 'react-native-check-box'
import { Text, Label, Icon } from 'native-base'
import I18n from 'react-native-i18n'
import styles from './styles'
import SeUnite from '../../../services/unite'
import SeFiliale from '../../../services/filiale'
import Filiale from '../../../services/table/filiale'

const w = Dimensions.get('window').width
const h = Dimensions.get('window').height

class FilialeSection extends Component {
  static propTypes = {
    toggleFiliale: PropTypes.func,
  }

  renderHeader() {
    return (
      <View style={styles.view_title}>
        <View style={styles.view_title_1}>
          <Label style={styles.text_title}>Filiale</Label>
        </View>
      </View>
    )
  }

  render() {
    const {
      disabled
    } = this.props
    return (
      <View>
        {this.renderHeader()}
        <TouchableOpacity onPress={() => this.props.toggleFiliale()} disabled={disabled}>
          <View style={styles.btn_view}>
            <Text style={styles.btn_text}>
              {this.props.nameFiliale}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

export default FilialeSection
