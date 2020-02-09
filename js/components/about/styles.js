import { Dimensions } from 'react-native'

const { height, width } = Dimensions.get('window')

const MAX_ITEM = 450
const MAX_LOGO_WIDTH = 200
const MAX_LOGO_HEIGHT = 250

export default {
  container: {
    backgroundColor: '#dddddd',
  },
  header: {
    backgroundColor: '#4A8BDB',
  },
  title: {
    color: '#FFFFFF',
  },
  organilogLogo: {
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
    // resizeMode: 'center',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  form: {
    flex: 1,
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
    maxHeight: 40,
  },
  btn: {
    flex: 1,
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
  footer: {
    height: 40,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
  },
  version: {
    alignSelf: 'center',
    fontSize: 16,
  },
  linkref: {
    alignSelf: 'center',
    fontSize: 16,
    color: '#74c6f0',
    marginTop: 20,
  },
  button: {
    flex: 1,
 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'gray',
    margin: 20,
    width: width - 40,
  },
  btnText: {
    color: 'black',
    fontWeight: '500',
  },
}
