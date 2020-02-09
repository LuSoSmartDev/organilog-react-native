import { Platform } from 'react-native'

const MAX_ITEM = 450
const MAX_LOGO_WIDTH = 140
const MAX_LOGO_HEIGHT = 150

export default {
  container: {
    backgroundColor: '#dddddd',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    height: Platform.OS === 'ios' ? 68 : 48,
    backgroundColor: '#222222',
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
    resizeMode: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  form: {
    flex: 1,
    marginTop: 40,
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
  overlay: {},
}
