import { ActivityIndicator, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { AppColor } from '../../utils/Color';
import { useNavigation } from '@react-navigation/native';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import { validate_email } from '../../utils/Validations';

export default function ForgotPassword() {

	//nav props
	const nav = useNavigation();
	const [loading, setLoading] = useState(false);

	const [email, setEmail] = useState('');

	async function DoForgetPassword() {
		if (!email) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Email is required"
			})
		} else if (!validate_email(email)) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Invalid email address"
			})
		} else {
			setLoading(true);
			fetch(`${BaseUrl}/user/password/reset/email`, {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: email
				})
			}).then(async (res) => {
				setLoading(false)
				const response = await res.json();
				if (response.success === false) {
					setLoading(false);
					Toast.show({
						type: "error",
						text1: "Error",
						text2: res.status !== 422 ? response.message : response.data[0].msg
					})
				} else {
					setLoading(false);
					nav.replace("SuccessForgotPassword", {
						email: email
					});
				}
			})
		}
	}

	return (
		Platform.OS === "ios" ?
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={styles.wrapper}>

						{/*Top bar*/}
						<View style={styles.topBar}>
							<Entypo name="chevron-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
							{/* <FontAwesome name="question" size={24} color={AppColor.Blue} /> */}
						</View>

						{/*Description text*/}
						<View style={styles.descText}>
							<Text style={styles.bigText}>Forgot Password?</Text>
							<Text style={styles.smallText}>Don't worry! It happens. Please enter the email associated with your account.</Text>
						</View>

						{/*Phone input*/}
						<View style={styles.mainView}>
							<View style={{ height: 50, backgroundColor: AppColor.LightGrey, borderRadius: 12 }}>
								<TextInput
									onChangeText={(txt) => {
										setEmail(txt)
									}}
									keyboardType='email-address'
									style={styles.textInput}
									placeholder='Enter email address' />
							</View>

						</View>

						{/*Next Button*/}
						<TouchableOpacity disabled={loading} style={styles.nextButton} onPress={DoForgetPassword}>
							{loading ? (
								<ActivityIndicator color={'#fff'} size={'small'} />
							) : (
								<Text style={styles.nextText}>Reset Password</Text>
							)}
						</TouchableOpacity>
					</View>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView> :
			<View style={styles.wrapper}>

				{/*Top bar*/}
				<View style={styles.topBar}>
					<Entypo name="chevron-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
					{/* <FontAwesome name="question" size={24} color={AppColor.Blue} /> */}
				</View>

				{/*Description text*/}
				<View style={styles.descText}>
					<Text style={styles.bigText}>Forgot Password?</Text>
					<Text style={styles.smallText}>Don't worry! It happens. Please enter the email associated with your account.</Text>
				</View>

				{/*Phone input*/}
				<View style={styles.mainView}>
					<View style={{ height: 50, backgroundColor: AppColor.LightGrey, borderRadius: 12 }}>
						<TextInput
							onChangeText={(txt) => {
								setEmail(txt)
							}}
							keyboardType='email-address'
							style={styles.textInput}
							placeholder='Enter email address' />
					</View>

				</View>

				{/*Next Button*/}
				<TouchableOpacity disabled={loading} style={styles.nextButton} onPress={DoForgetPassword}>
					{loading ? (
						<ActivityIndicator color={'#fff'} size={'small'} />
					) : (
						<Text style={styles.nextText}>Reset Password</Text>
					)}
				</TouchableOpacity>
			</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: AppColor.White
	},
	topBar: {
		margin: 15,
		marginTop: 50,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	},
	descText: {
		margin: 15,
		marginTop: 30
	},
	bigText: {
		fontFamily: "lexendBold",
		color: AppColor.Blue,
		fontSize: 20
	},
	smallText: {
		fontFamily: "lexendMedium",
		color: AppColor.Black,
		marginTop: 10
	},
	mainView: {
		marginTop: 40,
		margin: 15
	},
	flagWrapper: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#e8e8e8",
		padding: 5,
		margin: 5,
		borderRadius: 100
	},
	textInput: {
		fontFamily: "lexendBold",
		paddingLeft: 15,
		flex: 1
	},
	nextButton: {
		height: 50,
		backgroundColor: AppColor.Blue,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 12,
		marginTop: 25,
		position: "absolute",
		bottom: 0,
		marginBottom: 20,
		alignSelf: "center",
		width: 300
	},
	nextText: {
		fontFamily: "lexendMedium",
		color: AppColor.White
	}
})