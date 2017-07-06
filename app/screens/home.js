import Exponent from 'exponent'
import React, {Component} from 'react'
import {View} from 'react-native'
import * as firebase from 'firebase'
import GeoFire from 'geofire'

import Profile from './profile'
import Matches from './matches'

import Card from '../components/card'
import SimpleScroller from '../components/simpleScroller'

import filter from '../modules/filter'

export default class Home extends Component {

  state = {
    profileIndex: 0,
    profiles: [],
    user: this.props.navigation.state.params.user,
  }

  componentWillMount() {
    const {uid} = this.state.user
    this.updateUserLocation(uid)
    firebase.database().ref('users').child(uid).on('value', snap => {
      const user = snap.val()
      this.setState({
        user,
        profiles:[],
        profileIndex:0,
      })
      this.getProfiles(user.uid, user.distance)
    })
  }

  getUser = (uid) => {
    return firebase.database().ref('users').child(uid).once('value')
  }

  getSwiped = (uid) => {
    return firebase.database().ref('relationships').child(uid).child('liked')
      .once('value')
      .then(snap => snap.val() || {})
  }

  getProfiles = async (uid, distance) => {
    const geoFireRef = new GeoFire(firebase.database().ref('geoData'))
    const userLocation = await geoFireRef.get(uid)
    const swipedProfiles = await this.getSwiped(uid)
    console.log('userLocation', userLocation)
    const geoQuery = geoFireRef.query({
      center: userLocation,
      radius: distance, //km
    })
    geoQuery.on('key_entered', async (uid, location, distance) => {
      console.log(uid + ' at ' + location + ' is ' + distance + 'km from the center')
      const user = await this.getUser(uid)
      console.log(user.val().first_name)
      const profiles = [...this.state.profiles, user.val()]
      const filtered = filter(profiles, this.state.user, swipedProfiles)
      this.setState({profiles: filtered})
    })
  }

  updateUserLocation = async (uid) => {
    const {Permissions, Location} = Exponent
    const {status} = await Permissions.askAsync(Permissions.LOCATION)
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({enableHighAccuracy: false})
      // const {latitude, longitude} = location.coords
      const latitude = 37.39239 //demo lat
      const longitude = -122.09072 //demo lon

      const geoFireRef = new GeoFire(firebase.database().ref('geoData'))
      geoFireRef.set(uid, [latitude, longitude])

      console.log('Permission Granted', location)
    } else {
      console.log('Permission Denied')
    }
  }

  relate = (userUid, profileUid, status) => {
    let relationUpdate = {}
    relationUpdate[`${userUid}/liked/${profileUid}`] = status
    relationUpdate[`${profileUid}/likedBack/${userUid}`] = status

    firebase.database().ref('relationships').update(relationUpdate)
  }

  nextCard = (swipedRight, profileUid) => {
    const userUid = this.state.user.uid
    this.setState({profileIndex: this.state.profileIndex + 1})
    if (swipedRight) {
      this.relate(userUid, profileUid, true)
    } else {
      this.relate(userUid, profileUid, false)
    }
  }

  cardStack = () => {
    const {profileIndex} = this.state
    return (
      <View style={{flex:1}}>
        {this.state.profiles.slice(profileIndex, profileIndex + 3).reverse().map((profile) => {
          return (
            <Card
              key={profile.id}
              profile={profile}
              onSwipeOff={this.nextCard}
            />
          )
        })}
      </View>
    )
  }

  render() {
    return (
      <SimpleScroller
        screens={[
          <Profile user={this.state.user} />,
          this.cardStack(),
          <Matches navigation={this.props.navigation} user={this.state.user} />,
          ]}
      />
    )
  }
}
