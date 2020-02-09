import { Platform } from 'react-native'

export default {
  header: {
    height: 45,
    paddingTop: 0,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#5c9ded',
  },
  title: {
    fontSize: 14,
    color: '#FFFFFF',
    paddingLeft: 20,
    paddingRight: 20,
    fontWeight: '400',
    ...Platform.select({
      android: {
        fontWeight: '200',
      },
    }),
  },
  btn: {
    maxWidth: 40,
    maxHeight: 40,
  },
  icon: {
    height: 10,
    resizeMode: 'contain',
  },
}
