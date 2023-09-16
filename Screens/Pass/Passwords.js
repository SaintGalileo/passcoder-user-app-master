import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Feather, Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { AppColor } from '../../utils/Color';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import { validate_password, validate_password_field_1, validate_password_field_2, validate_password_field_3 } from '../../utils/Validations';

export default function Passwords() {

	const nav = useNavigation();
	const [loading, setLoading] = useState(false);

	const [showPin, setShowPin] = useState(true);
	const [showPass, setPass] = useState(true);
	const [showPass1, setPass1] = useState(true)

	const [pin, setPin] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const [passwordStrong, setPasswordStrong] = useState(0);

	async function ChangePassword() {
		setLoading(true);
		if (!pin) {
			setLoading(false);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Enter pin"
			})
		} else if (!password) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Please choose a new password"
			})
			setLoading(false);
		} else if (!validate_password(password)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Weak password"
			})
			setLoading(false)
		} else if (!confirmPassword) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Please confirm password"
			})
			setLoading(false)
		} else if (confirmPassword !== password) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Passwords not matching!"
			})
			setLoading(false)
		} else {
			Keyboard.dismiss()
			setLoading(true);
			const userToken = await AsyncStorage.getItem('userToken');
			fetch(`${BaseUrl}/user/password/change`, {
				method: "PUT",
				headers: {
					'passcoder-access-token': userToken,
					'Accept': 'application/json',
					'Content-Type': 'application/json',

				},
				body: JSON.stringify({
					pin: pin,
					password: password.toString(),
					confirmPassword: confirmPassword.toString(),
				})
			}).then(async (res) => {

				const response = await res.json();
				if (response.success === false) {
					setLoading(false)
					Toast.show({
						type: "error",
						text1: "Error",
						text2: res.status !== 422 ? response.message : response.data[0].msg
					})
				} else {
					setLoading(false)
					nav.goBack()
					Toast.show({
						type: "success",
						text1: "Success",
						text2: "Changed Password Successfully"
					})
				}
			}).catch((err) => {
				setLoading(false)
			})
		}
	}
	return (
		<View style={styles.wrapper}>
			{/*Top bar*/}
			<View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				<Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
				<View>
					<Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Change Password</Text>
					<Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>We’ll send you a verification link!</Text>
				</View>
				<View>
				</View>
			</View>

			<View style={{ margin: 15, marginTop: 40 }}>
				<View style={{ marginBottom: 20 }}>
					<View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eee", height: 50, marginBottom: 20, justifyContent: "center", borderRadius: 8 }}>
						<TextInput
							maxLength={4}
							keyboardType='number-pad'
							secureTextEntry={showPin}
							onChangeText={(txt) => setPin(txt)}
							style={[styles.textInput, { flex: 1, backgroundColor: null, marginBottom: 0 }]}
							placeholder='Pin' />
						<TouchableOpacity onPress={() => setShowPin(!showPin)}>
							<Ionicons name={!showPin ? "eye-off" : 'eye'} size={24} color="grey" style={{ marginRight: 15 }} />
						</TouchableOpacity>
					</View>
				</View>


				<View style={{ marginBottom: 20 }}>
					<View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eee", height: 50, justifyContent: "center", borderRadius: 8, marginBottom: passwordStrong === 0 || passwordStrong === 5 ? 20 : 0 }}>
						<TextInput
							secureTextEntry={showPass}
							onChangeText={(txt) => {
								setPassword(txt);
								if (txt.length < 8) {
									setPasswordStrong(1);
								} else if (txt.length > 8 && !validate_password_field_1(txt)) {
									setPasswordStrong(2);
								} else if (txt.length > 8 && !validate_password_field_2(txt)) {
									setPasswordStrong(3);
								} else if (txt.length > 8 && !validate_password_field_3(txt)) {
									setPasswordStrong(4);
								} else if (txt.length > 8 && validate_password_field_1(txt) && validate_password_field_2(txt) && validate_password_field_3(txt)) {
									setPasswordStrong(5);
								}
							}}
							maxLength={30}
							style={[styles.textInput, { flex: 1, backgroundColor: null, marginBottom: 0 }]}
							placeholder='Password' />
						<TouchableOpacity onPress={() => setPass(!showPass)}>
							<Ionicons name={!showPass ? "eye-off" : 'eye'} size={24} color="grey" style={{ marginRight: 15 }} />
						</TouchableOpacity>
					</View>
					{passwordStrong === 1 && <Text style={{ fontFamily: 'lexendLight', color: "red", marginTop: 5, marginBottom: 20 }}>Minimum of 8 characters</Text>}
					{passwordStrong === 2 && <Text style={{ fontFamily: 'lexendLight', color: "red", marginTop: 5, marginBottom: 20 }}>Must contain upper & lower case</Text>}
					{passwordStrong === 3 && <Text style={{ fontFamily: 'lexendLight', color: "red", marginTop: 5, marginBottom: 20 }}>Must contain numbers</Text>}
					{passwordStrong === 4 && <Text style={{ fontFamily: 'lexendLight', color: "red", marginTop: 5, marginBottom: 20 }}>Must contain special characters</Text>}
				</View>

				<View style={{ marginBottom: 20 }}>
					<View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#eee", height: 50, marginBottom: 20, justifyContent: "center", borderRadius: 8 }}>
						<TextInput
							secureTextEntry={showPass1}
							onChangeText={(txt) => setConfirmPassword(txt)}
							maxLength={30}
							style={[styles.textInput, { flex: 1, backgroundColor: null, marginBottom: 0 }]}
							placeholder='Confirm Password' />
						<TouchableOpacity onPress={() => setPass1(!showPass1)}>
							<Ionicons name={!showPass1 ? "eye-off" : 'eye'} size={24} color="grey" style={{ marginRight: 15 }} />
						</TouchableOpacity>
					</View>
				</View>
			</View>


			<View style={{ position: "absolute", bottom: 0, marginBottom: 20, alignSelf: "center" }}>
				<TouchableOpacity onPress={ChangePassword} disabled={loading} style={{ backgroundColor: AppColor.Blue, height: 50, borderRadius: 8, justifyContent: "center", alignItems: "center", width: 300 }}>
					{loading ? (
						<ActivityIndicator color={'#fff'} size={'small'} />
					) : (
						<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Next</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: "#fff"
	},
	inputField: {
		height: 50,
		paddingLeft: 20,
		backgroundColor: "#eee",
		borderRadius: 8,
		fontFamily: "lexendMedium"
	},
	textInput: {
		backgroundColor: "#eee",
		height: 50,
		borderRadius: 8,
		paddingLeft: 20,
		fontFamily: "lexendBold",
		marginBottom: 20,

	},
})