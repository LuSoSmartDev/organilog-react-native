import { Dimensions, Platform } from 'react-native'

const { height, width } = Dimensions.get('window')

export default {
  sidebar: {
    flex: 1,
    paddingRight: 0,
    backgroundColor: '#fff',
  },
  text_item: {
    paddingLeft: 10,
    fontSize: 14,
  },
  header: {
    height: height * 0.2,
    width: width * 0.8, // width of left menu will take 80% of Screen
  },
  cover_image: {
    height: height * 0.2,
    width: width * 0.8,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cover: {
    height: height * 0.2,
    width: width * 0.8,
    backgroundColor: '#77c7ee',
    opacity: 0.6,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  imageCover: {
    width: 70,
    height: 70,
    marginTop: 20,
    borderWidth: 2,
    borderRadius: 70,
    overflow: 'hidden',
    alignSelf: 'center',
    borderColor: '#d3d3d3',
  },
  image_avatar: {
    width: 66,
    height: 66,
    borderRadius: 66,
    alignSelf: 'center',
    resizeMode: 'contain',
    ...Platform.select({
      ios: {
        width: 70,
        height: 70,
        borderRadius: 35,
      },
    }),
  },
  text_header: {
    alignSelf: 'center',
    marginTop: height * 0.2 / 2 - 10,
    color: 'white',
    backgroundColor: 'transparent',
    fontWeight: 'bold',
  },
  text_subname: {
    alignSelf: 'center',
    color: 'white',
    backgroundColor: 'transparent',
    fontSize: 12,
  },
  item_row: {
    height: 40,
    width: width * 0.8, // wi
    marginTop: 15,
    justifyContent: 'center',
    alignItems:'flex-start'
  },
  item_row2: {
    height: 40,
    marginTop: 15,
    flex: 1,
    flexDirection: 'row'
  },
  item_icon1: {
    width:30,
    marginLeft: 18,
    fontSize: 20,
  },
  item_icon: {
    marginLeft: 20,
    fontSize: 20,
  },
  item_name_menu: {
    position: 'absolute',
    left: 60,
    paddingRight: 60,
    // top: 20,
    fontSize: 16,
    fontWeight: '200',
    ...Platform.select({
      ios: {
        fontWeight: '500',
      },
    }),
  },
  item_badge_count: {
      width: 30,
      height: 30,
      backgroundColor: '#FF0000',
      left: Dimensions.get('window').width*3/4- 60,
  },

}
