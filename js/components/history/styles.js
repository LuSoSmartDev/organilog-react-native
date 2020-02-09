import { Platform } from 'react-native'
export default {
  container: {
    backgroundColor: '#ededed',
  },
  header: {
    height: Platform.OS === 'ios' ? 68 : 48,
    backgroundColor: '#4a8bdb',
  },
  titleHeader: {
    fontSize: 18,
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

  list: {},
  item: {
    paddingTop: 8,
    marginLeft: 0,
    paddingLeft: 20,
    paddingRight: 10,
    backgroundColor: '#FFFFFF',
  },
  left: {
    flex: 1,
    flexDirection: 'column',
  },
  btn: {
    margin: 0,
    padding: 0,
    maxWidth: 45,
    maxHeight: 40,
    marginLeft: 5,
    alignSelf: 'center',
    flexDirection: 'column',
  },
  btnIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  btnIconProgress: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    position:'absolute',
  },
  priority: {
    fontSize: 12,
    marginBottom: 5,
  },
  priority4: {
    color: 'red',
  },
  priority1: {
    color: 'gray',
  },
  priority3: {
    color: 'orange',
  },
  title: {
    color: '#828692',
    marginBottom: 5,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#202020',
  },
  address: {
    fontSize: 13,
    color: '#0d0d0d',
    marginBottom: 8,
  },
  time: {
    fontSize: 13,
    color: '#737373',
  },
}
