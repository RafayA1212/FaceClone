import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Friends from "../components/Friends";
import Login from "../components/Login";
import Message from "../components/Message";
import ProfilePage from "../components/ProfilePage";
import SignUp from "../components/SignUp";
import FriendRequests from "../components/FriendRequests";

const Stack = createNativeStackNavigator();

export default function HomeScreen() {

  return (

          <Stack.Navigator initialRouteName="Login"
          screenOptions={{
          headerShown: false,
          headerBackVisible: true, 
          headerTintColor: '#1877f2',
          headerTitleAlign: 'center',
          headerShadowVisible: false}}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="Friends" component={Friends} />
            <Stack.Screen name="ProfilePage" component={ProfilePage} />
            <Stack.Screen name="Message" component={Message} />
            <Stack.Screen name="FriendRequests" component={FriendRequests} />

          </Stack.Navigator>
  );
}

