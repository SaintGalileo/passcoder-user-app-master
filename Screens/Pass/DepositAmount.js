import { ActivityIndicator, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import Modal from "react-native-modal";
import { count_filter, digit_filter, payment_methods, internal_character_key, passcoder_icon, random_numbers, return_trimmed_data } from '../../utils/Validations';

export default function DepositAmount({ route }) {
	const { passUser } = route.params;

	const nav = useNavigation();

	const [fundAmount, setFundAmount] = useState(null);
	const [chargeLoading, setChargeLoading] = useState(false);
	const [copied, setCopied] = useState(false);
	const [bankAccountAndChargeModal, setBankAccountAndChargeModal] = useState(false);
	const [bankDetails, setBankDetails] = useState({});
	const [chargePrice, setChargePrice] = useState(null);

	const okayTransferred = () => {
		setBankAccountAndChargeModal(false);
		nav.navigate("Wallet");
	};

	async function nextStep() {
		if (fundAmount && fundAmount > 0) {
			setChargeLoading(true);
			const userToken = await AsyncStorage.getItem('userToken');
			fetch(`${BaseUrl}/user/virtual/account/and/payments/charge/price`, {
				method: "POST",
				headers: {
					'passcoder-access-token': userToken,
					'passcoder-access-key': "passcoder_" + internal_character_key,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					amount: fundAmount
				})
			}).then(async (res) => {
				const response = await res.json();
				if (response.success) {
					setChargeLoading(false);
					setBankDetails(response.data.bank_account);
					setChargePrice(response.data.charge);
					setBankAccountAndChargeModal(true);
				} else {
					setChargeLoading(false);
					Toast.show({
						type: "error",
						text1: "Error",
						text2: res.status !== 422 ? response.message : response.data[0].msg
					});
				}
			}).catch((err) => {
				setChargeLoading(false);
				Toast.show({
					type: "error",
					text1: "Error",
					text2: "An error occured!"
				});
			})
		} else {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Amount is required"
			})
		}
	};

	const BankAccountAndChargeModal = () => {
		return (
			<Modal style={{ margin: 0 }} isVisible={bankAccountAndChargeModal}>
				<View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
					<View style={{}}>
						<View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
							<MaterialCommunityIcons name={"bank"} size={30} color={"green"} />
						</View>
						<View style={{ marginLeft: 15, marginRight: 15, marginTop: 20, marginBottom: 10 }}>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 10, color: AppColor.Blue }}>Payment details</Text>
								{/* <MaterialCommunityIcons name="cancel" size={24} color={paymentLoading ? "grey" : "red"} style={{ marginRight: 10, marginTop: -10 }} onPress={() => { if (!paymentLoading) cancelDeposit(transactionUniqueID) }} /> */}
								<MaterialCommunityIcons name="close" size={24} color={"red"} style={{ marginRight: 10, marginTop: -10 }} onPress={() => okayTransferred()} />
							</View>
						</View>
						<View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 13, marginBottom: 5 }}>Amount (NGN)</Text>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 13, marginBottom: 5 }}><Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundAmount ? fundAmount : 0)}</Text>
							</View>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 13, marginBottom: 5 }}>Charge</Text>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 13, marginBottom: 5 }}><Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(chargePrice ? chargePrice : 0)}</Text>
							</View>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 13, marginBottom: 5 }}>Acc Name</Text>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 13, marginBottom: 5 }}>{bankDetails.virtual_account_name}</Text>
							</View>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 13, marginBottom: 5 }}>Acc No.</Text>
								<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
									<TouchableOpacity onPress={async () => {
										await Clipboard.setStringAsync(bankDetails.virtual_account_number).then(() => {
											Toast.show({
												type: "success",
												text1: "Success",
												text2: "Account number copied!"
											})
										})
										setCopied(true);
									}} style={{ marginRight: 5 }}>
										<MaterialIcons name={copied ? "check" : "content-copy"} size={18} color="black" />
									</TouchableOpacity>
									<Text onPress={async () => {
										await Clipboard.setStringAsync(bankDetails.virtual_account_number).then(() => {
											Toast.show({
												type: "success",
												text1: "Success",
												text2: "Account number copied!"
											})
										})
										setCopied(true);
									}} style={{ fontFamily: 'lexendMedium', textDecorationLine: "underline", textDecorationColor: AppColor.Blue, fontSize: 13, marginBottom: 5 }}>
										{bankDetails.virtual_account_number}
									</Text>
								</View>
							</View>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 13, marginBottom: 5 }}>Bank</Text>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 13, marginBottom: 5 }}>{bankDetails.virtual_bank}</Text>
							</View>
							<Text style={{ fontFamily: 'lexendMedium', fontSize: 17, marginBottom: 10, marginTop: 10, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Send - <Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundAmount ? (parseInt(fundAmount) + chargePrice) : 0)}</Text>
							<TouchableOpacity onPress={() => okayTransferred()} style={{ backgroundColor: AppColor.Blue, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
								<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>I've transferred</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		)
	};

	return (
		<>
			<BankAccountAndChargeModal />
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={styles.wrapper}>
						{/*Top bar*/}
						<View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
							<Feather name="arrow-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
							<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: Platform.OS === "ios" ? 20 : 15, marginLeft: 10 }}>Deposit</Text>
						</View>

						<View style={{ margin: 15, marginTop: 20 }}>
							<View style={{ marginBottom: 20 }}>
								<Text style={styles.topInfo}>Enter amount</Text>
								<TextInput
									value={fundAmount}
									maxLength={11}
									onChangeText={(txt) => setFundAmount(txt)}
									style={styles.inputStyle}
									keyboardType='numeric'
									placeholder='Enter amount'
								/>
							</View>
						</View>

						<View style={{ position: "absolute", bottom: 0, alignSelf: "flex-end", marginBottom: Platform.OS === "ios" ? 70 : 20 }}>
							<TouchableOpacity style={{ ...styles.btnStyle, backgroundColor: chargeLoading ? "grey" : AppColor.Blue }} disabled={chargeLoading} onPress={nextStep}>
								{chargeLoading ? (
									<ActivityIndicator color={"#fff"} size={'small'} />
								) : (
									<Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Next</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</>
	)
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: "#fff"
	},
	topInfo: {
		fontFamily: "lexendBold",
		fontSize: 15,
		marginBottom: 5
	},
	inputStyle: {
		height: 50,
		borderRadius: 8,
		backgroundColor: "#eee",
		paddingLeft: 20,
		fontFamily: "lexendMedium",
		fontSize: 15
	},
	btnStyle: {
		height: 50,
		marginRight: 20,
		backgroundColor: AppColor.Blue,
		justifyContent: "center",
		alignItems: "center",
		width: (Dimensions.get('screen').width * 40) / 100,
		borderRadius: 8
	},
	textInput: {
		height: 50,
		backgroundColor: AppColor.LightGrey,
		borderRadius: 12,
		paddingLeft: 20,
		fontFamily: "lexendBold",
		marginBottom: 20
	}
})