import React, { useLayoutEffect, useContext, useEffect, useRef, useState } from 'react'
import {
	Alert,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	View,
	Appearance,
	TouchableNativeFeedback,
	Keyboard,
	useColorScheme
} from 'react-native';
import { useTheme, DarkTheme, DefaultTheme } from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Context } from '../../Store';

export default function ChangeServer({navigation}) {
	const { state, update } = useContext(Context);
	const [loginResult, setLoginResult] = useState(null);
	const [email, setEmail] = useState(null);
	const [password, setPassword] = useState(null);
	const [serverAddress, setServerAddress] = useState(state.serverAddress)
	const colorScheme = useColorScheme();
	const { colors } = useTheme();
	console.log('CHANGESERVER');
	const handleChangeServer = async (e) => {
		e.preventDefault();
		Keyboard.dismiss()
		
		if(!serverAddress || serverAddress === "") {
			Alert.alert('Warning', 'Server address cannot be empty');
			return;
		}

		await EncryptedStorage.setItem('serverAddress', serverAddress);
		update(prevState => ({ ...prevState, serverAddress: serverAddress }));

		Alert.alert('Info', 'Server address saved');
	}

	return (
		<View style={{ ...styles.container }}>
			<View style={styles.header}>
				<Text style={styles.logo}>My Notes</Text>
			</View>
			<View style={styles.loginBox}>
				<View style={{ width: 220 }}>
					<Text style={{ textAlign: 'center', marginBottom: 10 }}>Change Server Address</Text>
					<TextInput style={{
						marginBottom: 5
					}} value={serverAddress} onChangeText={setServerAddress} placeholder="ex: http://192.168.1.1:3000" />
				</View>

				<TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(colors.text, false)} onPress={(e) => handleChangeServer(e)} disabled={state.isLoading}>
					<View style={{
						backgroundColor: colors.text,
						alignItems: 'center',
						paddingTop: 12,
						paddingRight: 25,
						paddingBottom: 12,
						paddingLeft: 25,
						marginBottom: 20
					}}>
						<Text style={{ color: colors.background }}>Save</Text>
					</View>
				</TouchableNativeFeedback>

				<TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(colors.background, false)} onPress={(e) => navigation.navigate('SignIn')} disabled={state.isLoading}>
					<View style={{
						alignItems: 'center',
						paddingTop: 12,
						paddingRight: 25,
						paddingBottom: 12,
						paddingLeft: 25
					}}>
						<Text style={{ color: colorScheme === "dark" ? '#fff' : '#000' }}>Sign In</Text>
					</View>
				</TouchableNativeFeedback>
			</View>
			<View style={styles.footer}>
				<Text style={styles.footerText}>Proudly Powered by Bintan</Text>
				<Text style={styles.footerText}>Version 0.0.1</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%'
	},
	header: {
		alignSelf: 'center',
	},
	logo: {
		fontSize: 50,
		fontWeight: 'bold'
	},
	loginBox: {
		marginTop: 20,
	},
	footer: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
		marginBottom: 20,
		textAlign: 'center'
	},
	footerText: {
		textAlign: 'center'
	}
});
