import React, { Component } from 'react'
import { Image, TouchableOpacity, Linking, Platform } from 'react-native'
import { Container, Header, Left, Button, Content, Text } from 'native-base'
import I18n from 'react-native-i18n'
import { Actions } from 'react-native-router-flux'
import IconBack from '../../themes/IconBack'

import { componentStyles } from '../../styles'
import styles from './styles'

const organilogLogo = require('../../../images/organilog-logo.png')
const organilogIcon = require('../../../images/organilog-logo-color.png')

class About extends Component {
  constructor(props) {
    super(props)
    this.onOpenUrl = this.onOpenUrl.bind(this)
  }

  onOpenUrl() {
    if (Platform.OS === 'ios') return;
    const url = 'http://fr.organilog.com'
    Linking.openURL(url).catch(err => console.error('An error occurred', err))
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Left style={componentStyles.headerLeft}>
            <Button transparent onPress={() => Actions.pop()}>
              <IconBack />
              <Image source={organilogIcon} style={styles.organilogIcon} />
            </Button>
            <Text style={styles.title}>
              {I18n.t('ABOUT')}
            </Text>
          </Left>
        </Header>
        <Content>
          <Image source={organilogLogo} style={styles.organilogLogo} />
          <Text style={styles.version}>
            {I18n.t('VERSION')} 2.0.0
          </Text>
          <TouchableOpacity onPress={this.onOpenUrl}>
            <Text style={styles.linkref}>Organilog</Text>
          </TouchableOpacity>
          <Button style={styles.button}>
            <Text style={styles.btnText}>
              {I18n.t('SHARE')}
            </Text>
          </Button>
        </Content>
      </Container>
    )
  }
}

export default About
