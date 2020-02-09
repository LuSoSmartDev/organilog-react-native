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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLeft: {
    flex: 1,
    paddingLeft: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  itemRight: {
    flex: 0,
    maxWidth: 120,
    marginLeft: 10,
  },
  list: {
    marginLeft: 0,
    marginRight: 0,
  },
  item: {
    padding: 2,
    marginLeft: 0,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    borderBottomColor: '#d9d9d9',
  },
  itemText: {
    fontSize: 14,
    color: '#323232',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  itemCaption: {
    fontSize: 14,
    color: '#323232',
    textAlign: 'left',
  },
  time: {
    fontSize: 12,
    color: '#777777',
    fontWeight: 'bold',
    textAlign: 'right',
  },
}
