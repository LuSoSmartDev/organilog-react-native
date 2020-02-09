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
    // resizeMode: 'center',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  form: {
    padding: 15,
  },
  group: {
    marginLeft: 0,
    marginBottom: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#a6a6a6',
  },
  content: {
    minHeight: 150,
  },
  btnSend: {
    flex: 1,
    minHeight: 50,
    borderRadius: 3,
    backgroundColor: '#47cec0',
  },
  btnSendText: {
    color: '#303030',
    fontWeight: '600',
  },
}
