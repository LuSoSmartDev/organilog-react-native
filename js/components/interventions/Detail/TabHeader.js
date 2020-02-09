import React, { PropTypes } from 'react'
import { Text, View, TouchableOpacity } from 'react-native'

import styles from './styles'

const TabHeader = props => {
  const { onChange, tabs, activeTab } = props

  return (
    <View elevation={5} style={styles.containerTab}>
      {tabs.map((tab, i) => {
        const isTabActive = activeTab === i

        return (
          <View key={i} style={styles.tab}>
            <TouchableOpacity style={styles.btnTab} onPress={() => onChange(i)}>
              <Text
                key={i}
                style={[styles.btnText, isTabActive && styles.activeTabText]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
            {isTabActive && <View style={styles.activeTab} />}
          </View>
        )
      })}
    </View>
  )
}

TabHeader.propTypes = {
  tabs: PropTypes.array,
  onChange: PropTypes.func,
  activeTab: PropTypes.number,
}

TabHeader.defaultProps = {
  tabs: [],
  onChange: () => {},
}

export default TabHeader
