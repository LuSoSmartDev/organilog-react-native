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
    backgroundColor: '#4a8bdb',
  },
  title: {
    fontSize: 18,
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
    width: w - 20,
    height: 30,
    backgroundColor: 'gray',
    marginLeft: 10,
    marginTop: 10,
  },
  text_title: {
    marginTop: 5,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 10,
    // alignSelf: 'center',
  },
  btn_view: {
    width: w - 30,
    marginTop: 5,
    height: 50,
    backgroundColor: '#cccccc',
    marginLeft: 15,
  },
  btn_text: {
    textAlign: 'center',
    top: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  btn_icon: {
    position: 'absolute',
    left: 20,
    top: 10,
  },
  listView: {
    width: w - 30,
    marginLeft: 15,
    marginTop: 5,
  },
  itemGrid: {
    width: w / 3 - 2,
    height: w / 3 - 2 > 100 ? w / 3 - 2 : 100,
    backgroundColor: 'white',
    marginLeft: 1,
    marginTop: 1,
  },
  labelInput_view: {
    width: w - 20,
    height: 60,
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
  },
  scrollview: {
    width: w,
    height: h * 2,
  },
  multiButton: {
    width: w - 95,
  },
  button_2: {
    width: 60,
    marginLeft: 5,
    backgroundColor: '#cccccc',
    height: 50,
    marginTop: 5,
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
}
