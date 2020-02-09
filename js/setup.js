'use strict';
import React, { Component } from 'react'
import { StyleProvider } from 'native-base'
import './services/prototype'
import App from './App'
import getTheme from '../native-base-theme/components'
import platform from '../native-base-theme/variables/platform'

// if (process.env.NODE_ENV !== 'production') {
//   let createClass = React.createClass;
//   Object.defineProperty(React, 'createClass', {
//     set: (nextCreateClass) => {
//       createClass = nextCreateClass;
//     },
//   });

//   const { whyDidYouUpdate } = require('why-did-you-update')

//   whyDidYouUpdate(React, { include: /AppNavigator/ })
// }

export const Setup = () =>
  class Root extends Component {
    constructor(props) {
      super(props)
      this.state = {
        isLoading: false,
      }
    }

    render() {
      return (
        <StyleProvider style={getTheme(platform)}>
          <App />
        </StyleProvider>
      )
    }
  }

export default Setup
