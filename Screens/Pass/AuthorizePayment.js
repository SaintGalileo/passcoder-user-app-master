import { ActivityIndicator, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Dimensions, Image } from 'react-native';
import React, { useRef, useState } from 'react';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import Modal from "react-native-modal";
import { count_filter, digit_filter, payment_methods, internal_character_key, passcoder_icon, random_numbers, return_trimmed_data, mask_string } from '../../utils/Validations';

export default function AuthorizePayment({ route }) {
	const { uniqueID, amount, passUser } = route.params;

	const nav = useNavigation();

	const [requestPaymentLoading, setRequestPaymentLoading] = useState(false);
	const [requestPaymentSuccessMessage, setRequestPaymentSuccessMessage] = useState(null);
	const [requestPaymentErrorMessage, setRequestPaymentErrorMessage] = useState(null);

	const [requestPaymentStatusModal, setRequestPaymentStatusModal] = useState(false);

	const [requestUniqueID, setRequestUniqueID] = useState(uniqueID);
	const [requestPaymentAmount, setRequestPaymentAmount] = useState(amount);

	const [walletPin, setWalletPin] = useState("");

	const authorizePayment = async (pin, pid, unique_id) => {
		const userToken = await AsyncStorage.getItem('userToken');
		fetch(`${BaseUrl}/user/wallet/pin/verify`, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				pin: pin,
				pid: pid
			})
		}).then(async (res) => {
			const response = await res.json();
			if (response.success) {
				fetch(`${BaseUrl}/user/accept/request`, {
					method: "POST",
					headers: {
						'passcoder-access-token': userToken,
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						unique_id: unique_id
					})
				}).then(async (res) => {
					const response = await res.json();
					if (response.success === true) {
						setRequestPaymentLoading(false);
						setRequestPaymentErrorMessage(null);
						setRequestPaymentSuccessMessage("Your payment has been processed successfully.");
					} else {
						setRequestPaymentLoading(false);
						setRequestPaymentSuccessMessage(null);
						setRequestPaymentErrorMessage(res.status !== 422 ? response.message : response.data[0].msg);
					}
				}).catch((err) => {
					setRequestPaymentLoading(false);
					setRequestPaymentSuccessMessage(null);
					setRequestPaymentErrorMessage("An error occured!!");
				})
			} else {
				setRequestPaymentLoading(false);
				setRequestPaymentSuccessMessage(null);
				setRequestPaymentErrorMessage(res.status !== 422 ? response.message : response.data[0].msg);
			}
		}).catch((err) => {
			setRequestPaymentLoading(false);
			setRequestPaymentSuccessMessage(null);
			setRequestPaymentErrorMessage("An error occured!");
		})
	};

	function nextStep() {
		if (walletPin.length < 4) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Pin must be 4 digits"
			})
		} else {
			setRequestPaymentLoading(true);
			setRequestPaymentStatusModal(true);
			authorizePayment(walletPin, passUser.pid, requestUniqueID);
		}
	};

	//our states
	const maximumCodeLength = 4;

	const boxArray = new Array(maximumCodeLength).fill(0);

	//our ref
	const inputRef = useRef();

	const handleOnBlur = () => { };

	const boxDigit = (_, index) => {
		const emptyInput = "";
		const digit = walletPin[index] || emptyInput;
		return (
			<View style={styles.boxes} key={index}>
				<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, textAlign: "center", fontSize: 18 }}>{mask_string(digit)}</Text>
			</View>
		);
	};

	const okayRequestPayment = () => {
		setRequestPaymentStatusModal(false);
		nav.navigate("Wallet");
	};

	const goBackFromRequestPaymentStatus = () => {
		Keyboard.dismiss();
		setRequestPaymentStatusModal(false);
		nav.navigate("Wallet");
	};

	const retryPaymentPin = () => {
		setRequestPaymentStatusModal(false);
		setWalletPin("");
	};

	const RequestPaymentStatusModal = () => {
		return (
			<Modal style={{ margin: 0 }} isVisible={requestPaymentStatusModal}>
				<View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
					<View style={{}}>
						{
							requestPaymentLoading ?
								<>
									<View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: AppColor.Blue, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20, marginBottom: 10 }}>
										<ActivityIndicator color={"#fff"} size={'large'} />
									</View>
									<Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 20, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Processing ...</Text>
								</> :
								<>
									{
										requestPaymentErrorMessage ?
											<>
												<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
													<View></View>
													<MaterialCommunityIcons name="close" size={24} color={AppColor.Blue} style={{ marginRight: 15, marginTop: 10 }} onPress={() => goBackFromRequestPaymentStatus()} />
												</View>
												<View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>
													<Ionicons name={"warning-outline"} size={30} color={"red"} />
												</View>
												<View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
													<Text style={{ marginLeft: 15, marginRight: 15, marginTop: 10, fontFamily: 'lexendBold', fontSize: 20, marginBottom: 5, color: "#000", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Error</Text>
													<Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5, color: "red", justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 5, marginRight: 5 }}>{requestPaymentErrorMessage}</Text>
													<TouchableOpacity onPress={() => retryPaymentPin()} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
														<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Retry</Text>
													</TouchableOpacity>
												</View>
											</> :
											<>
												<View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "green", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
													<MaterialCommunityIcons name={"check"} size={30} color={"#fff"} />
												</View>
												<View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
													<Text style={{ marginLeft: 15, marginRight: 15, marginTop: 10, fontFamily: 'lexendBold', fontSize: 20, marginBottom: 5, color: AppColor.Blue, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Success</Text>
													<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5, justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 5, marginRight: 5 }}>{requestPaymentSuccessMessage}</Text>
													<Text style={{ fontFamily: 'lexendMedium', fontSize: 20, marginBottom: 10, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>- <Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(requestPaymentAmount ? requestPaymentAmount : 0)}</Text>
													<TouchableOpacity onPress={() => okayRequestPayment()} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
														<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
													</TouchableOpacity>
												</View>
											</>
									}
								</>
						}
					</View>
				</View>
			</Modal>
		)
	};

	return (
		<>
			<RequestPaymentStatusModal />
			{
				Platform.OS === "ios" ?
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
						<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
							<View style={styles.wrapper}>
								{/*Top bar*/}
								<View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
									<Feather name="arrow-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
									<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: Platform.OS === "ios" ? 20 : 15, marginLeft: 10 }}>Authorize Payment</Text>
								</View>

								<View style={{ margin: 15 }}>
									<Text style={{ fontFamily: "lexendBold", fontSize: 25, color: AppColor.Blue }}>Enter Wallet PIN</Text>
									<Text style={{ fontFamily: "lexendLight", marginTop: 5 }}>To authorize transaction please enter your 4 digit PIN.</Text>
								</View>

								{/*Four digit pin*/}
								<View style={styles.otpContainer}>
									<TouchableOpacity style={styles.touchable}>
										{boxArray.map(boxDigit)}
									</TouchableOpacity>
									<TextInput
										returnKeyType='next'
										onSubmitEditing={nextStep}
										autoFocus={true}
										keyboardType='number-pad'
										ref={inputRef}
										onBlur={handleOnBlur}
										maxLength={maximumCodeLength}
										value={walletPin}
										onChangeText={(num) => setWalletPin(num)}
										style={styles.textInput} />
								</View>

								<View style={{ justifyContent: "center", alignSelf: "center", marginTop: 30, flexDirection: "row", alignItems: "center", backgroundColor: AppColor.LightGrey, padding: 10, borderRadius: 100 }}>
									<Image source={require("../../assets/img/bulb.png")} />
									<Text style={{ color: AppColor.Black, fontFamily: "lexendMedium", marginLeft: 10 }}>Enter Pin</Text>
								</View>

								<View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: Platform.OS === "ios" ? 70 : 20 }}>
									<TouchableOpacity onPress={nextStep} style={{ height: 50, width: 300, borderRadius: 8, backgroundColor: AppColor.Blue, justifyContent: "center", alignItems: "center" }}>
										<Text style={{ fontFamily: "lexendMedium", color: "#fff" }}>Authorize</Text>
									</TouchableOpacity>
								</View>
							</View>
						</TouchableWithoutFeedback>
					</KeyboardAvoidingView> :
					<View style={styles.wrapper}>
						{/*Top bar*/}
						<View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
							<Feather name="arrow-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
							<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: Platform.OS === "ios" ? 20 : 15, marginLeft: 10 }}>Authorize Payment</Text>
						</View>

						<View style={{ margin: 15 }}>
							<Text style={{ fontFamily: "lexendBold", fontSize: 25, color: AppColor.Blue }}>Enter Wallet PIN</Text>
							<Text style={{ fontFamily: "lexendLight", marginTop: 5 }}>To perform transaction please enter your 4 digit PIN.</Text>
						</View>

						{/*Four digit pin*/}
						<View style={styles.otpContainer}>
							<TouchableOpacity style={styles.touchable}>
								{boxArray.map(boxDigit)}
							</TouchableOpacity>
							<TextInput
								returnKeyType='next'
								onSubmitEditing={nextStep}
								autoFocus={true}
								keyboardType='number-pad'
								ref={inputRef}
								onBlur={handleOnBlur}
								maxLength={maximumCodeLength}
								value={walletPin}
								onChangeText={(num) => setWalletPin(num)}
								style={styles.textInput} />
						</View>

						<View style={{ justifyContent: "center", alignSelf: "center", marginTop: 30, flexDirection: "row", alignItems: "center", backgroundColor: AppColor.LightGrey, padding: 10, borderRadius: 100 }}>
							<Image source={require("../../assets/img/bulb.png")} />
							<Text style={{ color: AppColor.Black, fontFamily: "lexendMedium", marginLeft: 10 }}>Enter Pin</Text>
						</View>

						<View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: Platform.OS === "ios" ? 70 : 20 }}>
							<TouchableOpacity onPress={nextStep} style={{ height: 50, width: 300, borderRadius: 8, backgroundColor: AppColor.Blue, justifyContent: "center", alignItems: "center" }}>
								<Text style={{ fontFamily: "lexendMedium", color: "#fff" }}>Authorize</Text>
							</TouchableOpacity>
						</View>
					</View>
			}
		</>
	)
};

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