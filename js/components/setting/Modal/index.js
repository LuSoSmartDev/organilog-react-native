import React, { Component, PropTypes } from 'react'
import {
  Modal,
  Text,
  TouchableHighlight,
  View,
  Alert,
  ScrollView,
} from 'react-native'
import { ListItem, Radio, List, Text as LeftItem, Left } from 'native-base'
import I18n from 'react-native-i18n'
import styles from './styles'

class ModalView extends Component {
  onPress(value) {
    this.props.onPress(value)
  }

  onCancel() {
    this.props.onCancel()
  }

  renderItem(item, currentValue, key) {
    const { dataSourceConfig } = this.props
    let text = item
    let value = item

    !!item[dataSourceConfig.text] && (text = item[dataSourceConfig.value])
    !!item[dataSourceConfig.value] && (value = item[dataSourceConfig.value])

    return (
      <ListItem
        key={key}
        style={styles.item}
        onPress={() => this.onPress(value)}
      >
        <Left>
          <LeftItem style={styles.itemText}>
            {text}
          </LeftItem>
        </Left>
        <Radio selected={`${currentValue}` === `${value}`} />
      </ListItem>
    )
  }

  render() {
    const { title, value, dataSource, visible } = this.props

    return (
      <Modal
        transparent
        visible={visible}
        onRequestClose={() => Alert('Modal has been closed.')}
      >
        <View style={styles.overlay} />
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ justifyContent: 'center', flex: 1 }}
        >
          <View style={styles.contentContainer}>
            <View style={styles.contentTitle}>
              <Text style={styles.title}>
                {title}
              </Text>
            </View>
            <List>
              {[...dataSource].map((item, i) =>
                this.renderItem(item, value, i)
              )}
            </List>
            <TouchableHighlight onPress={() => this.onCancel()}>
              <Text style={styles.btn}>
                {I18n.t('CANCEL')}
              </Text>
            </TouchableHighlight>
          </View>
        </ScrollView>
      </Modal>
    )
  }
}

ModalView.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ]),
  visible: PropTypes.bool,
  onPress: PropTypes.func,
  onCancel: PropTypes.func,
  dataSource: PropTypes.object,
  dataSourceConfig: PropTypes.object,
}

ModalView.defaultProps = {
  title: '',
  visible: false,
  dataSource: [],
  onPress: () => {},
  onCancel: () => {},
  dataSourceConfig: { text: 'text', value: 'value' },
}

export default ModalView
