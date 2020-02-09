import { Platform } from 'react-native'

export default {
  container: {
    backgroundColor: '#ededed',
  },
  header: {
    height: Platform.OS === 'ios' ? 68 : 48,
    backgroundColor: '#4a8bdb',
  },
  title: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  organilogIcon: {
    width: 35,
    height: 27,
    // resizeMode: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    marginLeft: 0,
    marginRight: 0,
  },
  item: {
    padding: 10,
    marginLeft: 0,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    flexDirection: 'row',
    borderBottomColor: '#d9d9d9',
  },
  searchBox: {
    backgroundColor: '#E0E2E4',
    height: 40,
    marginBottom: 15,
    marginTop: 5
  },
}
