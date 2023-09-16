import { ActivityIndicator, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import React, { useState, useRef } from 'react';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppColor } from '../../utils/Color';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import { Paystack, paystackProps } from 'react-native-paystack-webview';
import Toast from 'react-native-toast-message';
import Modal from "react-native-modal";
import { count_filter, digit_filter, payment_methods, internal_character_key, passcoder_icon, random_numbers, return_trimmed_data } from '../../utils/Validations';

export default function ConfirmFunding({ route }) {
	const { fundMethod, fundAmount, passUser } = route.params;

	const nav = useNavigation();

	const general_min_amount = 1000;
	const credit_card_max_amount = 50000;
	const transfer_max_amount = 100000;

	const [paymentLoading, setPaymentLoading] = useState(false);

	const [companyBankDetails, setCompanyBankDetails] = useState({});
	const [chargePrice, setChargePrice] = useState(null);

	const [bankAccountAndChargeModal, setBankAccountAndChargeModal] = useState(false);

	const [cardDepositStatusModal, setCardDepositStatusModal] = useState(false);
	const [cardDepositLoading, setCardDepositLoading] = useState(false);
	const [cardDepositSuccessMessage, setCardDepositSuccessMessage] = useState(null);
	const [cardDepositErrorMessage, setCardDepositErrorMessage] = useState(null);

	const [paystackConfig, setPaystackConfig] = useState(null);
	const paystackWebViewRef = useRef(paystackProps.PayStackRef);

	const cancelPayment = () => {
		nav.navigate("Wallet");
    };

	const cancelPaymentAlt = () => {
		setBankAccountAndChargeModal(false);
		nav.navigate("Wallet");
    };
	
	const goBackFromCardDepositStatus = () => {
		setCardDepositStatusModal(false);
		nav.navigate("Wallet");
	};

	const goBackFromConfirmPayment = () => {
		nav.navigate("Wallet");
	};

	const okayCardDeposit = () => {
		setCardDepositStatusModal(false);
		nav.navigate("Wallet");
	};

	const confirmDepositPaymentViaTransfer = () => {
		setBankAccountAndChargeModal(false);
		nav.navigate("Wallet");
	};

	const onPaystackSuccess = async (res) => {
		setCardDepositStatusModal(true);
		setCardDepositLoading(true);
		const userToken = await AsyncStorage.getItem('userToken');
		fetch(`${BaseUrl}/user/transaction/payment/deposit/via/card`, {
			method: "POST",
			headers: {
				'passcoder-access-token': userToken,
				'passcoder-access-key': "passcoder_" + internal_character_key,
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				amount: fundAmount,
				payment_method: fundMethod,
				reference: res.transactionRef.reference
			})
		}).then(async (res) => {
			const response = await res.json();
			if (response.success) {
				setCardDepositLoading(false);
				setCardDepositErrorMessage(null);
				setCardDepositSuccessMessage(response.message);
			} else {
				setCardDepositLoading(false);
				setCardDepositSuccessMessage(null);
				setCardDepositErrorMessage(res.status !== 422 ? response.message : response.data[0].msg);
			}
		}).catch((err) => {
			setCardDepositLoading(false);
			setCardDepositSuccessMessage(null);
			setCardDepositErrorMessage("An error occured!");
		})
	};

	const addDeposit = async () => {
		const userToken = await AsyncStorage.getItem('userToken');
		if (fundMethod === payment_methods.card) {
			if (fundAmount > credit_card_max_amount) {
				Toast.show({
					type: "error",
					text1: "Error",
					text2: `Maximum card deposit is ${digit_filter(credit_card_max_amount)} Naira`
				});
			} else {
				setPaymentLoading(true);
				fetch(`${BaseUrl}/user/public/key/paystack/and/payments/charge/price`, {
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
						setPaymentLoading(false);
						let publicKey = response.data.key;
						let charge = response.data.charge;
						let totalFundAmount = parseInt(fundAmount) + parseInt(charge);
						setPaystackConfig({
							paystackKey: publicKey,
							billingEmail: passUser.email,
							billingMobile: passUser.phone_number,
							billingName: passUser?.firstname + " " + passUser?.middlename ? passUser?.middlename + " " : "" + passUser?.lastname,
							amount: totalFundAmount,
							channels: ["card"],
							refNumber: "TXU" + random_numbers(12)
						});
						paystackWebViewRef.current.startTransaction();
					} else {
						setPaymentLoading(false);
						Toast.show({
							type: "error",
							text1: "Error",
							text2: res.status !== 422 ? response.message : response.data[0].msg
						});
					}
				}).catch((err) => {
					setPaymentLoading(false);
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured!"
					})
				})
			}
		} else if (fundMethod === payment_methods.transfer) {
			if (fundAmount > transfer_max_amount) {
				Toast.show({
					type: "error",
					text1: "Error",
					text2: `Maximum transfer deposit is ${digit_filter(transfer_max_amount)} Naira`
				});
			} else {
				setPaymentLoading(true);
				fetch(`${BaseUrl}/user/virtual/account/and/payments/charge/price`, {
					method: "POST",
					headers: {
						'passcoder-access-token': userToken,
						'passcoder-access-key': "passcoder_" + internal_character_key,
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						amount: fundAmount
					})
				}).then(async (res) => {
					const response = await res.json();
					if (response.success) {
						setPaymentLoading(false);
						setCompanyBankDetails(response.data.bank_account);
						setChargePrice(response.data.charge);
						// setTransactionUniqueID(response.data.unique_id);
						setBankAccountAndChargeModal(true);
					} else {
						setPaymentLoading(false);
						Toast.show({
							type: "error",
							text1: "Error",
							text2: res.status !== 422 ? response.message : response.data[0].msg
						});
					}
				}).catch((err) => {
					setPaymentLoading(false);
					Toast.show({
						type: "error",
						text1: "Error",
						text2: "An error occured!"
					})
				})
			}
		} else {
			setPaymentLoading(false);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Please select payment method"
			});
		}
	};

	const CardDepositStatusModal = () => {
		return (
			<Modal style={{ margin: 0 }} isVisible={cardDepositStatusModal}>
				<View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
					<View style={{}}>
						{
							cardDepositLoading ?
								<>
									<View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: AppColor.Blue, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20, marginBottom: 10 }}>
										<ActivityIndicator color={"#fff"} size={'large'} />
									</View>
									<Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 20, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Processing ...</Text>
								</> :
								<>
									{
										cardDepositErrorMessage ?
											<>
												<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
													<View></View>
													<MaterialCommunityIcons name="close" size={24} color={AppColor.Blue} style={{ marginRight: 15, marginTop: 10 }} onPress={() => goBackFromCardDepositStatus()} />
												</View>
												<View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>
													<Ionicons name={"checkmark"} size={30} color={"coral"} />
												</View>
												<View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
													<Text style={{ marginLeft: 15, marginRight: 15, marginTop: 10, fontFamily: 'lexendBold', fontSize: 20, marginBottom: 5, color: "#000", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Deposit pending</Text>
													<Text style={{ fontFamily: 'lexendMedium', fontSize: 15, marginBottom: 5, color: "red", justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 5, marginRight: 5 }}>{cardDepositErrorMessage}</Text>
													<TouchableOpacity onPress={() => okayCardDeposit()} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
														<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
													</TouchableOpacity>
												</View>
											</> :
											<>
												<View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "green", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
													<MaterialCommunityIcons name={"check"} size={30} color={"#fff"} />
												</View>
												<View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
													<Text style={{ marginLeft: 15, marginRight: 15, marginTop: 10, fontFamily: 'lexendBold', fontSize: 20, marginBottom: 5, color: AppColor.Blue, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Deposit successful</Text>
													<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5, justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 5, marginRight: 5 }}>{cardDepositSuccessMessage}</Text>
													<Text style={{ fontFamily: 'lexendMedium', fontSize: 20, marginBottom: 10, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>+ <Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundAmount ? fundAmount : 0)}</Text>
													<TouchableOpacity onPress={() => okayCardDeposit()} style={{ backgroundColor: AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
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
								<MaterialCommunityIcons name="cancel" size={24} color={"red"} style={{ marginRight: 10, marginTop: -10 }} onPress={() => cancelPaymentAlt()} />
							</View>
						</View>
						<View style={{ marginLeft: 15, marginRight: 15, marginBottom: 20 }}>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Amount (NGN)</Text>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}><Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundAmount ? fundAmount : 0)}</Text>
							</View>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Charge</Text>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}><Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(chargePrice ? chargePrice : 0)}</Text>
							</View>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Account Name</Text>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>{companyBankDetails.virtual_account_name}</Text>
							</View>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Account Number</Text>
								<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
									<TouchableOpacity onPress={async () => {
										await Clipboard.setStringAsync(companyBankDetails.virtual_account_number).then(() => {
											Toast.show({
												type: "success",
												text1: "Success",
												text2: "Account number copied!"
											})
										})
									}} style={{ marginRight: 5 }}>
										<MaterialIcons name="content-copy" size={18} color="black" />
									</TouchableOpacity>
									<Text onPress={async () => {
										await Clipboard.setStringAsync(companyBankDetails.virtual_account_number).then(() => {
											Toast.show({
												type: "success",
												text1: "Success",
												text2: "Account number copied!"
											})
										})
									}} style={{ fontFamily: 'lexendMedium', textDecorationLine: "underline", textDecorationColor: AppColor.Blue, fontSize: 12, marginBottom: 5 }}>
										{companyBankDetails.virtual_account_number}
									</Text>
								</View>
							</View>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>Bank</Text>
								<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 5 }}>{companyBankDetails.virtual_bank}</Text>
							</View>
							<Text style={{ fontFamily: 'lexendMedium', fontSize: 20, marginBottom: 10, marginTop: 10, justifyContent: "center", alignItems: "center", alignSelf: "center" }}>Pay <Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundAmount ? parseInt(fundAmount) + parseInt(chargePrice) : 0)}</Text>
							<TouchableOpacity onPress={() => confirmDepositPaymentViaTransfer()} disabled={paymentLoading} style={{ backgroundColor: paymentLoading ? "grey" : AppColor.Blue, height: 35, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 5 }}>
								{paymentLoading ? (
									<ActivityIndicator color={"#fff"} size={'small'} />
								) : (
									<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>I've transferred</Text>
								)}
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
			<CardDepositStatusModal />
			<View style={styles.wrapper}>
				<Paystack
					paystackKey={paystackConfig?.paystackKey}
					amount={paystackConfig?.amount}
					billingName={paystackConfig?.billingName}
					billingEmail={paystackConfig?.billingEmail}
					billingMobile={paystackConfig?.billingMobile}
					refNumber={paystackConfig?.refNumber}
					channels={paystackConfig?.channels}
					onCancel={(e) => {
						Toast.show({
							type: "error",
							text1: "Error",
							text2: "Deposit cancelled!"
						});
						nav.navigate("Wallet");
					}}
					onSuccess={(res) => {
						onPaystackSuccess(res);
					}}
					ref={paystackWebViewRef}
				/>

				{/*Top bar*/}
				<View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
					<Feather name="arrow-left" size={24} color={AppColor.Blue} onPress={() => nav.goBack()} />
					<Text style={{ fontFamily: "lexendBold", color: AppColor.Blue, fontSize: Platform.OS === "ios" ? 20 : 15, marginLeft: 10 }}>Payment Confirmation</Text>
				</View>

				<View style={{ flex: 1 }}>
					<View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
						<MaterialCommunityIcons name={"wallet-plus"} size={30} color={"green"} />
					</View>
					<View style={{ marginLeft: 15, marginRight: 15, marginTop: 20 }}>
						<Text style={{ fontFamily: 'lexendBold', fontSize: 20, marginBottom: 20, color: AppColor.Blue }}>Confirm Deposit</Text>
						<Text style={{ fontFamily: 'lexendMedium', fontSize: 17, marginBottom: 10 }}>Payment via {fundMethod}</Text>
						<Text style={{ fontFamily: "lexendMedium", fontSize: 19, marginBottom: 5 }}><Text style={{ fontFamily: "lexendBold" }}>{"\u20A6"}{" "}</Text>{digit_filter(fundAmount ? fundAmount : 0)}</Text>
						<Text style={{ fontFamily: 'lexendMedium', fontSize: 12, marginBottom: 10 }}>Plus charge {fundMethod === payment_methods.card ? "~ \u20A6 100" : "~ \u20A6 50 - \u20A6 100"}</Text>
					</View>

					<View style={{ alignSelf: 'center', marginTop: 20, marginBottom: 20, }}>
						<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
							<TouchableOpacity onPress={() => cancelPayment()} style={{ backgroundColor: "red", height: 50, borderRadius: 8, width: (Dimensions.get("window").width * 40) / 100, justifyContent: "center", alignItems: "center", margin: 5 }}>
								<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => addDeposit()} disabled={paymentLoading} style={{ backgroundColor: paymentLoading ? "grey" : "green", height: 50, borderRadius: 8, width: (Dimensions.get("window").width * 40) / 100, justifyContent: "center", alignItems: "center", margin: 5 }}>
								{paymentLoading ? (
									<ActivityIndicator color={"#fff"} size={'small'} />
								) : (
									<Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Pay</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</View>
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
