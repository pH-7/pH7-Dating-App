import React, {Component} from 'react'
import {
  ListView,
  Text,
  View,
  TouchableHighlight,
} from 'react-native'

import * as firebase from 'firebase'
import _ from 'lodash'

import CircleImage from '../components/circleImage'

export default class Matches extends Component {

  state = {
    dataSource: new ListView.DataSource({rowHasChanged: (oldRow, newRow) => oldRow !== newRow }),
    matches: [],
  }

  componentWillMount() {
    this.getMatches(this.props.user.uid)
  }

  getOverlap = (liked, likedBack) => {
    const likedTrue = _.pickBy(liked, value => value)
    const likedBackTrue = _.pickBy(likedBack, value => value)
    return _.intersection(_.keys(likedTrue), _.keys(likedBackTrue))
  }

  getUser = (uid) => {
    return firebase.database().ref('users').child(uid).once('value')
      .then(snap => snap.val())
  }

  getMatches = (uid) => {
    firebase.database().ref('relationships').child(uid).on('value', snap => {
      const relations = snap.val() || []
      const allMatches = this.getOverlap(relations.liked, relations.likedBack)
      console.log('allMatches', allMatches)
      const promises = allMatches.map(profileUid => {
        const foundProfile = _.find(this.state.matches, profile => profile.uid === profileUid)
        return foundProfile ? foundProfile : this.getUser(profileUid)
      })
      Promise.all(promises).then(data => this.setState({
        dataSource: this.state.dataSource.cloneWithRows(data),
        matches: data,
      }))
    })
  }

  renderRow = (rowData) => {
    const {id, first_name, work} = rowData
    const bio = (work && work[0] && work[0].position) ? work[0].position.name : null
    return (
      <TouchableHighlight
        onPress={() => this.props.navigation.navigate('Chat', {user:this.props.user, profile:rowData})} >
        <View style={{flexDirection:'row', backgroundColor:'white', padding:10}} >
          <CircleImage size={80} facebookID={id} />
          <View style={{justifyContent:'center', marginLeft:10}} >
            <Text style={{fontSize:18}} >{first_name}</Text>
            <Text style={{fontSize:15, color:'darkgrey'}} >{bio}</Text>
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  renderSeparator = (sectionID, rowID) => {
    return (
      <View key={rowID} style={{height:1, backgroundColor:'whitesmoke', marginLeft:100}} />
    )
  }

  render() {
    return (
      <ListView
        style={{flex:1, backgroundColor:'white'}}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        renderSeparator={this.renderSeparator}
        enableEmptySections
      />
    )
  }
}


