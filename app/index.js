import {StackNavigator} from 'react-navigation'
import * as firebase from 'firebase'
import Home from './screens/home'
import Login from './screens/login'
import Chat from './screens/chat'


const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  databaseURL: "YOUR_DATABASE_URL",
}

firebase.initializeApp(firebaseConfig)

const RouteConfigs = {
  Login: {screen:Login},
  Home: {screen:Home},
  Chat: {screen:Chat},
}

const StackNavigatorConfig = {
  headerMode:'none',
}

export default StackNavigator(RouteConfigs, StackNavigatorConfig)
