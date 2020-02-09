import { Platform } from 'react-native'

export default {
  container: {
    backgroundColor: '#f1f2f4',
  },
  header: {
    borderBottomWidth: 0,
    backgroundColor: '#4a8bdb',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    fontSize: 26,
    marginRight: 12,
    color: '#FFFFFF',
  },
  rightIcon: {
    fontSize: 27,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '400',
    color: '#FFFFFF',
    ...Platform.select({
      android: {
        fontSize: 20,
        fontWeight: 'normal',
      },
    }),
  },
  row: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  mt: {
    marginTop: 18,
  },
  footer: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 15,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
  },
  btnAdd: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: '#47cec0',
  },
  btnAddText: {
    fontSize: 14,
  },
  sync: {
    height: 80,
  },
}
