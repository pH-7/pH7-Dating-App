console.ignoredYellowBox = ['Warning: Failed prop type: Invalid prop `keyboardShouldPersistTaps`']

import React, {Component} from 'react'
import {
  View,
} from 'react-native'

import * as firebase from 'firebase'

import {GiftedChat} from 'react-native-gifted-chat'

export default class Chat extends Component {

  state={
    messages:[],
    user: this.props.navigation.state.params.user,
    profile: this.props.navigation.state.params.profile,
  }

  componentWillMount() {
    const {user, profile} = this.state
    this.chatID = user.uid > profile.uid ? user.uid + '-' + profile.uid : profile.uid + '-' + user.uid
    this.watchChat()
  }

  watchChat = () => {
    firebase.database().ref('messages').child(this.chatID).on('value', snap => {
      let messages = []
      snap.forEach(message => {
        messages.push(message.val())
      })
      messages.reverse()
      this.setState({messages})
    })
  }

  onSend = (message) => {
    firebase.database().ref('messages').child(this.chatID)
      .push({
        ...message[0],
        createdAt: new Date().getTime(),
      })
  }

  render() {
    const avatarSize = 80
    const avatar = `https://graph.facebook.com/${this.state.user.id}/picture?height=${avatarSize}`
    return (
      <GiftedChat
        messages={this.state.messages}
        user={{_id: this.state.user.uid, avatar}}
        onSend={this.onSend}
      />
    )
  }
}
