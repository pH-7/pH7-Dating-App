import React, {Component} from 'react'
import {Image, PixelRatio} from 'react-native'

export default class CircleImage extends Component {
  render() {
    const {size, facebookID} = this.props
    const imageSize = PixelRatio.getPixelSizeForLayoutSize(size)
    const fbImage = `https://graph.facebook.com/${facebookID}/picture?height=${imageSize}`
    return (
      <Image
        source={{uri:fbImage}}
        style={{width:size, height:size, borderRadius:size / 2}}
      />
    )
  }
}
