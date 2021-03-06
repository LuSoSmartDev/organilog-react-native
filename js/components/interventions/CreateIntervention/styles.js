import { Platform, Dimensions } from 'react-native'

const w = Dimensions.get('window').width
const h = Dimensions.get('window').height

const MAX_ITEM = 450
const MAX_LOGO_WIDTH = 140
const MAX_LOGO_HEIGHT = 150

export default {
  container: {
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: Platform.OS === 'ios' ? 68 : 48,
    backgroundColor: '#4A8BDB',
  },
  title: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  organilogLogo: {
    marginTop: 2,
    alignSelf: 'center',
    resizeMode: 'contain',
    width: MAX_LOGO_WIDTH,
    height: MAX_LOGO_HEIGHT,
  },
  logoText: {
    color: '#FFFFFF',
  },
  organilogIcon: {
    width: 35,
    height: 27,
    marginRight: 3,
    // resizeMode: 'center',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  form: {
    marginTop: 0,
    alignItems: 'center',
  },
  input: {
    margin: 8,
    marginTop: 0,
    marginLeft: 8,
    maxWidth: MAX_ITEM,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  itemInput: {
    maxHeight: 38,
  },
  btn: {
    flex: 1,
    height: 48,
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#428bca',
  },
  itemBtn: {
    margin: 8,
    marginTop: 0,
    marginLeft: 8,
    maxWidth: MAX_ITEM,
    borderRadius: 3,
  },
  bottom: {
    color: '#79c6e1',
  },
  btnFooter: {
    alignSelf: 'center',
  },
  wait: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waiting: {
    margin: 20,
    fontSize: 18,
    marginTop: 40,
    color: '#323232',
    alignSelf: 'center',
    textAlign: 'center',
  },
  view_title: {
    width: w,
    height: 30,
    backgroundColor: 'gray',
    marginTop: 10,
  },
  view_title_1: {
    width: w,
    height: 28,
    backgroundColor: '#ededed',
    position: 'absolute',
    top: 1,
  },
  text_title: {
    marginTop: 5,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 15,
    // alignSelf: 'center',
  },
  btn_view: {
    width: w - 30,
    marginTop: 10,
    height: 40,
    backgroundColor: '#ededed',
    marginLeft: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#c5c5c5',
  },
  btn_text: {
    textAlign: 'center',
    top: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  btn_icon: {
    position: 'absolute',
    left: 20,
    top: 5,
    fontSize: 25,
  },
  listView: {
    width: w - 30,
    marginLeft: 15,
    marginTop: 5,
  },
  itemGrid: {
    width: w / 3 - 2,
    backgroundColor: 'white',
    marginLeft: 1,
    marginTop: 1,
  },
  itemImage: {
    width: w / 3 - 2,
    height: w / 3 - 2 > 100 ? w / 3 - 2 : 100,
  },
  itemLine: {
    width: w / 3 - 2,
    height: 1,
    backgroundColor: '#c5c5c5',
  },
  itemContent: {
    width: w / 3 - 2,
    height: 30,
  },
  itemTime: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  itemButton: {
    height: 30,
    borderRadius: 0,
  },
  labelInput_view: {
    width: w - 20,
    marginTop: 5,
    marginLeft: 10,
  },
  input_client: {
    width: w - 20,
    height: 40,
    paddingLeft: 0,
  },
  line: {
    width: w - 20,
    height: 1,
    marginTop: 5,
    backgroundColor: '#cccccc',
  },
  label_client: {
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  scrollview: {
    marginBottom: 20,
  },
  multiButton: {
    width: w - 95,
  },
  button_2: {
    width: 60,
    marginLeft: 5,
    backgroundColor: '#ededed',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#c5c5c5',
    height: 40,
    marginTop: 10,
  },
  signature: {
    flex: 1,
  },
  buttonStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#eeeeee',
    margin: 10,
  },
  comment_input: {
    flex: 1,
    fontSize: 14,
    marginTop: 10,
  },
  comment_input_view: {
    marginTop: 10,
    width: w - 30,
    height: 100,
    borderColor: '#cccccc',
    borderWidth: 1,
    marginLeft: 15,
  },
  btn_Add: {
    marginLeft: 15,
    width: w - 30,
    height: 50,
    marginTop: 20,
    backgroundColor: '#47cec0',
    borderRadius: 0,
  },
  autocompleteContainer: {
    marginLeft: 10,
    marginRight: 10,
  },
  overlay: {
    left: 15,
    width: w - 30,
    position: 'absolute',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 1.0,
    shadowOffset: {
      height: 10,
      width: 10,
    },
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  hidden_overlay: {
    width: 0,
    height: 0,
  },
  row_line: {
    backgroundColor: '#f6f6f6',
    height: 1,
    width: w - 20 - 20,
    marginLeft: 10,
    marginTop: 5,
  },
  intervenatTab_input: {
    width: w - 30,
    marginLeft: 15,
    paddingLeft: 5,
    marginTop: 10,
    height: 40,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#c5c5c5',
    borderRadius: 5,
  },
  intervenatTab_view: {
    width: w - 30,
    height: 40,
    marginLeft: 15,
    marginBottom: 5,
    backgroundColor: '#dedede',
    borderRadius: 5,
  },
  intervenatTab_line: {
    width: w - 30,
    height: 1,
    marginLeft: 15,
    backgroundColor: '#cccccc',
  },
  intervenatTab_text: {
    width: w - 30,
    marginLeft: 5,
    marginTop: 10,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  listSpeaker: {
    marginTop: 10,
    width: w,
    marginBottom: 5,
  },
  speaker_btn: {
    width: 40,
    height: 40,
    position: 'absolute',
    right: 1,
  },
  speaker_icon: {
    marginTop: 7,
    marginLeft: 5,
    fontSize: 25,
  },
  containerItemProductSelected: {
    width: w - 30,
    flex:1, 
    flexDirection:'row',
    alignItems: 'stretch',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  quantityProductSelected: {
    width: 40,
    fontSize: 14,
    alignItems: 'stretch',
    color:'gray'
  },
  nomProductSelected: {
    fontSize: 16,
    color:'#000000',
    paddingLeft:10,
    alignItems: 'stretch'
  },
  modalFilliale: {
    width: w,
    height: 200,
    top: (h-200) / 2,
  }
}
