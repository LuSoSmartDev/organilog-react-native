import { Platform } from 'react-native'

export default {
  container: {
    backgroundColor: '#ededed',
  },
  header: {
    height: Platform.OS === 'ios' ? 68 : 48,
    backgroundColor: '#4a8bdb',
  },
  backbutton: {
      width: 60,
      height:40,
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
    marginLeft: 15,
    marginRight: 15,
  },
  item: {
    margin: 0,
    marginLeft: 0,
  },
  cateHeader: {
    margin: 0,
    paddingTop: 0,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 0,
    paddingRight: 0,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#d5d5d5',
  },
  itemHeader: {
    margin: 0,
    paddingTop: 0,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 0,
    paddingRight: 0,
    paddingBottom: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#d5d5d5',
  },
  itemHeaderTitle: {
    fontSize: 15,
    padding: 10,
    paddingTop: 6,
    paddingBottom: 6,
    color: '#303030',
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  cateHeaderTitle: {
    fontSize: 18,
    padding: 10,
    paddingTop: 22.5,
    paddingBottom: 22.5,
    color: '#303030',
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  itemTitle: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '400',
  },
  itemCaption: {
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
    color: '#000000',
    fontWeight: '400',
  },
  checkbox: {
    borderColor: '#b8b8b8',
  },
  labelStyle: {
    margin: 0,
    padding: 0,
    marginLeft: 0,
    marginRight: 0,
  },
}
