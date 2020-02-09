import React, { Component, PropTypes } from 'react'
import {
  View,
  Image,
  Text,
  Modal,
  Alert,
  KeyboardAvoidingView,
} from 'react-native'
import {
  Container,
  Header,
  Button,
  Content,
  Footer,
  Icon,
  Toast,
  Input,
} from 'native-base'
import moment from 'moment'
import I18n from 'react-native-i18n'
import Share from 'react-native-share'
import IconBack from '../../../themes/IconBack'

import styles from './stylesModal'

class MediaDetail extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    fontSize: PropTypes.number,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
  }

  static defaultProps = {
    fontSize: 12,
    onEdit: () => { },
    onDelete: () => { },
  }

  constructor(props) {
    super(props)

    this.state = {
      media: null,
      visible: props.visible,
    }

    this.onShare = this.onShare.bind(this)
    this.onEdit = this.onEdit.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onOpenWith = this.onOpenWith.bind(this)
    this.onShowMessage = this.onShowMessage.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  onChange(text, field) {
    const { media } = this.state
    if (media && media.id) {
      this.setState({ media: { ...media, [field]: text } })
    }
  }

  onShowMessage(text) {
    return Toast.show({
      text,
      duration: 3000,
      position: 'bottom',
      supportedOrientations: ['Potrait', 'Landscape'],
    })
  }

  onEdit() {
    Alert.alert(I18n.t('SAVE'), I18n.t('CHANGEMEDIA_NOTIFICATION'), [
      { text: I18n.t('CANCEL'), onPress: () => { } },
      {
        text: I18n.t('YES'),
        onPress: () => {
          this.props.onEdit(this.state.media)
        },
      },
    ])
  }

  onDelete() {
    Alert.alert(I18n.t('DELETE'), I18n.t('DELETEMEDIA_NOTIFICATION'), [
      { text: I18n.t('CANCEL'), onPress: () => { } },
      {
        text: I18n.t('YES'),
        onPress: () => {
          this.props.onDelete(this.state.media)
        },
      },
    ])
  }

  onShare() {
    const { media } = this.state
    const options = {
      uri: media.fileData,
      title: media.fileName || '',
      message: media.comment || '',
    }
    Share.open(options).catch(() => { })
  }

  onClose() {
    this.setState({ media: null, visible: false })
  }

  onOpenWith(media) {
    this.setState({ media, visible: true })
  }

  withFontSize(style, percent = 1) {
    const fontSize = this.props.fontSize * percent
    return { ...style, fontSize }
  }

  render() {
    const { media, visible } = this.state
    if (!media) return null
    const {
      id,
      fileData,
      fileName,
      fileSize,
      comment,
      legend,
      imageWidth,
      imageHeight,
    } = media

    const createdAt = moment(media.addDate, 'x')
    const updatedAt = moment(media.editDate, 'x')
    const synchedAt = moment(media.synchronizationDate, 'x')

    const isValid = createdAt.isValid()

    return (
      <Modal animationType="slide" visible={visible && !!media && !!media.id} onRequestClose={() => console.log('ModalMedia has been closed.')}>
        <Container>
          <Header style={styles.header}>
            <Button
              transparent
              onPress={() => this.setState({ visible: false, media: null })}
            >
              <Icon name="ios-arrow-back" style={styles.iconClose} />
            </Button>
            <Text style={this.withFontSize(styles.title, 1.1)}>
              #{id} {(fileName || '').limit(40)}
            </Text>
          </Header>
          <Content style={styles.container}>
            <KeyboardAvoidingView style={{ flexGrow: 1 }}>
              <View style={styles.detailImage}>
                <Image
                  source={{ uri: `data:image/png;base64,${fileData}` }}
                  style={styles.image}
                />
              </View>
              <View style={styles.detail}>
                {!!fileName &&
                  <Text style={this.withFontSize(styles.label)}>
                    {I18n.t('FILENAME')}: #{id} - {fileName}
                  </Text>}
                {!!fileSize &&
                  <Text style={this.withFontSize(styles.label)}>
                    {I18n.t('FILESIZE')}: {fileSize}
                  </Text>}
                {!!imageWidth &&
                  <Text style={this.withFontSize(styles.label)}>
                    {I18n.t('WIDTH')}: {imageWidth}px
                  </Text>}
                {!!imageHeight &&
                  <Text style={this.withFontSize(styles.label)}>
                    {I18n.t('HEIGHT')}: {imageHeight}px
                  </Text>}
                {isValid &&
                  <Text style={this.withFontSize(styles.label)}>
                    {I18n.t('ADDDATE')}:{' '}
                    {createdAt.format('DD/MM/YYYY hh:mm:ss')}
                  </Text>}
                {updatedAt.isValid() &&
                  <Text style={this.withFontSize(styles.label)}>
                    {I18n.t('EDITDATE')}:{' '}
                    {updatedAt.format('DD/MM/YYYY hh:mm:ss')}
                  </Text>}
                {synchedAt.isValid() &&
                  <Text style={this.withFontSize(styles.label)}>
                    {I18n.t('SYNCHRONZATIONDATE')}:{' '}
                    {synchedAt.format('DD/MM/YYYY hh:mm')}}
                  </Text>}
                <Text style={this.withFontSize(styles.label)}>
                  {I18n.t('LEGEND')}:
                </Text>
                <Input
                  autoFocus
                  multiline
                  value={legend}
                  returnKeyType="next"
                  textAlignVertical="top"
                  placeholder={I18n.t('CONTENT')}
                  ref={ref => (this.legend = ref)}
                  style={this.withFontSize(styles.comment)}
                  onChangeText={text => this.onChange(text, 'legend')}
                />
                <Text style={styles.label} />
              </View>
            </KeyboardAvoidingView>
          </Content>
          <Footer style={styles.footer}>
            <Button onPress={this.onDelete} style={styles.btnDelete}>
              <Text style={styles.textWhite}>
                {I18n.t('DELETE')}
              </Text>
            </Button>
            <Button onPress={this.onEdit} style={styles.btnEdit}>
              <Text style={styles.textWhite}>
                {I18n.t('CHANGE_CAPTION')}
              </Text>
            </Button>
            <Button onPress={this.onShare} style={styles.btnFooter}>
              <Text style={styles.textWhite}>
                {I18n.t('SHARE')}
              </Text>
            </Button>
          </Footer>
        </Container>
      </Modal>
    )
  }
}

export default MediaDetail
