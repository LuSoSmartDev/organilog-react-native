import { Platform } from 'react-native'

export default {
  container: {
    backgroundColor: '#ededed',
  },
  header: {
    height: Platform.OS === 'ios' ? 68 : 48,
    backgroundColor: '#4A8BDB',
  },
  title: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  organilogIcon: {
    width: 35,
    height: 27,
    resizeMode: 'center',
  },
  right: {
    transform: [
      {
        rotate: '90deg',
      },
    ],
  },
  iconReply: {
    fontSize: 30,
    color: '#FFFFFF',
    transform: [
      {
        rotate: '180deg',
      },
      {
        scaleY: -1,
      },
    ],
  },
  item: {
    marginLeft: 10,
    paddingTop: 12,
    paddingLeft: 0,
    marginRight: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'column',
    borderBottomColor: '#d9d9d9',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conent: {
    marginBottom: 10,
  },
  sender: {
    flex: 1,
    color: '#777777',
  },
  time: {
    color: '#777777',
  },
  a: {
    color: 'blue',
  },
}
