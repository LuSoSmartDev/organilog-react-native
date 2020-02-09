// Fork from https://github.com/recr0ns/react-native-material-switch/pull/22
import React, { Component, PropTypes } from 'react'
import { PanResponder, View, TouchableHighlight, Animated } from 'react-native'

class MaterialSwitch extends Component {
  constructor(props) {
    super(props)
    const {
      switchHeight,
      switchWidth,
      buttonRadius,
      buttonOffset,
      active,
    } = props
    const w =
      switchWidth - Math.min(switchHeight, buttonRadius * 2) - buttonOffset
    this.state = {
      width: w,
      state: active,
      position: new Animated.Value(active ? w : buttonOffset),
    }

    this.start = {}
    this.padding = 8

    this.activate = this.activate.bind(this)
    this.deactivate = this.deactivate.bind(this)
  }

  componentWillReceiveProps({ active }) {
    if (this.state.state !== active) {
      if (active) this.activate()
      else this.deactivate()
    }
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (evt, gestureState) => {
        if (!this.props.enableSlide) return

        this.setState({ pressed: true })
        this.start.x0 = gestureState.x0
        this.start.pos = this.state.position._value
        this.start.moved = false
        this.start.state = this.state.state
        this.start.stateChanged = false
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!this.props.enableSlide) return

        this.start.moved = true
        if (this.start.pos === 0) {
          if (gestureState.dx <= this.state.width && gestureState.dx >= 0) {
            this.state.position.setValue(gestureState.dx)
          }
          if (gestureState.dx > this.state.width) {
            this.state.position.setValue(this.state.width)
          }
          if (gestureState.dx < 0) {
            this.state.position.setValue(0)
          }
        }
        if (this.start.pos === this.state.width) {
          if (gestureState.dx >= -this.state.width && gestureState.dx <= 0) {
            this.state.position.setValue(this.state.width + gestureState.dx)
          }
          if (gestureState.dx > 0) {
            this.state.position.setValue(this.state.width)
          }
          if (gestureState.dx < -this.state.width) {
            this.state.position.setValue(0)
          }
        }
        const currentPos = this.state.position._value
        this.onSwipe(
          currentPos,
          this.start.pos,
          () => {
            if (!this.start.state) this.start.stateChanged = true
            this.setState({ state: true })
          },
          () => {
            if (this.start.state) this.start.stateChanged = true
            this.setState({ state: false })
          }
        )
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: () => {
        this.setState({ pressed: false })
        const currentPos = this.state.position._value
        if (
          !this.start.moved ||
          (Math.abs(currentPos - this.start.pos) < 5 &&
            !this.start.stateChanged)
        ) {
          this.toggle()
          return
        }

        this.onSwipe(currentPos, this.start.pos, this.activate, this.deactivate)
      },
      onPanResponderTerminate: () => {
        const currentPos = this.state.position._value
        this.setState({ pressed: false })
        this.onSwipe(currentPos, this.start.pos, this.activate, this.deactivate)
      },
      onShouldBlockNativeResponder: () => true,
    })
  }

  onSwipe(currentPosition, startingPosition, onChange, onTerminate) {
    if (currentPosition - startingPosition >= 0) {
      if (
        currentPosition - startingPosition > this.state.width / 2 ||
        startingPosition === this.state.width
      )
        onChange()
      else onTerminate()
    } else if (currentPosition - startingPosition < -this.state.width / 2)
      onTerminate()
    else onChange()
  }

  activate() {
    Animated.timing(this.state.position, {
      toValue: this.state.width,
      duration: this.props.switchAnimationTime,
      useNativeDriver: true,
    }).start()
    this.changeState(true)
  }

  deactivate() {
    Animated.timing(this.state.position, {
      toValue: this.props.buttonOffset,
      duration: this.props.switchAnimationTime,
      useNativeDriver: true,
    }).start()
    this.changeState(false)
  }

  changeState(state) {
    const callHandlers = this.start.state !== state
    setTimeout(() => {
      this.setState({ state })
      if (callHandlers) {
        this.callback()
      }
    }, this.props.switchAnimationTime / 2)
  }

  callback() {
    const state = this.state.state
    if (state) {
      this.props.onActivate()
    } else {
      this.props.onDeactivate()
    }
    this.props.onChangeState(state)
  }

  toggle() {
    if (!this.props.enableSlide) return
    if (this.state.state) {
      this.deactivate()
    } else {
      this.activate()
    }
  }

  render() {
    const doublePadding = this.padding * 2 - 2
    const halfPadding = doublePadding / 2
    const { state: stateStatus, pressed } = this.state
    const {
      switchWidth,
      buttonRadius,
      switchHeight,
      buttonShadow,
      buttonContent,
      inactiveButtonColor,
      activeBackgroundColor,
      inactiveBackgroundColor,
      inactiveButtonPressedColor,
      activeButtonPressedColor,
      activeButtonColor,
    } = this.props

    const statePress = pressed ? activeButtonPressedColor : activeButtonColor
    const instatePress = pressed
      ? inactiveButtonPressedColor
      : inactiveButtonColor
    const backgroundColor = stateStatus ? statePress : instatePress
    const left =
      switchHeight / 2 > buttonRadius
        ? halfPadding
        : halfPadding + switchHeight / 2 - buttonRadius

    return (
      <View
        {...this._panResponder.panHandlers}
        style={{ padding: this.padding, position: 'relative' }}
      >
        <View
          style={{
            backgroundColor: stateStatus
              ? activeBackgroundColor
              : inactiveBackgroundColor,
            height: switchHeight,
            width: switchWidth,
            borderRadius: switchHeight / 2,
          }}
        />
        <TouchableHighlight
          underlayColor="transparent"
          activeOpacity={1}
          style={{
            top: 1,
            left: 1,
            position: 'absolute',
            width: switchWidth + doublePadding,
            height: Math.max(
              buttonRadius * 2 + doublePadding,
              switchHeight + doublePadding
            ),
          }}
        >
          <Animated.View
            style={[
              {
                backgroundColor,
                height: this.props.buttonRadius * 2,
                width: this.props.buttonRadius * 2,
                borderRadius: this.props.buttonRadius,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                position: 'absolute',
                top: halfPadding + switchHeight / 2 - buttonRadius,
                left,
                transform: [{ translateX: this.state.position }],
              },
              buttonShadow,
            ]}
          >
            {buttonContent}
          </Animated.View>
        </TouchableHighlight>
      </View>
    )
  }
}

