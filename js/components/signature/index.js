import React, { Component } from 'react'
import { View, TouchableOpacity, Image } from 'react-native'
import { Container, Header, Left, Text, Button } from 'native-base'
import { Actions, ActionConst } from 'react-native-router-flux'
import I18n from 'react-native-i18n'
import SignatureCapture from 'react-native-signature-capture'

import { componentStyles } from '../../styles'
import styles from './styles'

const organilogIcon = require('../../../images/organilog-logo-color.png')

class Signature extends Component {
  static propTypes = {
    dismissModal: React.PropTypes.func,
    saveSignature: React.PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
    }

    this._onSaveEvent = this._onSaveEvent.bind(this)
  }

  onCancel() {
    this.setState({ isSubmitting: false })
  }

  saveSign() {
    this.refs.sign.saveImage()
  }

  resetSign() {
    this.refs.sign.resetImage()
  }

  _onSaveEvent(result) {
    // result.encoded - for the base64 encoded png
    // result.pathName - for the file path name
    this.refs.sign.resetImage()
    this.props.saveSignature(result.encoded, result.pathName)
  }
  _onDragEvent() {
    // This callback will be called when the user enters signature
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => this.props.dismissModal()}>
              <Image source={organilogIcon} style={styles.organilogIcon} />
              <Text style={styles.title}>Signature</Text>
            </Button>
          </Left>
        </Header>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <SignatureCapture
            style={styles.signature}
            ref="sign"
            onSaveEvent={this._onSaveEvent}
            onDragEvent={this._onDragEvent}
            saveImageFileInExtStorage
            showNativeButtons={false}
            showTitleLabel={false}
            viewMode={'portrait'}
            square={ true }
          />
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={styles.buttonStyle}
              onPress={() => {
                this.saveSign()
              }}
            >
              <Text>
                {I18n.t('SAVE')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonStyle}
              onPress={() => {
                this.resetSign()
              }}
            >
              <Text>
                {I18n.t('RESET')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Container>
    )
  }
}

export default Signature
