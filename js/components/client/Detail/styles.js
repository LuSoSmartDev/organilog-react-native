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
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  item: {
    padding: 10,
    marginLeft: 0,
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomWidth: 0,
  },
  itemHeader: {
    padding: 10,
    marginLeft: 0,
    paddingTop: 5,
    paddingBottom: 5,
  },
  itemHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 15,
  },
  btnCall: {
    height: 20,
    paddingTop: 0,
    paddingLeft: 0,
    paddingBottom: 0,
  },
  phone: {
    color: 'blue',
  },
  group: {
    flexDirection: 'row',
  },
  label: {
    fontWeight: 'bold',
  },
  valSpecial: {
    color: '#44B0D7',
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
  },
  listItem: {
    padding: 10,
    marginLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  listItemHeader: {
    padding: 10,
    marginLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  headerBarTable: {
    alignItems: 'center',
    backgroundColor: '#5c9ded',
    borderWidth:1,
    borderColor:'#3d444e',
  },
  rowTable: {
    alignItems: 'center',
    borderWidth:1,
    borderColor:'#3d444e',
  },
  separateVerticalRow: {
    width:1,
    alignSelf: 'stretch', 
    backgroundColor:'#3d444e', 
  },
  headerLabelTable: {
    padding:5,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  tableValShort: {
    padding:5,
    textAlign: 'center',
    fontSize: 12,
    color: '#212121',
    fontWeight: '600',
  },
  tableValLength: {
    padding:5,
    fontSize: 12,
    color: '#212121',
    fontWeight: '600',
  },
}
