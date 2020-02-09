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
    padding: 20,
  },
  group: {
    marginLeft: 0,
    marginTop: 15,
    paddingLeft: 0,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginLeft: 0,
    color: '#303030',
    fontWeight: 'bold',
  },
  groupContent: {
    marginLeft: 0,
    minHeight: 100,
    marginBottom: 20,
  },
  content: {
    marginTop: 10,
    marginLeft: 0,
    paddingLeft: 0,
  },
  input: {
    marginLeft: 0,
    paddingLeft: 0,
  },
  picker: {
    flex: 1,
    marginLeft: 0,
    paddingLeft: 0,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#b4b4b4',
  },
  pickerText: {
    flex: 1,
    marginLeft: 0,
    paddingLeft: 0,
  },
  pickerItem: {
    marginLeft: 10,
    marginRight: 10,
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
