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

export default function SignIn({navigation}) {
	const { state, update } = useContext(Context);
	const [loginResult, setLoginResult] = useState(null);
	const [email, setEmail] = useState(null);
	const [password, setPassword] = useState(null);
	const colorScheme = useColorScheme();
	const { colors } = useTheme();
	console.log('[SIGNIN]')
	useEffect(() => {
		if(loginResult !== null && loginResult.success) {
			update((prevState) => ({
				...prevState,
				isAuthenticated: loginResult.success,
				accessToken: loginResult.accessToken,
				userData: loginResult.userData,
				isLoading: false
			}));
		}
	}, [loginResult])

	const handleSignIn = async (e) => {
		e.preventDefault();
		
		if(!email || !password) {
			Alert.alert('Warning', 'Please input email and password');
			return;
		}

		try {
			update((prevState) => ({ ...prevState, isLoading: true }));
			Keyboard.dismiss();

			let response = await fetch(`${state.serverAddress}/auth/login/`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: email,
					password: password
				})
			});
			const result = await response.json();

			if(!result.success) throw new Error(result.message);

			await EncryptedStorage.setItem("accessToken", result.accessToken);
			await EncryptedStorage.setItem("userData", JSON.stringify(result.userData));

			setLoginResult(result);

			return true;
		} catch(e) {
			update((prevState) => ({ ...prevState, isLoading: false }));
			if(e) {
				Alert.alert(
					"Error",
					e.message,
					[
						{
							text: "Close",
							style: "cancel"
						}
					]
				);
			}
		}
	}

	return (
		<View style={{ ...styles.container }}>
			<View style={styles.header}>
				<Text style={styles.logo}>My Notes</Text>
			</View>
			<View style={styles.loginBox}>
				<View style={{ width: 220 }}>
					<Text style={{ textAlign: 'center', marginBottom: 10 }}>Enter your login detail</Text>
					<TextInput style={{
						marginBottom: 5
					}} value={email} autoComplete='email' keyboardType="email-address" onChangeText={setEmail} placeholder="Email Address" />
					<TextInput style={{
						marginBottom: 20
					}} value={password} autoComplete="password" secureTextEntry={true} onChangeText={setPassword} placeholder="Password" />
				</View>

				<TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(colors.text, false)} onPress={(e) => handleSignIn(e)} disabled={state.isLoading}>
					<View style={{
						backgroundColor: colors.text,
						alignItems: 'center',
						paddingTop: 12,
						paddingRight: 25,
						paddingBottom: 12,
						paddingLeft: 25,
						marginBottom: 20
					}}>
						<Text style={{ color: colors.background }}>Sign In</Text>
					</View>
				</TouchableNativeFeedback>

				<TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(colors.background, false)} onPress={(e) => navigation.navigate('SignUp')} disabled={state.isLoading}>
					<View style={{
						alignItems: 'center',
						paddingTop: 12,
						paddingRight: 25,
						paddingBottom: 12,
						paddingLeft: 25,
						marginBottom: 20
					}}>
						<Text style={{ color: colorScheme === "dark" ? '#fff' : '#000' }}>Sign Up</Text>
					</View>
				</TouchableNativeFeedback>

				<TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(colors.background, false)} onPress={(e) => navigation.navigate('ChangeServer')} disabled={state.isLoading}>
					<View style={{
						alignItems: 'center',
						paddingTop: 12,
						paddingRight: 25,
						paddingBottom: 12,
						paddingLeft: 25
					}}>
						<Text style={{ color: colorScheme === "dark" ? '#fff' : '#000' }}>Change Server</Text>
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
