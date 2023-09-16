import { Image, KeyboardAvoidingView, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Platform } from 'react-native';
import React, { useRef, useState } from 'react';
import { AppColor } from '../../utils/Color';
import { Entypo, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function UpdateWalletPin() {
	//nav props
	const nav = useNavigation();

	//our states
	const [otpCode, setOTPCode] = useState('');
	const [isPinReady, setIsPinReady] = useState(false);
	const maximumCodeLength = 4;

	const boxArray = new Array(maximumCodeLength).fill(0);

	//our ref
	const inputRef = useRef();

	//next 
	const nextScreen = () => {
		if (otpCode.length < 4) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Pin must be four digits!"
			})
		} else {
			nav.navigate('SecondUpdateWalletPin', { Pin: otpCode })
		}
	}

	//onblur
	const handleOnBlur = () => { };

	const boxDigit = (_, index) => {
		const emptyInput = "";
		const digit = otpCode[index] || emptyInput;
		return (
			<View style={styles.boxes} key={index}>
				<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, textAlign: "center", fontSize: 18 }}>{digit}</Text>
			</View>
		);
	};

	return (
		Platform.OS === "ios" ?
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={styles.wrapper}>
						{/*Top bar*/}
						<View style={styles.topBar}>
							<Entypo name="chevron-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
							<Feather name="info" size={24} color={AppColor.Blue} />
						</View>

						<View style={{ margin: 15 }}>
							<Text style={{ fontFamily: "lexendBold", fontSize: 25, color: AppColor.Blue }}>Enter Old Pin</Text>
							<Text style={{ fontFamily: "lexendLight", marginTop: 5 }}>Please enter your old wallet pin.</Text>
						</View>

						{/*Four digit pin*/}
						<View style={styles.otpContainer}>
							<TouchableOpacity style={styles.touchable}>
								{boxArray.map(boxDigit)}
							</TouchableOpacity>
							<TextInput
								returnKeyType='next'
								onSubmitEditing={nextScreen}
								autoFocus={true}
								keyboardType='number-pad'
								ref={inputRef}
								onBlur={handleOnBlur}
								maxLength={maximumCodeLength}
								value={otpCode}
								onChangeText={(num) => setOTPCode(num)}
								style={styles.textInput} />
						</View>

						<View style={{ justifyContent: "center", alignSelf: "center", marginTop: 30, flexDirection: "row", alignItems: "center", backgroundColor: AppColor.BoldGrey, padding: 10, borderRadius: 100 }}>
							<Image source={require("../../assets/img/bulb.png")} />
							<Text style={{ color: AppColor.Black, fontFamily: "lexendMedium" }}>Enter Pin</Text>
						</View>

						<View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: Platform.OS === "ios" ? 20 : 20 }}>
							<TouchableOpacity onPress={nextScreen} style={{ height: 50, width: 300, borderRadius: 8, backgroundColor: AppColor.Blue, justifyContent: "center", alignItems: "center" }}>
								<Text style={{ fontFamily: "lexendMedium", color: "#fff", fontSize: 18 }}>Next</Text>
							</TouchableOpacity>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView> : 
			<View style={styles.wrapper}>
				{/*Top bar*/}
				<View style={styles.topBar}>
					<Entypo name="chevron-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
					<Feather name="info" size={24} color={AppColor.Blue} />
				</View>

				<View style={{ margin: 15 }}>
					<Text style={{ fontFamily: "lexendBold", fontSize: 25, color: AppColor.Blue }}>Enter Old Pin</Text>
					<Text style={{ fontFamily: "lexendLight", marginTop: 5 }}>Please enter your old wallet pin.</Text>
				</View>

				{/*Four digit pin*/}
				<View style={styles.otpContainer}>
					<TouchableOpacity style={styles.touchable}>
						{boxArray.map(boxDigit)}
					</TouchableOpacity>
					<TextInput
						returnKeyType='next'
						onSubmitEditing={nextScreen}
						autoFocus={true}
						keyboardType='number-pad'
						ref={inputRef}
						onBlur={handleOnBlur}
						maxLength={maximumCodeLength}
						value={otpCode}
						onChangeText={(num) => setOTPCode(num)}
						style={styles.textInput} />
				</View>

				<View style={{ justifyContent: "center", alignSelf: "center", marginTop: 30, flexDirection: "row", alignItems: "center", backgroundColor: AppColor.BoldGrey, padding: 10, borderRadius: 100 }}>
					<Image source={require("../../assets/img/bulb.png")} />
					<Text style={{ color: AppColor.Black, fontFamily: "lexendMedium" }}>Enter Pin</Text>
				</View>

				<View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: Platform.OS === "ios" ? 20 : 20 }}>
					<TouchableOpacity onPress={nextScreen} style={{ height: 50, width: 300, borderRadius: 8, backgroundColor: AppColor.Blue, justifyContent: "center", alignItems: "center" }}>
						<Text style={{ fontFamily: "lexendMedium", color: "#fff", fontSize: 18 }}>Next</Text>
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
	topBar: {
		margin: 15,
		marginTop: 50,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	},
	otpContainer: {
		justifyContent: "center",
		alignItems: "center",
		marginTop: 80
	},
	textInput: {
		width: 300,
		borderColor: 'red',
		borderWidth: 1,
		borderRadius: 5,
		padding: 15,
		position: "absolute",
		opacity: 0
	},
	touchable: {
		width: "59%",
		flexDirection: "row",
		justifyContent: "space-evenly"
	},
	boxes: {
		borderColor: AppColor.Blue,
		padding: 12,
		minWidth: 30,
		borderBottomWidth: 2
	},
	numText: {
		fontFamily: "lexendBold",
		color: AppColor.Blue,
		fontSize: 20
	}
})