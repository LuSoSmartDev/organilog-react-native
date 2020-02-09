import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  alignSelfStart: {
    alignSelf: 'flex-start',
  },
  alignSelfEnd: {
    alignSelf: 'flex-end',
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flexDirection: 'column',
  },
  alignCenter: {
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  centerCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerAround: {
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  centerBetween: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  absoluteFull: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  fullHeight: {
    height: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  flex1: {
    flex: 1
  },
  wrap: {
    flexWrap: 'wrap',
  },
})
