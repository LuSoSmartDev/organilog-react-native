import React, { Component } from 'react'
import { Image, View, TouchableOpacity } from 'react-native'
import moment from 'moment'
import { Text, Label, Icon, Button } from 'native-base'
import I18n from 'react-native-i18n'
import GridView from 'react-native-grid-view'
import styles from './styles'

class MediaSection extends Component {
  static propTypes = {
    onToggleModal: React.PropTypes.func,
    dataSource: React.PropTypes.array,
    selectPhotoFromLibrary: React.PropTypes.func,
    selectPhotoFromCamera: React.PropTypes.func,
    removeItemMedia: React.PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      dataSource: props.dataSource,
    }
    this.renderItem = this.renderItem.bind(this)
  }

  componentWillMount() {}

  componentWillReceiveProps(nextProps) {
    const { dataSource } = this.state
    if (nextProps.dataSource !== dataSource) {
      this.setState({
        dataSource: nextProps.dataSource,
      })
    }
  }

  renderHeader(name) {
    return (
      <View style={styles.view_title}>
        <View style={styles.view_title_1}>
          <Label style={styles.text_title}>
            {I18n.t(name)}
          </Label>
        </View>
      </View>
    )
  }

  renderGrid() {
    return (
      <GridView
        enableEmptySections
        items={this.state.dataSource}
        itemsPerRow={3}
        renderItem={this.renderItem}
        style={styles.listView}
      />
    )
  }

  renderItem(item, index) {
    return (
      <View style={styles.itemGrid} key={index}>
        <Image
          source={{ uri: `data:image/png;base64,${item.fileData}` }}
          style={styles.itemImage}
        />
        <View style={styles.itemLine} />
        <View style={styles.itemContent}>
          <Text style={styles.itemTime}>
            {moment().format('DD/MM/YYYY')}
          </Text>
        </View>
        <Button
          onPress={() => this.props.removeItemMedia(index, item)}
          style={styles.itemButton}
          block
          danger
        >
          <Text style={{ fontSize: 12 }}>
            {I18n.t('DELETE')}
          </Text>
        </Button>
      </View>
    )
  }

  renderButtons() {
    return (
      <View>
        <TouchableOpacity onPress={() => this.props.selectPhotoFromCamera()}>
          <View style={styles.btn_view}>
            <Text style={styles.btn_text}>
              {I18n.t('TAKE_PHOTO')}
            </Text>
            <Icon name="md-camera" style={styles.btn_icon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.selectPhotoFromLibrary()}>
          <View style={styles.btn_view}>
            <Text style={styles.btn_text}>
              {I18n.t('SEARCH_PHOTO')}
            </Text>
            <Icon name="ios-folder-open" style={styles.btn_icon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.onToggleModal()}>
          <View style={styles.btn_view}>
            <Text style={styles.btn_text}>Signature</Text>
            <Icon name="md-create" style={styles.btn_icon} />
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <View>
        {this.renderHeader('MEDIA')}
        {this.renderButtons()}
        {this.renderGrid()}
      </View>
    )
  }
}

export default MediaSection
