import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native'

const {width, height} = Dimensions.get('window')

export default class SimpleScroller extends Component {
  componentWillMount() {
    this.pan = new Animated.Value(0)

    this.scrollResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (e, {dx, dy}) => Math.abs(dx) > Math.abs(dy),
      onPanResponderGrant: () => {
        this.pan.setOffset(this.pan._value)
        this.pan.setValue(0)
      },
      onPanResponderMove: Animated.event([
        null,
        {dx:this.pan},
      ]),
      onPanResponderReject: this.handlePanResponderEnd,
      onPanResponderRelease: this.handlePanResponderEnd,
    })
  }

  handlePanResponderEnd = (e, {vx}) => {
    this.pan.flattenOffset()
    let move = Math.round(this.pan._value / width) * width

    if (Math.abs(vx) > 0.25) {
      const direction = vx / Math.abs(vx)
      const scrollPos = direction > 0 ? Math.ceil(this.pan._value / width) : Math.floor(this.pan._value / width)
      move = scrollPos * width
    }
    const minScroll = (this.props.screens.length - 1) * -width
    Animated.spring(this.pan, {
      toValue: this.clamp(move, minScroll, 0),
      bounciness: 0,
    }).start()
  }

  clamp = (num, min, max) => {
    return num <= min ? min : num >= max ? max : num
  }

  render() {
    const animatedStyles = {
      transform: [
        {translateX:this.pan},
      ],
    }
    const scrollerWidth = this.props.screens.length * width
    return (
      <Animated.View
        style={[styles.scroller, animatedStyles, {width:scrollerWidth}]}
        {...this.scrollResponder.panHandlers}>
        {this.props.screens.map((screen, i) => <View key={i} style={{width, height}}>{screen}</View>)}
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  scroller: {
    flex:1,
    backgroundColor:'white',
    flexDirection:'row',
  },
})
