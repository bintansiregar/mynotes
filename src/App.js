import React, { useState, useEffect }  from 'react';
import { TouchableOpacity, Appearance, View, useColorScheme  } from 'react-native';
import { NavigationContainer, useTheme, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Context, initState } from './Store';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faPlus, faBell, faBars, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { init } from './helpers';

import ListNote from './Screens/ListNote';
import Add from './Screens/Add';
import SignIn from './Screens/SignIn';
import SignUp from './Screens/SignUp';
import ChangeServer from './Screens/ChangeServer';
import Loading from './Components/Loading';

const Stack = createNativeStackNavigator();

const App = () => {
  const [state, update] = useState(initState);
  const scheme = useColorScheme();
  console.log('[APP]')
  useEffect(() => {
    if(state.isReady) return;
    console.log('[APP] > useEffect')
    init(state, update)
  }, [state.isReady]);

  const handleLogout = async () => {
    await EncryptedStorage.removeItem('accessToken');
    await EncryptedStorage.removeItem('userData');
    await EncryptedStorage.removeItem('notes');
    update(prevState => ({ ...prevState, isAuthenticated: false, notes: [], userData: null, accessToken: null }))
  }
  console.log('[APP] isReady >', state.isReady)
  return (
    <Context.Provider value={{ state, update }}>
      <Loading visible={state.isLoading} loadingMessage="Loading..." />
      <NavigationContainer theme={scheme === "dark" ? DarkTheme : DefaultTheme}>
        { state.isReady &&
        
        <Stack.Navigator screenOptions={({navigation}) => ({
          headerRight:() => (
            <View style={{ flexDirection: 'row'}}>
              <View>
                <TouchableOpacity onPress={() => navigation.navigate('Add')} style={{ padding: 8}}>
                  <FontAwesomeIcon color={scheme === "dark" ? "#fff" : "#000"} icon={ faPlus } size={20} />
                </TouchableOpacity>
              </View>
              <View style={{ marginLeft: 5, marginRight: -5 }}>
                <TouchableOpacity onPress={() => handleLogout()} style={{ padding: 8}}>
                  <FontAwesomeIcon color={scheme === "dark" ? "#fff" : "#000"} icon={ faArrowRightFromBracket } size={20} />
                </TouchableOpacity>
              </View>
            </View>
            
          ) 
        })}>
          { !state.isAuthenticated ? (
            <Stack.Group screenOptions={{ headerShown: false }}>
              <Stack.Screen name="SignIn" component={SignIn} />
              <Stack.Screen name="SignUp" component={SignUp} />
              <Stack.Screen name="ChangeServer" component={ChangeServer} />
            </Stack.Group>
            ) : (
              <Stack.Group>
                <Stack.Screen name="ListNote" component={ListNote} options={{title: 'My Notes' }} />
                <Stack.Screen name="Add" component={Add} options={{ title: 'Create New' }} />
              </Stack.Group>
            )
          }
        </Stack.Navigator>
        
        }
      </NavigationContainer>
    </Context.Provider>
  );
};

export default App;
