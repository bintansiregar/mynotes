import React, { useLayoutEffect, useContext, useEffect, useRef, useState } from 'react'
import {
	Alert,
	StyleSheet,
	Text,
	TextInput,
	View,
	TouchableNativeFeedback,
	Keyboard,
} from 'react-native';
import { useTheme, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Context } from '../../Store';

export default function SignUp({navigation}) {
	const { state, update } = useContext(Context);
	const [registrationResult, setRegistrationResult] = useState(null);
    const [name, setName] = useState(null);
	const [email, setEmail] = useState(null);
	const [password, setPassword] = useState(null);
    const [password2, setPassword2] = useState(null);
	const { colors } = useTheme();
	console.log('[SIGNIN]')
	useEffect(() => {
		if(registrationResult !== null && registrationResult.success) {
			update((prevState) => ({
				...prevState,
				isLoading: false
			}));
		}
	}, [registrationResult])

	const handleSignUp = async (e) => {
		e.preventDefault();

		try {
            Keyboard.dismiss();
            
            if(!email || !password) {
                Alert.alert('Warning', 'Please input email and password');
                return;
            }
    
            if(password != password2) {
                Alert.alert('Warning', 'Password not match!');
                return;
            }

            update((prevState) => ({ ...prevState, isLoading: true }));
			
			let response = await fetch(`${state.serverAddress}/auth/register/`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
                    name: name,
					email: email,
					password: password
				})
			});
			const result = await response.json();

			if(!result.success) throw new Error(result.message);

			Alert.alert(
                "Registration Success",
                result.message,
                [
                    {
                        text: "Sign In",
                        style: "cancel",
                        onPress: () => navigation.navigate('SignIn')
                    }
                ],
                {
                 cancelable: false
                }
            );

			setRegistrationResult(result);

			return true;
		} catch(e) {
			update((prevState) => ({ ...prevState, isLoading: false }));
			if(e instanceof Error) {
				console.log(e.message)
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
				<Text style={styles.logo}>NADI Health</Text>
			</View>
			<View style={styles.loginBox}>
				<View style={{ width: 220 }}>
					<Text style={{ textAlign: 'center', marginBottom: 10 }}>Sign Up New Account</Text>
                    <TextInput style={{
						marginBottom: 5
					}} value={name} autoComplete='name' onChangeText={setName} placeholder="Your Name" />
					<TextInput style={{
						marginBottom: 5
					}} value={email} autoComplete='email' keyboardType="email-address" onChangeText={setEmail} placeholder="Email Address" />
					<TextInput style={{
						marginBottom: 20
					}} value={password} autoComplete="password-new" secureTextEntry={true} onChangeText={setPassword} placeholder="Password" />
                    <TextInput style={{
						marginBottom: 20
					}} value={password2} autoComplete="password-new" secureTextEntry={true} onChangeText={setPassword2} placeholder="Retype Password" />
				</View>

				<TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#fff', false)} onPress={(e) => handleSignUp(e)} disabled={state.isLoading}>
					<View style={{
						backgroundColor: colors.text,
						alignItems: 'center',
						paddingTop: 12,
						paddingRight: 25,
						paddingBottom: 12,
						paddingLeft: 25,
						marginBottom: 20
					}}>
						<Text style={{ color: colors.background }}>Sign Up</Text>
					</View>
				</TouchableNativeFeedback>

				<TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(colors.background, false)} onPress={(e) => navigation.navigate('SignIn')} disabled={state.isLoading}>
					<View style={{
						backgroundColor: colors.background,
						alignItems: 'center',
						paddingTop: 12,
						paddingRight: 25,
						paddingBottom: 12,
						paddingLeft: 25
					}}>
						<Text style={{ color: colors.text }}>Sign In</Text>
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
	username: {
		borderBottomColor: '#fff',
		borderBottomWidth: 1
	},
	password: {
		marginTop: 15,
		width: 250,
		borderBottomColor: '#fff',
		borderBottomWidth: 1
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