MaterialSwitch.propTypes = {
  switchWidth: PropTypes.number,
  switchHeight: PropTypes.number,
  buttonOffset: PropTypes.number,
  buttonRadius: PropTypes.number,
  switchAnimationTime: PropTypes.number,
  active: PropTypes.bool,
  enableSlide: PropTypes.bool,
  buttonContent: PropTypes.any,
  buttonShadow: PropTypes.object,
  inactiveButtonColor: PropTypes.string,
  inactiveButtonPressedColor: PropTypes.string,
  activeButtonColor: PropTypes.string,
  activeButtonPressedColor: PropTypes.string,
  activeBackgroundColor: PropTypes.string,
  inactiveBackgroundColor: PropTypes.string,
  onActivate: PropTypes.func,
  onDeactivate: PropTypes.func,
  onChangeState: PropTypes.func,
}

MaterialSwitch.defaultProps = {
  active: true,
  style: {},
  inactiveButtonColor: '#3e474f',
  inactiveButtonPressedColor: '#c6c4c5',
  activeButtonColor: '#5c9ded',
  activeButtonPressedColor: '#5c9ded',
  buttonShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 1,
    elevation: 3,
    shadowOffset: { height: 1, width: 0 },
  },
  activeBackgroundColor: '#c6c4c5',
  inactiveBackgroundColor: '#c6c4c5',
  buttonRadius: 12,
  switchWidth: 40,
  switchHeight: 17,
  buttonContent: null,
  buttonOffset: 0,
  enableSlide: true,
  switchAnimationTime: 200,
  onActivate: () => {},
  onDeactivate: () => {},
  onChangeState: () => {},
}

export default MaterialSwitch
